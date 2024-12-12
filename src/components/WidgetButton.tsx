import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";

const WidgetButton = () => (
  <a
    className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    href="https://docs.skip.build/go/widget/getting-started"
    target="_blank"
  >
    Get the Skip:Go Widget
    <ArrowIcon />
  </a>
);

export default WidgetButton;
