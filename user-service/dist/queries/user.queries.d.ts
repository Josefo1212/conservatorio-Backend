export declare function getUserById(id: number): Promise<any>;
export declare function updateUser(id: number, updates: any): Promise<{
    message: string;
}>;
export declare function updateUserRole(userId: number, roleName: string): Promise<void>;
export declare function getRoleId(roleName: string): Promise<any>;
export declare function assignUserRole(userId: number, roleId: number): Promise<void>;
//# sourceMappingURL=user.queries.d.ts.map