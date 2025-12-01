declare class UserService {
    getUserById(id: number): Promise<any>;
    updateUser(id: number, updates: any): Promise<{
        message: string;
    }>;
    assignRole(userId: number, role: string): Promise<{
        message: string;
    }>;
    designateRole(userId: number, role: string): Promise<{
        message: string;
    }>;
}
declare const userService: UserService;
export default userService;
//# sourceMappingURL=UserService.d.ts.map