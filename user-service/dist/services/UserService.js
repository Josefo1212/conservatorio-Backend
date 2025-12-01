"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_queries_1 = require("../queries/user.queries");
class UserService {
    async getUserById(id) {
        return await (0, user_queries_1.getUserById)(id);
    }
    async updateUser(id, updates) {
        return await (0, user_queries_1.updateUser)(id, updates);
    }
    async assignRole(userId, role) {
        await (0, user_queries_1.updateUserRole)(userId, role);
        return { message: 'Role assigned successfully' };
    }
    async designateRole(userId, role) {
        // Alias de asignación, aquí nos aseguramos de que el rol quede asignado
        await (0, user_queries_1.updateUserRole)(userId, role);
        return { message: 'Role designated successfully' };
    }
}
const userService = new UserService();
exports.default = userService;
//# sourceMappingURL=UserService.js.map