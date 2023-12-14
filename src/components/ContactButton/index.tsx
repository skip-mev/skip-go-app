import { ChatBubbleLeftIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import * as Popover from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { useEffect } from "react";

import { ContactFieldWrap, resetContactForm } from "@/context/contact-form";
import { useDisclosureKey } from "@/context/disclosures";

export function ContactButton() {
  const [open, { toggle }] = useDisclosureKey("contactForm");
  useEffect(() => {
    if (!open) resetContactForm();
  }, [open]);
  return (
    <Popover.Root onOpenChange={toggle} open={open}>
      <div className="fixed bottom-4 right-4 z-10 animate-slide-up-and-fade">
        <Popover.Trigger asChild>
          <button
            className={clsx(
              "rounded-full flex items-center gap-2 text-white px-4 py-2 font-medium",
              "bg-[#FF486E] hover:bg-[#e74062]",
            )}
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>Contact Us</span>
          </button>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content
          className={clsx(
            "rounded-xl bg-white mr-4 mb-2 p-4 border shadow text-sm z-20",
            "data-[state=open]:data-[side=top]:animate-slide-down-and-fade",
            "data-[state=open]:data-[side=bottom]:animate-slide-up-and-fade",
            "data-[state=open]:data-[side=left]:animate-slide-right-and-fade",
            "data-[state=open]:data-[side=right]:animate-slide-left-and-fade",
          )}
        >
          <form
            onSubmit={(event) => event.preventDefault()}
            className={clsx(
              "flex flex-col gap-2 max-w-full w-64",
              "[&>input]:border [&>input]:rounded [&>input]:text-sm [&>input]:px-2 [&>input]:py-1",
              "[&>textarea]:border [&>textarea]:rounded [&>textarea]:text-sm [&>textarea]:px-2 [&>textarea]:py-1",
            )}
          >
            <label htmlFor="txHash">Tx Hash</label>
            <ContactFieldWrap name="txHash">
              {(value, onChange, name) => (
                <input
                  type="text"
                  name={name}
                  required
                  value={value}
                  onChange={(event) => onChange(event.currentTarget.value)}
                  placeholder="C41BEA6DAD100097EEBF0B6..."
                />
              )}
            </ContactFieldWrap>
            <label htmlFor="chainID">Chain ID</label>
            <ContactFieldWrap name="chainID">
              {(value, onChange, name) => (
                <input
                  type="text"
                  name={name}
                  required
                  value={value}
                  onChange={(event) => onChange(event.currentTarget.value)}
                  placeholder="cosmoshub-4"
                />
              )}
            </ContactFieldWrap>
            <label htmlFor="address">Wallet Address</label>
            <ContactFieldWrap name="address">
              {(value, onChange, name) => (
                <input
                  type="text"
                  name={name}
                  required
                  value={value}
                  onChange={(event) => onChange(event.currentTarget.value)}
                  placeholder="cosmos16n6v02ekek7..."
                />
              )}
            </ContactFieldWrap>
            <label htmlFor="email">Email</label>
            <ContactFieldWrap name="email">
              {(value, onChange, name) => (
                <input
                  type="email"
                  name={name}
                  required
                  value={value}
                  onChange={(event) => onChange(event.currentTarget.value)}
                  placeholder="example@domain.com"
                />
              )}
            </ContactFieldWrap>
            <label htmlFor="telegram">Telegram</label>
            <ContactFieldWrap name="telegram">
              {(value, onChange, name) => (
                <input
                  type="text"
                  name={name}
                  value={value}
                  onChange={(event) => onChange(event.currentTarget.value)}
                  placeholder="@username or t.me/username"
                />
              )}
            </ContactFieldWrap>
            <label htmlFor="description">Description</label>
            <ContactFieldWrap name="description">
              {(value, onChange, name) => (
                <textarea
                  name={name}
                  value={value}
                  onChange={(event) => onChange(event.currentTarget.value)}
                  rows={5}
                  placeholder="Describe your issue here..."
                />
              )}
            </ContactFieldWrap>
            <br />
            <button
              type="submit"
              className={clsx(
                "flex items-center gap-2 p-2 border rounded-full justify-center text-center font-medium",
                "hover:bg-gray-50",
              )}
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
