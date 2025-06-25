import { track } from "@amplitude/analytics-browser";

import styles from "./button.module.css";
import { ThinArrowIcon } from "./ThinArrowIcon";

const DiscordButton = () => (
  <a
    className={`${styles.skipbutton} font-diatype`}
    href={"https://discord.gg/interchain"}
    target="_blank"
    onClick={() => {
      track("go app need help button - clicked");
    }}
  >
    Need Help?
    <ThinArrowIcon />
  </a>
);

export default DiscordButton;
