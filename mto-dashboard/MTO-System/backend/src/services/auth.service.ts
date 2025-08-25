import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';
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

export class AuthService {
  private generateToken(userId: string, role: string): string {
    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT_SECRET not configured', 500);
    }

    const payload = { userId, role };
    const secret = process.env.JWT_SECRET as string;
    
    return jwt.sign(payload, secret, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    } as jwt.SignOptions);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(userData: Omit<CreateUserData, 'password_hash'> & { password: string }): Promise<AuthResponse> {
    try {
      const { password, ...userDataWithoutPassword } = userData;

      // Check if user already exists
      const { data: existingUser } = await db
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password
      const password_hash = await this.hashPassword(password);

      // Create user
      const { data: newUser, error } = await db
        .from('users')
        .insert({
          ...userDataWithoutPassword,
          password_hash,
        })
        .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
        .single();

      if (error) {
        logger.error('Failed to create user:', error);
        throw new AppError('Failed to create user', 500);
      }

      if (!newUser) {
        throw new AppError('User creation failed', 500);
      }

      // Generate token
      const token = this.generateToken(newUser.id, newUser.role);

      // Update last login
      await db
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', newUser.id);

      return {
        user: newUser,
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration error:', error);
      throw new AppError('Registration failed', 500);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // TEMPORARY: Demo user authentication (bypass database)
      if (email === 'brand@brand.com' && password === 'brand123') {
        const demoUser: Omit<User, 'password_hash'> = {
          id: 'demo-brand-user-id',
          email: 'brand@brand.com',
          full_name: 'Brand Demo User',
          role: 'brand_manager',
          company_id: 'a0560528-ac53-4dd7-ac9c-92d3e90addf0', // Real company ID
          language: 'en',
          avatar_url: null,
          phone: null,
          preferences: {},
          last_login: new Date().toISOString(),
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const token = this.generateToken(demoUser.id, demoUser.role);
        
        logger.info(`Demo user logged in: ${email}`);
        
        return {
          user: demoUser,
          token,
        };
      }

      // TEMPORARY: Demo factory user authentication
      if (email === 'factory@factory.com' && password === 'factory123') {
        const demoUser: Omit<User, 'password_hash'> = {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          email: 'factory@factory.com',
          full_name: 'Factory Demo User',
          role: 'factory_operator',
          company_id: 'b1234567-89ab-cdef-0123-456789abcdef',
          language: 'en',
          avatar_url: null,
          phone: null,
          preferences: {},
          last_login: new Date().toISOString(),
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const token = this.generateToken(demoUser.id, demoUser.role);
        
        logger.info(`Demo factory user logged in: ${email}`);
        
        return {
          user: demoUser,
          token,
        };
      }

      // TEMPORARY: Demo admin user authentication
      if (email === 'admin@admin.com' && password === 'admin123') {
        const demoUser: Omit<User, 'password_hash'> = {
          id: 'admin-demo-user-id-12345',
          email: 'admin@admin.com',
          full_name: 'Admin Demo User',
          role: 'admin',
          company_id: null,
          language: 'en',
          avatar_url: null,
          phone: null,
          preferences: {},
          last_login: new Date().toISOString(),
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const token = this.generateToken(demoUser.id, demoUser.role);
        
        logger.info(`Demo admin user logged in: ${email}`);
        
        return {
          user: demoUser,
          token,
        };
      }

      // Find user with password hash
      const { data: user, error } = await db
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (error || !user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isValidPassword = await this.comparePassword(password, user.password_hash);
      
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = this.generateToken(user.id, user.role);

      // Update last login
      await db
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError('Login failed', 500);
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      const { data: user, error } = await db
        .from('users')
        .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
        .eq('id', userId)
        .eq('active', true)
        .single();

      if (error) {
        logger.error('Failed to get user by ID:', error);
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Get user error:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      const { data: user, error } = await db
        .from('users')
        .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
        .eq('email', email)
        .eq('active', true)
        .single();

      if (error) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Get user by email error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: Partial<Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'>>): Promise<Omit<User, 'password_hash'>> {
    try {
      const { data: updatedUser, error } = await db
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select(`
          id, email, full_name, role, company_id, language, avatar_url, 
          phone, preferences, last_login, active, created_at, updated_at
        `)
        .single();

      if (error || !updatedUser) {
        logger.error('Failed to update user:', error);
        throw new AppError('Failed to update user', 500);
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update user error:', error);
      throw new AppError('Failed to update user', 500);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with password hash
      const { data: user, error } = await db
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password_hash);
      
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      const { error: updateError } = await db
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId);

      if (updateError) {
        logger.error('Failed to update password:', updateError);
        throw new AppError('Failed to update password', 500);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Change password error:', error);
      throw new AppError('Password change failed', 500);
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await db
        .from('users')
        .update({ active: false })
        .eq('id', userId);

      if (error) {
        logger.error('Failed to deactivate user:', error);
        throw new AppError('Failed to deactivate user', 500);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Deactivate user error:', error);
      throw new AppError('User deactivation failed', 500);
    }
  }

  verifyToken(token: string): { userId: string; role: string } | null {
    try {
      if (!process.env.JWT_SECRET) {
        throw new AppError('JWT_SECRET not configured', 500);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
      
      if (typeof decoded === 'object' && decoded.userId && decoded.role) {
        return {
          userId: decoded.userId,
          role: decoded.role,
        };
      }

      return null;
    } catch (error) {
      logger.error('Token verification error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();