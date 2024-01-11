import { ChatBubbleOvalLeftIcon as ContactIcon } from "@heroicons/react/16/solid";
import { clsx } from "clsx";

import { useDisclosureKey } from "@/context/disclosures";

export function Footer() {
  const [isOpen, { open }] = useDisclosureKey("contactDialog");
  return (
    <footer
      className={clsx(
        "z-10 pt-8",
        "sm:fixed sm:bottom-0 sm:right-4",
        //
      )}
    >
      <button
        className={clsx(
          "group px-4 py-2 flex items-center gap-2 sm:shadow-xl rounded-t-lg",
          "bg-white text-[#FF486E] hover:bg-red-50 sm:hover:pb-3 sm:active:pb-2.5",
          "transition-[background,padding,transform] ease-[cubic-bezier(0.08,0.82,0.17,1)] duration-500",
          "sm:data-[open=true]:translate-y-full sm:data-[open=false]:translate-y-0",
        )}
        onClick={() => open({ closeAll: true })}
        data-open={isOpen}
      >
        <ContactIcon className="w-4 h-4" />
        <span>Contact Us</span>
      </button>
    </footer>
  );
}
