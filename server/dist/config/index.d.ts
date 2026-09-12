export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly corsOrigin: string;
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly cookie: {
        readonly name: "refreshToken";
        readonly maxAge: number;
        readonly secure: boolean;
        readonly sameSite: "lax";
    };
};
//# sourceMappingURL=index.d.ts.map