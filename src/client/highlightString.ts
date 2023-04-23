type HighlightedString = { val: string; em: boolean }[];

export function highlightString(
  str: string,
  indexRanges: readonly [number, number][]
) {
  let currentIndex = 0;
  let result: HighlightedString = [];
  for (let [start, end] of indexRanges) {
    if (currentIndex < start) {
      result.push({
        val: str.substring(currentIndex, start),
        em: false,
      });
    }

    currentIndex = end + 1;
    result.push({ val: str.substring(start, currentIndex), em: true });
  }

  if (currentIndex < str.length) {
    result.push({
      val: str.substring(currentIndex, str.length),
      em: false,
    });
  }
  return result;
}
