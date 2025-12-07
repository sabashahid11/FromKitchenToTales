import { useCallback, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useAsync<T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: false });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, error: null, loading: true });
      try {
        const data = await fn(...args);
        setState({ data, error: null, loading: false });
        return data;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ data: null, error: message, loading: false });
        throw error;
      }
    },
    [fn]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, execute, reset };
}
