import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatAddress,
  getStargateClientForChainID,
  useChainByID,
} from "@/utils/utils";
import { ethers } from "ethers";

interface Props {
  chainID: string;
}

const NavBar: React.FC<Props> = ({ chainID }) => {
  const chain = useChainByID(chainID);

  const [ready, setReady] = useState(false);
  const [balanceDisplay, setBalanceDisplay] = useState("");

  const address = chain.address
    ? formatAddress(chain.address, chain.chain.bech32_prefix)
    : "";

  const feeDenom = useMemo(() => {
    if (chain.chain.fees) {
      return chain.chain.fees.fee_tokens[0].denom;
    }
    return "ucosmos";
  }, [chain]);

  const loadFeeDenomBalance = useCallback(async () => {
    if (!chain.address || !chain.assets) {
      return;
    }

    const asset = chain.assets.assets.find((asset) => asset.base === feeDenom);

    if (!asset) {
      return;
    }

    const client = await getStargateClientForChainID(chainID);

    const balance = await client.getBalance(chain.address, asset.base);

    const balanceString = `${ethers.formatUnits(
      balance.amount,
      asset.denom_units[asset.denom_units.length - 1].exponent
    )} ${asset.symbol}`;

    setBalanceDisplay(balanceString);
    setReady(true);
  }, [chain.address, chain.assets, chainID, feeDenom]);

  useEffect(() => {
    loadFeeDenomBalance();
  }, [loadFeeDenomBalance]);

  if (!chain.address || !ready) {
    return null;
  }

  return (
    <div className="text-right text-sm border border-zinc-700 rounded-md p-4 px-6">
      <p className="font-bold">{address}</p>
      <p className="text-zinc-300">{balanceDisplay}</p>
    </div>
  );
};

export default NavBar;
