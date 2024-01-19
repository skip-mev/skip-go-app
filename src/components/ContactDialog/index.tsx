import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { FormEvent } from "react";
import toast from "react-hot-toast";

import { useDisclosureKey } from "@/context/disclosures";

export function ContactDialog() {
  const [isOpen, { close }] = useDisclosureKey("contactDialog");
  return (
    <Dialog.Root
      modal={false}
      open={isOpen}
    >
      <Dialog.Content className="absolute inset-0 animate-fade-zoom-in rounded-3xl bg-white">
        <form
          className={clsx(
            "flex h-full flex-col p-6 text-sm",
            "[&_input]:rounded-md [&_input]:border-neutral-300 [&_input]:text-sm",
            "[&_textarea]:rounded-md [&_textarea]:border-neutral-300 [&_textarea]:text-sm",
          )}
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-4 pb-4">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
              onClick={close}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold">Contact Us</h3>
          </div>
          <label htmlFor="txHash">
            Transaction Hash <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="txHash"
            name="txHash"
            placeholder="C1CEA71D07932CEE8F4DC691..."
            className="form-input mb-2 rounded"
            required
          />
          <label htmlFor="submitChain">
            Submitted Transaction Chain <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="submitChain"
            name="submitChain"
            placeholder="cosmoshub-4"
            className="form-input mb-2 rounded"
            required
          />
          <label htmlFor="signerAddress">
            Signer Account Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="signerAddress"
            name="signerAddress"
            placeholder="cosmos1kpzxx2lxg05xxn8mf..."
            className="form-input mb-2 rounded"
            required
          />
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
            <div className="grid grid-flow-row">
              <label htmlFor="Name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Skippy McSkipper"
                className="form-input mb-2 rounded"
                required
              />
            </div>
            <div className="grid grid-flow-row">
              <label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@domain.com"
                className="form-input mb-2 rounded"
                required
              />
            </div>
          </div>

          <label htmlFor="message">Describe your issue</label>
          <textarea
            name="message"
            id="message"
            className="form-textarea"
          />
          <div className="flex-grow" />
          <button
            type="submit"
            // className="flex items-center gap-2 bg-[#FF486E] rounded-md font-medium p-2 text-white justify-center text-base"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FF486E] py-4 text-base font-semibold text-white outline-none"
          >
            <EnvelopeIcon className="h-5 w-5" />
            <span>Send Message</span>
          </button>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  await toast.promise(
    fetch("/api/contact", {
      method: "POST",
      body: new FormData(event.currentTarget),
    }),
    {
      loading: "Sending message...",
      success: "Message sent!",
      error: (
        <p>
          <strong>Something went wrong!</strong>
          <br />
          Please try again later, or contact us directly at{" "}
          <a
            href="mailto:support@skip.money"
            className="text-red-500 hover:underline"
          >
            support@skip.money
          </a>
        </p>
      ),
    },
  );
}
