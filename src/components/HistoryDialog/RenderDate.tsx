import { useMemo } from "react";

interface Props {
  date: Date | string;
}

export const RenderDate = ({ date }: Props) => {
  const [left, right] = useMemo(() => {
    const $date = new Date(date);

    const left = formatter.format($date);
    const right = $date.getFullYear();

    return [left, right];
  }, [date]);

  return (
    <>
      {left} <br /> {right}
    </>
  );
};

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
