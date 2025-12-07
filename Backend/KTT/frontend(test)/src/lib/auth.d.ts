type MaybeRecord = Record<string, unknown> | null | undefined;
export declare function extractUserId(auth: MaybeRecord): string | null;
export declare function extractEmail(auth: MaybeRecord): string | null;
export {};
