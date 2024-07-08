import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";

const DiscordButton = () => (
  <a
    className={`${styles.skipbutton} font-diatype`}
    href="https://skip.build/discord"
    target="_blank"
  >
    Need Help?
    <ArrowIcon />
  </a>
);

export default DiscordButton;
