import { Request, Response } from 'express';
export declare class VocabularyController {
    private vocabularyService;
    constructor();
    getMappings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMapping: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createMapping: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMapping: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteMapping: (req: Request, res: Response, next: import("express").NextFunction) => void;
    bulkUploadMappings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPatchLibrary: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getIconWall: (req: Request, res: Response, next: import("express").NextFunction) => void;
    translateVocabulary: (req: Request, res: Response, next: import("express").NextFunction) => void;
    searchBySKU: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getStatistics: (req: Request, res: Response, next: import("express").NextFunction) => void;
    exportVocabulary: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: VocabularyController;
export default _default;
//# sourceMappingURL=vocabulary.controller.d.ts.map