import dbService from '../config/database';
import { getUserById as getUserByIdQuery, updateUser as updateUserQuery, updateUserRole as updateUserRoleQuery } from '../queries/user.queries';

class UserService {
  async getUserById(id: number) {
    return await getUserByIdQuery(id);
  }

  async updateUser(id: number, updates: any) {
    return await updateUserQuery(id, updates);
  }

  async assignRole(userId: number, role: string) {
    await updateUserRoleQuery(userId, role);
    return { message: 'Role assigned successfully' };
  }

  async designateRole(userId: number, role: string) {
    // Alias de asignación, aquí nos aseguramos de que el rol quede asignado
    await updateUserRoleQuery(userId, role);
    return { message: 'Role designated successfully' };
  }
}

const userService = new UserService();
export default userService;
