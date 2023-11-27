import { create } from "zustand";

const defaultValues = {
  historyDialog: false,
  settingsDialog: false,
  swapDetailsCollapsible: false,

  // TODO: port dialogs to new system
  // assetSelect: false,
  // chainSelect: false,
  // txDialog: false,
};

export type DisclosureStore = typeof defaultValues & {
  json?: { title?: string; data: unknown };
};
export type DisclosureKey = keyof typeof defaultValues;

const disclosureStore = create<DisclosureStore>(() => ({
  ...defaultValues,
}));

export const disclosure = {
  open: (key: DisclosureKey, { closeAll = false } = {}) => {
    disclosureStore.setState({
      ...(closeAll ? defaultValues : {}),
      [key]: true,
    });
  },
  openJson: (json: NonNullable<DisclosureStore["json"]>) => {
    disclosureStore.setState({ json });
  },
  close: (key: DisclosureKey) => {
    disclosureStore.setState({ [key]: false });
  },
  closeJson: () => {
    disclosureStore.setState({ json: undefined });
  },
  toggle: (key: DisclosureKey) => {
    disclosureStore.setState((state) => ({ [key]: !state[key] }));
  },
  set: (key: DisclosureKey, value: boolean) => {
    disclosureStore.setState({ [key]: value });
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
    set: (value: boolean) => disclosure.set(key, value),
  };
  return [state, actions] as const;
};

export const useJsonDisclosure = () => {
  const state = disclosureStore((state) => state.json);
  const actions = {
    open: (json: NonNullable<DisclosureStore["json"]>) => {
      disclosureStore.setState({ json });
    },
    close: () => {
      disclosureStore.setState({ json: undefined });
    },
  };
  return [state, actions] as const;
};
