/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import BetaBanner from "./BetaBanner";

const NavBar: React.FC = () => {
  return (
    <nav className="relative">
      <div className="flex items-center justify-center p-4 py-12">
        <Link href="/">
          <img className="h-16" src="/logo.svg" alt="ibc.fun" />
        </Link>
      </div>
      <div className="absolute right-0 inset-y-0 flex items-center p-6 max-w-[400px]">
        <BetaBanner />
      </div>
    </nav>
  );
};

export default NavBar;
