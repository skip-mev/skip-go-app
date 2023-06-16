import { FC, PropsWithChildren } from "react";

const Card: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="border border-zinc-700 rounded-lg p-6">{children}</div>
  );
};

export default Card;
