import { RegisterPayload } from '../queries/register.queries';
export declare class AuthService {
    login(cedula: string, password: string, ipOrigen: string): Promise<{
        accessToken: string;
        refreshToken: string;
        refreshExp: Date;
        userId: any;
        rol: any;
        nombres: any;
        apellidos: any;
        correo: any;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    forgotPassword(cedula: string): Promise<boolean>;
    resetPassword(cedula: string, newPassword: string): Promise<void>;
    register(payload: Omit<RegisterPayload, 'password'> & {
        password: string;
    }): Promise<{
        id_usuario: number;
    }>;
}
declare const authService: AuthService;
export default authService;
//# sourceMappingURL=AuthService.d.ts.map