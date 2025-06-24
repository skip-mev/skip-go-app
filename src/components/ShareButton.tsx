import { useState } from "react";

import { isCosmosDomain } from "@/pages";

import styles from "./button.module.css";
import cosmosStyles from "./cosmos/cosmos.module.css";
import { ShareIcon } from "./ShareIcon";

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
      className={`${isCosmosDomain ? cosmosStyles.cosmosbutton : styles.skipbutton} ${styles.widgetButton} font-diatype`}
    >
      {isShowingCopyToClipboardFeedback ? "Link Copied!" : "Share this route"}
      <ShareIcon color="black" />
    </button>
  );
};

export default ShareButton;
