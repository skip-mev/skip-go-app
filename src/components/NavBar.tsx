/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <nav className="relative">
      <div className="flex items-center justify-center p-4 py-12">
        <Link href="/">
          <img className="h-16" src="/logo.svg" alt="ibc.fun" />
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
