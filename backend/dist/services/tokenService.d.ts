export interface TokenPayload {
    id: string;
    email: string;
    role: string;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => TokenPayload;
export declare const saveRefreshToken: (userId: string, token: string) => Promise<void>;
export declare const findRefreshToken: (token: string) => Promise<({
    user: {
        id: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: string;
        avatar: string | null;
        isActive: boolean;
        resetToken: string | null;
        resetTokenExpiry: Date | null;
        deletedAt: Date | null;
        updatedAt: Date;
    };
} & {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    userId: string;
}) | null>;
export declare const deleteRefreshToken: (token: string) => Promise<void>;
export declare const deleteUserRefreshTokens: (userId: string) => Promise<void>;
//# sourceMappingURL=tokenService.d.ts.map