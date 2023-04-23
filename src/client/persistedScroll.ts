import { useEffect, useRef } from "react";

interface ScrollPos {
  top: number;
  left: number;
}

export function persistedScroll() {
  let scrollPos: ScrollPos | null = null;

  return function usePersistedScroll<R extends Element>() {
    const ref = useRef<R>(null);
    useEffect(() => {
      if (!ref.current) return;
      const element = ref.current;
      if (scrollPos) {
        element.scrollTop = scrollPos.top;
        element.scrollLeft = scrollPos.left;
      }
      const handleScroll = () => {
        scrollPos = {
          left: element.scrollLeft,
          top: element.scrollTop,
        };
      };
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }, []);

    return ref;
  };
}
