import { track } from "@amplitude/analytics-browser";

import styles from "./button.module.css";
import { ThinArrowIcon } from "./cosmos/ThinArrowIcon";

const WidgetButton = () => (
  <a
    className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    href="https://docs.skip.build/go"
    target="_blank"
    onClick={() => {
      track("button clicked: build with skip go button");
    }}
  >
    Build with Skip:Go
    <ThinArrowIcon />
  </a>
);

export default WidgetButton;
