export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare const generatePaginationMeta: (total: number, page: number, limit: number) => PaginationMeta;
export declare const parsePaginationParams: (query: Record<string, unknown>) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const generateResetToken: () => string;
//# sourceMappingURL=helpers.d.ts.map