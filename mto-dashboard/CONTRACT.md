Hi UDi
Following our discussion, here’s a detailed breakdown of the agreed MVP scope and clarifications on processes, inclusions, and exclusions to ensure a smooth delivery with no surprises. I’m doing this approach as I belive in you and in our long term relationship.
 
1. Maintenance Process & Packages (for MVP only)
Maintenance fee can be provided as an optional package after go-live:
•	Basic – $300/mo  --3 hrs/month for bug fixes & security patches. SLA: 3 business days -- 
•	Standard - $500/mo – 5 hrs/month for fixes, patches, minor UI/content changes. SLA: 2 business days 
Any new feature will charge seperatly or agreed montly payment (salary).
 
2. Onboarding Process 
Development Onboarding (Pre-Build Phase)
1.	Signing contract
2.	Share Google Drive including PO/MTO sample files, SKU lists, spot vocabulary, brand guidelines, and logos/icons.
3.	Provide credentials for required APIs, file repositories, and shared drives.
4.	Configure development, staging, and demo environments.
System Onboarding Steps
1.	Admin creates brand and factory accounts in his dashboard.
2.	Admin links them as a working relationship by clicking assignment.
3.	System sends each party a secure login link by email.
4.	Users create password and register phone.
5.	Brand uploads initial PO/MTO files and related data.
6.	Factory reviews assigned orders, configures SKUs, and updates production info.
7.	Both parties manage and track orders in real time.
 



3. Post-Go-Live 2–3 Months Later
•	Not likely, as long as maintiance active the system should work untill its realted to third party or force major. We will work traspaertnly and share updates from time to time.
 
4. Special Requirements
•	Any request outside Appendix A scope will be handled as a new feautre
•	Process: Requirement definition → Quotation → Signing Appendix → Development
•	Pricing: Fixed or salary, depending on progress 
 
55. Data Security Platform
•	Hosted on Supabase (built on secure AWS infrastructure)
•	Encryption: AES-256 at rest, TLS 1.3 in transit
•	Secure API communication using HTTPS with token-based authentication
•	Role-based access control (RBAC)
•	Separate brand/factory data segregation
 
6. Factory ERP Integration
•	Not included in MVP scope (Appendix A)
•	Can be added as a Phase 2 enhancement with separate budget & timeline
•	Requires API documentation and integration testing
 
7. MTO Rendering
•	MVP delivers icon location mapping on products (per spot)
•	Full 2D/3D rendering is not included in this phase and would require a separate scope
 


8.	Replacement MTO Process

Altpugh wasn’t caculated with original scope it will be icnlud
•	Brand System: Scan barcode → Select defect type → Generate replacement MTO → Tag as "Replacement"
•	Factory System: Receive replacement MTO → Process in production queue → Update status → Ship
 
Summary of MVP Inclusions:
✔ Brand Portal with PO/MTO upload, dashboard, barcode generation, and spot mapping
✔ Factory Portal with workboard, status tracking, and inventory alerts
✔ Admin Panel for user & company management, oversight, and exports
Per profile lang met
✔ Basic notifications and chat features
❌ No ERP integration in MVP
❌ No 2D/3D product rendering
❌ No automated replacement order workflow (manual possible)
❌ No ongoing maintenance included (optional packages available)

9.	Shipping Chat Process

•	Brand System: Track shipment → Chat with factory about delays/issues → Monitor AWB status
•	Factory System: Update shipping status → Chat with brand about logistics → Confirm delivery
•	Shared System: Real-time chat during shipping phase → Track carton/AWB → Handle missing items (10-15%)

