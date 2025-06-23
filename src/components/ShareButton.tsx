import { useState } from "react";

import { isCosmosDomain } from "@/pages";
import { track } from "@/lib/amplitude";

import styles from "./button.module.css";
import cosmosStyles from "./cosmos/cosmos.module.css";

const ShareButton = ({ onClick }: { onClick?: () => void }) => {
  const [isShowingCopyToClipboardFeedback, setIsShowingCopyToClipboardFeedback] = useState(false);

  const handleOnClick = () => {
    onClick?.();
    track("connect eco row: share button - clicked");
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
    </button>
  );
};

export default ShareButton;
