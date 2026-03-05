import { Request, Response, NextFunction } from 'express';
export declare const listEmailTemplates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createEmailTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEmailTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEmailTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendTestEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEmailLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=emailController.d.ts.map