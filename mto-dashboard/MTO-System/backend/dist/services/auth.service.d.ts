import { Database } from '../types/database.types';
type User = Database['public']['Tables']['users']['Row'];
type CreateUserData = Database['public']['Tables']['users']['Insert'];
interface LoginCredentials {
    email: string;
    password: string;
}
interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
    refreshToken?: string;
}
export declare class AuthService {
    private generateToken;
    private hashPassword;
    private comparePassword;
    register(userData: Omit<CreateUserData, 'password_hash'> & {
        password: string;
    }): Promise<AuthResponse>;
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null>;
    getUserByEmail(email: string): Promise<Omit<User, 'password_hash'> | null>;
    updateUser(userId: string, updateData: Partial<Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'>>): Promise<Omit<User, 'password_hash'>>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    deactivateUser(userId: string): Promise<void>;
    verifyToken(token: string): {
        userId: string;
        role: string;
    } | null;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map