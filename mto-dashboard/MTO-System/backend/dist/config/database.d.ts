import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
declare class DatabaseConfig {
    private static instance;
    private supabase;
    private constructor();
    static getInstance(): DatabaseConfig;
    getClient(): SupabaseClient<Database>;
    testConnection(): Promise<boolean>;
}
export declare const db: SupabaseClient<Database, "public", any>;
export default DatabaseConfig;
//# sourceMappingURL=database.d.ts.map