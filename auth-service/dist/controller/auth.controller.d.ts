import { Request, Response } from "express";
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function validate(req: Request, res: Response): Promise<void>;
export declare function refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function logout(req: Request, res: Response): Promise<void>;
export declare function getAvailableRoles(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function selectRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map