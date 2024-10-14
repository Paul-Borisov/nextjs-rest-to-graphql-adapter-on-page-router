import { useEffect, useRef } from "react";

export const useDebounce = (
  func: Function,
  delayInMilliseconds: number = 500
) => {
  const refTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (refTimeout.current) {
        clearTimeout(refTimeout.current);
        refTimeout.current = undefined;
      }
    };
  }, []);

  return function (...args: any) {
    if (refTimeout?.current) clearTimeout(refTimeout.current);
    refTimeout.current = setTimeout(function () {
      func(...args);
    }, delayInMilliseconds);
  };
};
