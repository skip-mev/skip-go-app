import { ReactNode, useCallback } from "react";
import { create } from "zustand";

export interface ContactFormStore {
  txHash: string;
  chainID: string;
  address: string;
  email: string;
  telegram: string;
  description: string;
}

const defaultValues: ContactFormStore = {
  txHash: "",
  chainID: "",
  address: "",
  email: "",
  telegram: "",
  description: "",
};

export const useContactFormStore = create(() => defaultValues);

export function resetContactForm() {
  useContactFormStore.setState(defaultValues);
}

export function ContactFieldWrap<T extends keyof ContactFormStore>({
  name,
  children,
}: {
  name: T;
  children: (
    value: ContactFormStore[T],
    onChange: (value: ContactFormStore[T]) => void,
    name: T,
  ) => ReactNode;
}) {
  const value = useContactFormStore(
    useCallback((state) => state[name], [name]),
  );
  return children(
    value,
    useCallback(
      (value) => {
        useContactFormStore.setState({ [name]: value });
      },
      [name],
    ),
    name,
  );
}
