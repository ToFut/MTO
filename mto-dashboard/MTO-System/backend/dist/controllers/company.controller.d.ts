import { Request, Response } from 'express';
export declare class CompanyController {
    getCompanies: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCompany: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createCompany: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateCompany: (req: Request, res: Response, next: import("express").NextFunction) => void;
    toggleCompanyStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteCompany: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const companyController: CompanyController;
//# sourceMappingURL=company.controller.d.ts.map