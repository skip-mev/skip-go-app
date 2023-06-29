/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

interface Props {
  chainID?: string;
}

const NavBar: React.FC<Props> = ({ chainID }) => {
  return (
    <nav className="relative">
      <div className="flex items-center justify-center p-4 py-12">
        <Link href="/">
          <img className="h-20" src="/logo.svg" alt="ibc.fun" />
          {/* <p className="font-black text-xl tracking-wider">
              ibc<span className="text-indigo-500">.fun</span>
            </p> */}
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
