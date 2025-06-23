import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";
import { track } from "@/lib/amplitude";

const WidgetButton = () => (
  <a
    className={`${styles.skipbutton} ${styles.widgetButton} font-diatype`}
    href="https://docs.skip.build/go"
    target="_blank"
    onClick={() => track("connect eco row: docs button - clicked")}
  >
    Build with Skip:Go
    <ArrowIcon />
  </a>
);

export default WidgetButton;
