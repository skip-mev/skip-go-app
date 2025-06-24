import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import styles from "./Banner.module.css";
import { CloseIcon } from "./CloseIcon";

export const Banner = ({ theme }: { theme: "dark" | "light" }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [bannerRoot, setBannerRoot] = useState<HTMLElement | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();

    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let el = document.getElementById("banner-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "banner-root";
      document.body.appendChild(el);
    }
    setBannerRoot(el);
  }, []);

  const bannerElement = showBanner ? (
    <div className={styles.bannerContainer}>
      <a
        href={process.env.NEXT_PUBLIC_BANNER_LINK}
        target="_blank"
        className={`flex flex-col gap-[18px] rounded-[10px]  p-[18px] ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}
      >
        <strong
          className={`flex items-center justify-between font-diatype text-[15px] ${theme === "light" ? "text-black" : "text-white"}`}
        >
          {process.env.NEXT_PUBLIC_BANNER_TITLE}
          <CloseIcon
            onClick={() => setShowBanner(false)}
            color={theme === "light" ? "#00000073" : "#ffffff80"}
          />
        </strong>
        <div className={`font-diatype text-[13px] ${theme === "light" ? "text-[#00000073]" : "text-[#ffffff80]"}`}>
          {process.env.NEXT_PUBLIC_BANNER_MESSAGE}
        </div>
      </a>
    </div>
  ) : null;

  if (isDesktop && bannerRoot) {
    return ReactDOM.createPortal(bannerElement, bannerRoot);
  }

  return bannerElement;
};
