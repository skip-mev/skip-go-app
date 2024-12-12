import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";

const TryAPIButton = () => (
  <a
    className={`${styles.skipbutton} font-diatype`}
    href="https://docs.skip.build/go"
    target="_blank"
  >
    Try the Skip:Go API
    <ArrowIcon />
  </a>
);

export default TryAPIButton;
