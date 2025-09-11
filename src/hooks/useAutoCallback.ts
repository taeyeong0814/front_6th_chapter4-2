import { useCallback, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAutoCallback = <T extends (...args: any[]) => any>(
  callback: T
) => {
  const ref = useRef(callback);

  ref.current = callback;

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return ref.current(...args);
  }, []);
};
