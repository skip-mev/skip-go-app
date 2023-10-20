import { create } from "zustand";

const defaultValues = {
  historyDialog: false,

  // TODO: port dialogs to new system
  // assetSelect: false,
  // chainSelect: false,
  // txDialog: false,
};

export type DisclosureStore = typeof defaultValues;
export type DisclosureKey = keyof DisclosureStore;

const disclosureStore = create(() => ({ ...defaultValues }));

export const disclosure = {
  open: (key: DisclosureKey, { closeAll = false } = {}) => {
    disclosureStore.setState({
      ...(closeAll ? defaultValues : {}),
      [key]: true,
    });
  },
  close: (key: DisclosureKey) => {
    disclosureStore.setState({ [key]: false });
  },
  toggle: (key: DisclosureKey) => {
    disclosureStore.setState((state) => ({ [key]: !state[key] }));
  },
  closeAll: () => {
    disclosureStore.setState(defaultValues);
  },
};

export const useDisclosureKey = (key: DisclosureKey) => {
  const state = disclosureStore((state) => state[key]);
  const actions = {
    open: ({ closeAll = false } = {}) => disclosure.open(key, { closeAll }),
    close: () => disclosure.close(key),
    toggle: () => disclosure.toggle(key),
  };
  return [state, actions] as const;
};
