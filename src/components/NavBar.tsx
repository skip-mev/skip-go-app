import { formatAddress } from "@/utils/utils";
import { useChain, useWallet, useWalletClient } from "@cosmos-kit/react";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  chainID: string;
}

const NavBar: React.FC<Props> = ({ chainID }) => {
  const [ready, setReady] = useState(false);
  const [balanceDisplay, setBalanceDisplay] = useState("");

  const chain = useChain(chainID.replace("-", ""));

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

    const client = await chain.getStargateClient();

    const balance = await client.getBalance(chain.address, asset.base);

    const balanceString = `${ethers.formatUnits(
      balance.amount,
      asset.denom_units[asset.denom_units.length - 1].exponent
    )} ${asset.symbol}`;

    setBalanceDisplay(balanceString);
    setReady(true);
  }, [chain, feeDenom]);

  useEffect(() => {
    loadFeeDenomBalance();
  }, [loadFeeDenomBalance]);

  return (
    <nav>
      <div className="flex items-center justify-end p-4 h-28">
        {chain.address && ready && (
          <div className="text-right text-sm border border-zinc-700 rounded-md p-4 px-6">
            <p className="font-bold">{address}</p>
            <p className="text-zinc-300">{balanceDisplay}</p>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
