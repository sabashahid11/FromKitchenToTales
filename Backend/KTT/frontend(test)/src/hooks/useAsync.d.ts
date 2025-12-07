export declare function useAsync<T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>): {
    execute: (...args: Args) => Promise<T>;
    reset: () => void;
    data: T | null;
    error: string | null;
    loading: boolean;
};
