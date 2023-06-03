import ConnectedWalletDisplay from "./ConnectedWalletDisplay";

interface Props {
  chainID?: string;
}

const NavBar: React.FC<Props> = ({ chainID }) => {
  return (
    <nav>
      <div className="flex items-center justify-end p-4 h-28">
        {chainID && <ConnectedWalletDisplay chainID={chainID} />}
      </div>
    </nav>
  );
};

export default NavBar;
