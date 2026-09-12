import { Role } from '@prisma/client';
interface SafeUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string | null;
}
export declare function register(data: {
    name: string;
    email: string;
    password: string;
}): Promise<{
    accessToken: string;
    user: SafeUser;
}>;
export declare function login(data: {
    email: string;
    password: string;
}, res: {
    cookie: (name: string, value: string, options: any) => void;
}): Promise<{
    accessToken: string;
    user: SafeUser;
}>;
export declare function refresh(req: {
    cookies: Record<string, string | undefined>;
}, res: {
    cookie: (name: string, value: string, options: any) => void;
}): Promise<{
    accessToken: string;
}>;
export declare function logout(req: {
    cookies: Record<string, string | undefined>;
}, res: {
    cookie: (name: string, value: string, options: any) => void;
}): Promise<void>;
export declare function me(userId: string): Promise<SafeUser>;
export {};
//# sourceMappingURL=service.d.ts.map