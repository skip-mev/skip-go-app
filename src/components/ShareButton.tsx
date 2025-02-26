import { useState } from "react";

import styles from "./button.module.css";

const ShareButton = ({ onClick }: { onClick?: () => void }) => {
  const [isShowingCopyToClipboardFeedback, setIsShowingCopyToClipboardFeedback] = useState(false);

  const handleOnClick = () => {
    onClick?.();
    setIsShowingCopyToClipboardFeedback(true);
    setTimeout(() => {
      setIsShowingCopyToClipboardFeedback(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleOnClick}
      className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    >
      {isShowingCopyToClipboardFeedback ? "Copied!" : "Share"}
    </button>
  )
};

export default ShareButton;
