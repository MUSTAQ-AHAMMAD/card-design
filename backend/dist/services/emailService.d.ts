interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare const sendEmail: (options: SendEmailOptions) => Promise<void>;
export declare const sendGiftCardEmail: (giftCard: {
    id: string;
    amount: number;
    occasion: string;
    message?: string | null;
    employee: {
        firstName: string;
        lastName: string;
        email: string;
    };
}, recipientEmail: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, resetToken: string) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map