import styles from "./button.module.css";
import { ThinArrowIcon } from "./cosmos/ThinArrowIcon";

const WidgetButton = () => (
  <a
    className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    href="https://docs.skip.build/go"
    target="_blank"
  >
    Build with Skip:Go
    <ThinArrowIcon />
  </a>
);

export default WidgetButton;
