import { useEffect, useRef, useState } from "react";

export function useScrollPercentage<T extends Element>(
  direction: "horizontal" | "vertical"
) {
  const elementRef = useRef<T>(null);
  // null if not scrollable
  const [scrollPercentage, setScrollPercentage] = useState<number | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    const handleScroll = () => {
      const { width, height } = element.getBoundingClientRect();
      if (direction == "horizontal") {
        const totalScroll = element.scrollWidth - width;

        if (totalScroll == 0) {
          setScrollPercentage(null);
        } else {
          setScrollPercentage(element.scrollLeft / totalScroll);
        }
      } else {
        const totalScroll = element.scrollHeight - height;

        if (totalScroll == 0) {
          setScrollPercentage(null);
        } else {
          setScrollPercentage(element.scrollHeight / totalScroll);
        }
      }
    };
    handleScroll();
    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [direction]);

  return [elementRef, scrollPercentage] as const;
}
