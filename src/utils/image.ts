import { SyntheticEvent } from "react";

export const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg";
};
