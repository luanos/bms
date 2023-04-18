import s from "./FilterList.module.scss";
import { EpArrowRightBold } from "../Icons";
import { mergeRefs } from "~/client/mergeRefs";
import { persistedScroll } from "~/client/persistedScroll";
import { useScrollPercentage } from "~/client/useScrollPercentage";
import * as ToggleGroup from "~/components/BaseUI/ToggleGroup";

interface FilterListProps {
  filters: { value: string; display: string }[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

const usePersistedScroll = persistedScroll();

export function FilterList({
  filters,
  onFilterChange,
  activeFilter,
}: FilterListProps) {
  const [ref1, percentage] = useScrollPercentage<HTMLDivElement>("horizontal");
  const ref2 = usePersistedScroll();
  return (
    <ToggleGroup.Root
      type="single"
      className={s.root}
      value={activeFilter}
      ref={mergeRefs([ref1, ref2])}
      onValueChange={onFilterChange}
    >
      {filters.map((filter) => (
        <ToggleGroup.Item value={filter.value} key={filter.value}>
          {filter.display}
        </ToggleGroup.Item>
      ))}
      {typeof percentage == "number" && (
        <>
          <button
            className={s.chevronLeft}
            data-visible={percentage > 0}
            onClick={() => {
              ref1.current?.scrollBy({
                left: -225,
                behavior: "smooth",
              });
            }}
            aria-label="Filter-Optionen nach links scrollen"
          >
            <EpArrowRightBold />
          </button>
          <button
            className={s.chevronRight}
            data-visible={percentage < 1}
            onClick={() => {
              ref1.current?.scrollBy({
                left: 225,
                behavior: "smooth",
              });
            }}
            aria-label="Filter-Optionen nach rechts scrollen"
          >
            <EpArrowRightBold />
          </button>
        </>
      )}
    </ToggleGroup.Root>
  );
}
