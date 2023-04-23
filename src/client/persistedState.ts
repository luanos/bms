import { atom, useAtom } from "jotai";

export function persistedState<S>(initialState: S) {
  const a = atom(initialState);
  return () => useAtom(a);
}
