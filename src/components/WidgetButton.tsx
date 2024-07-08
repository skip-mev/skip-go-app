import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";

const WidgetButton = () => (
  <a
    className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    href="https://docs.skip.build/go"
    target="_blank"
  >
    Build with Skip:Go
    <ArrowIcon />
  </a>
);

export default WidgetButton;
