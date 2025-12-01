import { Request, Response } from "express";
import userService from "../services/UserService";


export async function getUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(Number(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    } catch (error: any) {
        console.error('GET USER ERROR:', error);
        return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const result: any = await userService.updateUser(Number(id), updates);
        res.json(result);
    } catch (error: any) {
        console.error('UPDATE USER ERROR:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}

export async function assignRole(req: Request, res: Response) {
    try {
        const { userId, role } = req.body;
        const result = await userService.assignRole(userId, role);
        return res.json(result);
    } catch (error: any) {
        console.error('ASSIGN ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error assigning role', error: error.message });
    }
}

export async function designateRole(req: Request, res: Response) {
    try {
        const authUser = (req as any).user;
        if (!authUser || !['personal', 'master'].includes(authUser.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: se requiere rol personal o master' });
        }
        const { userId, role } = req.body;
        const result = await userService.designateRole(Number(userId), role);
        return res.json(result);
    } catch (error: any) {
        console.error('DESIGNATE ROLE ERROR:', error);
        return res.status(500).json({ message: 'Error designating role', error: error.message });
    }
}
