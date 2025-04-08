import { isCosmosDomain } from "@/pages";

import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";
import cosmosStyles from "./cosmos/cosmos.module.css";
import { ThinArrowIcon } from "./cosmos/ThinArrowIcon";

const DiscordButton = () => (
  <a
    className={`${isCosmosDomain ? cosmosStyles.cosmosbutton : styles.skipbutton} font-diatype`}
    href={isCosmosDomain ? "https://discord.gg/interchain" : "https://skip.build/discord"}
    target="_blank"
  >
    Need Help?
    {isCosmosDomain ? <ThinArrowIcon /> : <ArrowIcon />}
  </a>
);

export default DiscordButton;
