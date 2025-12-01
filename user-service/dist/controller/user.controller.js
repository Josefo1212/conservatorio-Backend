"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.assignRole = assignRole;
exports.designateRole = designateRole;
const UserService_1 = __importDefault(require("../services/UserService"));
async function getUser(req, res) {
    try {
        const { id } = req.params;
        const user = await UserService_1.default.getUserById(Number(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        console.error('GET USER ERROR:', error);
        return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const result = await UserService_1.default.updateUser(Number(id), updates);
        res.json(result);
    }
    catch (error) {
        console.error('UPDATE USER ERROR:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}
async function assignRole(req, res) {
    try {
        const { userId, role } = req.body;
        const result = await UserService_1.default.assignRole(userId, role);
        return res.json(result);
    }
    catch (error) {
        console.error('ASSIGN ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error assigning role', error: error.message });
    }
}
async function designateRole(req, res) {
    try {
        const authUser = req.user;
        if (!authUser || !['personal', 'master'].includes(authUser.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: se requiere rol personal o master' });
        }
        const { userId, role } = req.body;
        const result = await UserService_1.default.designateRole(Number(userId), role);
        return res.json(result);
    }
    catch (error) {
        console.error('DESIGNATE ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error designating role', error: error.message });
    }
}
//# sourceMappingURL=user.controller.js.map