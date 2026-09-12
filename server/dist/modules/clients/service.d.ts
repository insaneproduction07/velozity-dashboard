interface SafeClient {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare function getClients(): Promise<SafeClient[]>;
export declare function createClient(data: {
    name: string;
    email?: string | null;
    company?: string | null;
}): Promise<SafeClient>;
export {};
//# sourceMappingURL=service.d.ts.map