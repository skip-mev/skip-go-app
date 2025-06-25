import { track } from "@amplitude/analytics-browser";

import styles from "./button.module.css";
import { ThinArrowIcon } from "./ThinArrowIcon";

const WidgetButton = () => (
  <a
    className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    href="https://docs.skip.build/go"
    target="_blank"
    onClick={() => {
      track("go app build with skip go button - clicked");
    }}
  >
    Build with Skip:Go
    <ThinArrowIcon />
  </a>
);

export default WidgetButton;
