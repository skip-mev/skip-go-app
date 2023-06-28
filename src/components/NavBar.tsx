interface Props {
  chainID?: string;
}

const NavBar: React.FC<Props> = ({ chainID }) => {
  return (
    <nav className="relative">
      <div className="flex items-center justify-center p-4 h-28 ">
        <div>
          <p className="font-black text-xl tracking-wider">
            ibc<span className="text-indigo-500">.fun</span>
          </p>
        </div>
      </div>
      {/* <div className="absolute top-0 right-0 inset-y-0 flex items-center px-4">
        <div>{chainID && <ConnectedWalletDisplay chainID={chainID} />}</div>
      </div> */}
    </nav>
  );
};

export default NavBar;
