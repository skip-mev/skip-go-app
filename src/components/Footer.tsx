import { ChatBubbleOvalLeftIcon as ContactIcon } from "@heroicons/react/16/solid";
import { useQuery } from "@tanstack/react-query";

import { useDisclosureKey } from "@/context/disclosures";
import { cn } from "@/utils/ui";

export function Footer() {
  const [isOpen, { open }] = useDisclosureKey("contactDialog");

  const { data: isShown = false } = useQuery({
    queryKey: ["USE_CONTACT_FORM_VISIBILITY"],
    queryFn: async () => {
      const response = await fetch("/api/contact", { method: "HEAD" });
      return response.ok;
    },
    placeholderData: false,
  });

  return (
    <footer className="w-full self-stretch pt-16">
      <button
        className={cn(
          isShown ? "flex animate-slide-up-and-fade" : "hidden",
          "bottom-0 right-4 sm:fixed",
          "group items-center gap-2 px-4 py-2 max-sm:w-full max-sm:justify-center sm:rounded-t-lg sm:shadow-xl",
          "bg-white text-[#FF486E] hover:bg-red-50 sm:hover:pb-3 sm:active:pb-2.5",
          "transition-[background,padding,transform] duration-500",
          "sm:data-[open=false]:translate-y-0 sm:data-[open=true]:translate-y-full",
        )}
        onClick={() => open({ closeAll: true })}
        data-open={isOpen}
      >
        <ContactIcon className="h-4 w-4" />
        <span>Contact Us</span>
      </button>
      <style jsx>{`
        button {
          transition-timing-function: cubic-bezier(0.08, 0.82, 0.17, 1);
        }
      `}</style>
    </footer>
  );
}
