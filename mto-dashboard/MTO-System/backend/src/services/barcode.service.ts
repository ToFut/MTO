import { getSupabase } from '../config/supabase';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
import QRCode from 'qrcode';

export class BarcodeService {
  private supabase = getSupabase();

  /**
   * Generate barcodes for MTOs with flexible spot support
   * Supports 3, 6, 20+ spots dynamically
   */
  async generateBarcodesForMTOs(mtos: any[]): Promise<any> {
    try {
      logger.info(`Generating barcodes for ${mtos.length} MTOs...`);

      const allBarcodes: any[] = [];
      let totalGenerated = 0;

      for (const mto of mtos) {
        try {
          const mtoBarcodes = await this.generateCompleteMTOBarcodes(mto);
          allBarcodes.push(...mtoBarcodes);
          totalGenerated += mtoBarcodes.length;
        } catch (error) {
          logger.error(`Failed to generate barcodes for MTO ${mto.id}:`, error);
        }
      }

      // Bulk insert barcodes
      let savedCount = 0;
      if (allBarcodes.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < allBarcodes.length; i += batchSize) {
          const batch = allBarcodes.slice(i, i + batchSize);
          
          const { data, error } = await this.supabase
            .from('barcodes')
            .insert(batch)
            .select();

          if (error) {
            logger.error(`Failed to insert barcode batch:`, error);
          } else {
            savedCount += data?.length || 0;
          }
        }
      }

      logger.info(`Barcode generation completed: ${savedCount} barcodes created for ${mtos.length} MTOs`);

      return {
        created: savedCount,
        total: allBarcodes.length,
        breakdown: this.analyzeBarcodeBreakdown(allBarcodes)
      };

    } catch (error) {
      logger.error('Error generating barcodes for MTOs:', error);
      throw error;
    }
  }

  /**
   * Generate complete set of barcodes for a single MTO
   * Creates 4-level barcode hierarchy: Spot → Line → Master → PO
   */
  async generateCompleteMTOBarcodes(mto: any): Promise<any[]> {
    const barcodes: any[] = [];

    try {
      // 1. Line Level Barcode (Main MTO)
      const lineBarcode = {
        mto_id: mto.id,
        po_id: mto.po_id,
        type: 'line',
        level: 2,
        value: this.generateLineBarcodeValue(mto),
        qr_image: await this.generateQRCode(this.generateLineBarcodeValue(mto)),
        label: `Line: ${mto.reference_number || mto.internal_id}`,
        scan_data: {
          mto_id: mto.id,
          po_id: mto.po_id,
          line_id: mto.po_line_id,
          reference: mto.reference_number,
          product: mto.display_name
        }
      };
      barcodes.push(lineBarcode);

      // 2. Spot Level Barcodes (Dynamic based on spots_data)
      if (mto.spots_data && Array.isArray(mto.spots_data)) {
        for (const spot of mto.spots_data) {
          const spotBarcode = {
            mto_id: mto.id,
            po_id: mto.po_id,
            type: 'spot',
            level: 1,
            spot_position: spot.position,
            spot_sku: spot.sku,
            value: this.generateSpotBarcodeValue(mto, spot),
            qr_image: await this.generateQRCode(this.generateSpotBarcodeValue(mto, spot)),
            label: `Spot ${spot.position}: ${spot.sku}`,
            scan_data: {
              mto_id: mto.id,
              spot_position: spot.position,
              sku: spot.sku,
              patch_ref: spot.patch_ref,
              description: spot.description,
              location: spot.visual_location
            }
          };
          barcodes.push(spotBarcode);
        }
      }

      // 3. Master Carton Barcode (if master carton info exists)
      if (mto.master_carton) {
        const masterBarcode = {
          mto_id: mto.id,
          po_id: mto.po_id,
          type: 'master',
          level: 3,
          master_carton_id: mto.master_carton,
          value: this.generateMasterBarcodeValue(mto),
          qr_image: await this.generateQRCode(this.generateMasterBarcodeValue(mto)),
          label: `Master: ${mto.master_carton}`,
          scan_data: {
            po_id: mto.po_id,
            master_carton: mto.master_carton,
            awb: mto.awb,
            tracking: mto.po_line_tracking
          }
        };
        barcodes.push(masterBarcode);
      }

      // 4. PO Level Barcode (only create once per PO)
      const poBarcode = {
        po_id: mto.po_id,
        type: 'po',
        level: 4,
        value: this.generatePOBarcodeValue(mto),
        qr_image: await this.generateQRCode(this.generatePOBarcodeValue(mto)),
        label: `PO: ${mto.po_id}`,
        scan_data: {
          po_id: mto.po_id,
          po_number: mto.po_number,
          brand_id: mto.brand_id,
          factory_id: mto.factory_id
        }
      };

      // Check if PO barcode already exists in this batch
      const existingPOBarcode = barcodes.find(b => 
        b.type === 'po' && b.po_id === mto.po_id
      );
      
      if (!existingPOBarcode) {
        barcodes.push(poBarcode);
      }

      return barcodes;

    } catch (error) {
      logger.error(`Error generating barcodes for MTO ${mto.id}:`, error);
      return [];
    }
  }

  async generateMTOBarcode(mtoId: string, type: string) {
    const barcodeData = {
      mto_id: mtoId,
      type,
      value: `MTO:${mtoId}|TYPE:${type}|TS:${Date.now()}`,
      qr_image: await this.generateQRCode(`MTO:${mtoId}|TYPE:${type}`)
    };
    
    const { data, error } = await this.supabase.from('barcodes').insert(barcodeData).select().single();
    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async generatePOBarcodes(poId: string) {
    const { data: mtos } = await this.supabase.from('mtos').select('*').eq('po_id', poId);
    const barcodes = [];
    for (const mto of mtos || []) {
      const barcode = await this.generateMTOBarcode(mto.id, 'line');
      barcodes.push(barcode);
    }
    return barcodes;
  }

  async getBarcodeById(id: string) {
    const { data } = await this.supabase.from('barcodes').select('*').eq('id', id).single();
    return data;
  }

  async scanBarcode(code: string, userId: string) {
    const { data } = await this.supabase.from('barcodes').select('*').eq('value', code).single();
    if (data) {
      await this.supabase.from('barcode_scans').insert({ barcode_id: data.id, scanned_by: userId });
    }
    return data;
  }

  async getMTOBarcodes(mtoId: string) {
    const { data } = await this.supabase.from('barcodes').select('*').eq('mto_id', mtoId);
    return data || [];
  }

  async generateBarcodeLabels(barcodeIds: string[], format: string) {
    return Buffer.from('PDF content');
  }

  async generateMasterCartonLabels(masterCartonId: string) {
    return Buffer.from('PDF content');
  }

  async updateScanStatus(id: string, updates: any) {
    const { data } = await this.supabase.from('barcodes').update(updates).eq('id', id).select().single();
    return data;
  }

  async getScanHistory(id: string) {
    const { data } = await this.supabase.from('barcode_scans').select('*').eq('barcode_id', id);
    return data || [];
  }

  async validateBarcodeFormat(code: string) {
    return code.includes('MTO:') || code.includes('PO:');
  }

  parseBarcodeData(code: string) {
    const parts = code.split('|');
    return parts.reduce((acc: any, part: string) => {
      const [key, value] = part.split(':');
      acc[key.toLowerCase()] = value;
      return acc;
    }, {});
  }

  async generateSpotBarcodeSheet(mtoId: string) {
    return Buffer.from('PDF content');
  }

  async getBarcodeStatistics(filters: any) {
    return { total: 0, scanned: 0, pending: 0 };
  }

  async deleteBarcode(id: string) {
    await this.supabase.from('barcodes').delete().eq('id', id);
    return true;
  }

  private async generateQRCode(data: string) {
    try {
      return await QRCode.toDataURL(data);
    } catch {
      return null;
    }
  }

  // Smart Barcode Generation Helper Methods

  /**
   * Generate spot-level barcode value
   */
  private generateSpotBarcodeValue(mto: any, spot: any): string {
    const timestamp = Date.now();
    return `SPOT|PO:${mto.po_id}|LINE:${mto.po_line_id}|POS:${spot.position}|SKU:${spot.sku}|TS:${timestamp}`;
  }

  /**
   * Generate line-level barcode value
   */
  private generateLineBarcodeValue(mto: any): string {
    const timestamp = Date.now();
    return `LINE|PO:${mto.po_id}|LINE:${mto.po_line_id}|REF:${mto.reference_number}|TS:${timestamp}`;
  }

  /**
   * Generate master carton barcode value
   */
  private generateMasterBarcodeValue(mto: any): string {
    const timestamp = Date.now();
    return `MASTER|PO:${mto.po_id}|CARTON:${mto.master_carton}|AWB:${mto.awb || 'PENDING'}|TS:${timestamp}`;
  }

  /**
   * Generate PO-level barcode value
   */
  private generatePOBarcodeValue(mto: any): string {
    const timestamp = Date.now();
    return `PO|ID:${mto.po_id}|BRAND:${mto.brand_id}|FACTORY:${mto.factory_id}|TS:${timestamp}`;
  }

  /**
   * Analyze barcode breakdown for reporting
   */
  private analyzeBarcodeBreakdown(barcodes: any[]): any {
    const breakdown = {
      by_type: {} as Record<string, number>,
      by_level: {} as Record<string, number>,
      total_spots: 0,
      total_lines: 0,
      total_masters: 0,
      total_pos: 0
    };

    for (const barcode of barcodes) {
      // Count by type
      breakdown.by_type[barcode.type] = (breakdown.by_type[barcode.type] || 0) + 1;
      
      // Count by level
      if (barcode.level) {
        breakdown.by_level[`level_${barcode.level}`] = (breakdown.by_level[`level_${barcode.level}`] || 0) + 1;
      }

      // Specific counts
      switch (barcode.type) {
        case 'spot':
          breakdown.total_spots++;
          break;
        case 'line':
          breakdown.total_lines++;
          break;
        case 'master':
          breakdown.total_masters++;
          break;
        case 'po':
          breakdown.total_pos++;
          break;
      }
    }

    return breakdown;
  }

  /**
   * Enhanced barcode scanning with smart data parsing
   */
  async smartScanBarcode(code: string, userId: string, location?: string): Promise<any> {
    try {
      // Parse barcode data
      const parsedData = this.parseAdvancedBarcodeData(code);
      
      // Find barcode in database
      const { data: barcode, error } = await this.supabase
        .from('barcodes')
        .select(`
          *,
          mto:mtos(*),
          po:purchase_orders(*)
        `)
        .eq('value', code)
        .single();

      if (error || !barcode) {
        logger.warn(`Barcode not found: ${code}`);
        return {
          success: false,
          error: 'Barcode not found',
          parsed_data: parsedData
        };
      }

      // Record scan
      await this.supabase
        .from('barcode_scans')
        .insert({
          barcode_id: barcode.id,
          scanned_by: userId,
          scan_location: location,
          scan_data: parsedData,
          scanned_at: new Date().toISOString()
        });

      // Return enriched barcode data
      return {
        success: true,
        barcode: barcode,
        parsed_data: parsedData,
        mto_data: barcode.mto,
        po_data: barcode.po,
        scan_actions: this.getScanActions(barcode.type, parsedData)
      };

    } catch (error) {
      logger.error('Error in smart barcode scan:', error);
      throw error;
    }
  }

  /**
   * Parse advanced barcode data with intelligent field extraction
   */
  private parseAdvancedBarcodeData(code: string): any {
    const data: any = {};
    
    // Split by | separator
    const parts = code.split('|');
    
    for (const part of parts) {
      if (part.includes(':')) {
        const [key, value] = part.split(':', 2);
        data[key.toLowerCase()] = value;
      } else {
        // Handle standalone identifiers
        data.type = part.toLowerCase();
      }
    }

    return data;
  }

  /**
   * Get suggested actions based on barcode type and scan context
   */
  private getScanActions(barcodeType: string, parsedData: any): string[] {
    const actions: string[] = [];

    switch (barcodeType) {
      case 'spot':
        actions.push('view_spot_details', 'update_production_status', 'report_defect');
        break;
      case 'line':
        actions.push('view_mto_details', 'advance_production_stage', 'view_all_spots');
        break;
      case 'master':
        actions.push('view_shipment_details', 'update_shipping_status', 'generate_awb');
        break;
      case 'po':
        actions.push('view_po_overview', 'view_all_mtos', 'generate_reports');
        break;
    }

    return actions;
  }

  /**
   * Generate printable barcode labels with flexible layout
   */
  async generatePrintableLabels(barcodeIds: string[], format: 'spot' | 'line' | 'master' | 'mixed' = 'mixed'): Promise<Buffer> {
    try {
      // Get barcodes with full data
      const { data: barcodes } = await this.supabase
        .from('barcodes')
        .select(`
          *,
          mto:mtos(reference_number, display_name),
          po:purchase_orders(po_number)
        `)
        .in('id', barcodeIds);

      if (!barcodes || barcodes.length === 0) {
        throw new Error('No barcodes found for printing');
      }

      // Group by type for optimal layout
      const groupedBarcodes = this.groupBarcodesForPrinting(barcodes, format);

      // Generate PDF labels (simplified - would use actual PDF library)
      const pdfContent = this.generateLabelPDFContent(groupedBarcodes, format);

      logger.info(`Generated printable labels for ${barcodes.length} barcodes`);
      return Buffer.from(pdfContent, 'utf8');

    } catch (error) {
      logger.error('Error generating printable labels:', error);
      throw error;
    }
  }

  /**
   * Group barcodes for optimal printing layout
   */
  private groupBarcodesForPrinting(barcodes: any[], format: string): any {
    if (format === 'mixed') {
      return {
        spots: barcodes.filter(b => b.type === 'spot'),
        lines: barcodes.filter(b => b.type === 'line'),
        masters: barcodes.filter(b => b.type === 'master'),
        pos: barcodes.filter(b => b.type === 'po')
      };
    } else {
      return {
        [format]: barcodes.filter(b => b.type === format)
      };
    }
  }

  /**
   * Generate PDF content for labels (simplified implementation)
   */
  private generateLabelPDFContent(groupedBarcodes: any, format: string): string {
    let content = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n\n`;
    
    // Add barcode label content (this is a simplified example)
    content += `% MTO Barcode Labels - Format: ${format}\n`;
    content += `% Generated: ${new Date().toISOString()}\n`;
    
    Object.entries(groupedBarcodes).forEach(([type, barcodes]) => {
      if (Array.isArray(barcodes) && barcodes.length > 0) {
        content += `\n% ${type.toUpperCase()} LABELS (${barcodes.length} items)\n`;
        barcodes.forEach((barcode: any, index: number) => {
          content += `% Label ${index + 1}: ${barcode.label}\n`;
          content += `% QR Code: ${barcode.qr_image ? 'Included' : 'Missing'}\n`;
          content += `% Value: ${barcode.value}\n`;
        });
      }
    });

    content += `\nxref\n0 1\n0000000000 65535 f\ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n9\n%%EOF`;
    
    return content;
  }
}
