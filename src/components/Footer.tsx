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
          "group flex items-center gap-2 rounded-t-lg px-4 py-2 sm:shadow-xl",
          "bg-white text-[#FF486E] hover:bg-red-50 sm:hover:pb-3 sm:active:pb-2.5",
          "transition-[background,padding,transform] duration-500 ease-[cubic-bezier(0.08,0.82,0.17,1)]",
          "sm:data-[open=false]:translate-y-0 sm:data-[open=true]:translate-y-full",
        )}
        onClick={() => open({ closeAll: true })}
        data-open={isOpen}
      >
        <ContactIcon className="h-4 w-4" />
        <span>Contact Us</span>
      </button>
    </footer>
  );
}
