import { useEffect, useState } from "react";

export const useIsInIframe = () => {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);
  return isInIframe;
};
