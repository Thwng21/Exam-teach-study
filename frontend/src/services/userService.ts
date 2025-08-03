import { api } from './api';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy danh sách người dùng:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi cập nhật người dùng:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error) {
      console.error('Lỗi xóa người dùng:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Lỗi tạo người dùng:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
