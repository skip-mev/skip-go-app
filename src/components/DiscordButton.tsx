import { isCosmosDomain } from "@/pages";

import ArrowIcon from "./ArrowIcon";
import styles from "./button.module.css";
import cosmosStyles from "./cosmos/cosmos.module.css";
import { ThinArrowIcon } from "./cosmos/ThinArrowIcon";
import { track } from "@/lib/amplitude";

const DiscordButton = () => (
  <a
    className={`${isCosmosDomain ? cosmosStyles.cosmosbutton : styles.skipbutton} font-diatype`}
    href={isCosmosDomain ? "https://discord.gg/interchain" : "https://skip.build/discord"}
    target="_blank"
    onClick={() => track("connect eco row: help button - clicked")}
  >
    Need Help?
    {isCosmosDomain ? <ThinArrowIcon /> : <ArrowIcon />}
  </a>
);

export default DiscordButton;
