import userEvent from "@testing-library/user-event";

import { act, render, screen } from "@/test";

import { MinimalWallet, WalletModal } from "../WalletModal/WalletModal";

describe("WalletModal", () => {
  it("closes when the back arrow is clicked", async () => {
    const onClose = jest.fn();

    const wallets: MinimalWallet[] = [];

    await act(async () => {
      render(<WalletModal wallets={wallets} onClose={onClose} />);
    });
  });

  it("can connect a wallet", async () => {
    const onClose = jest.fn();
    const keplrConnectFn = jest.fn();

    const keplr = {
      walletName: "keplr-extension",
      walletPrettyName: "Keplr",
      walletInfo: {
        logo: "https://keplr.logo",
      },
      connect: keplrConnectFn,
      disconnect: jest.fn(),
      isWalletConnected: false,
    };

    const wallets: MinimalWallet[] = [keplr];

    await act(async () => {
      render(<WalletModal wallets={wallets} onClose={onClose} />);
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: /keplr/i,
      }),
    );

    expect(keplrConnectFn).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("can disconnect a wallet", async () => {
    const onClose = jest.fn();
    const keplrConnectFn = jest.fn();

    const keplr = {
      walletName: "keplr-extension",
      walletPrettyName: "Keplr",
      walletInfo: {
        logo: "https://keplr.logo",
      },
      connect: keplrConnectFn,
      disconnect: jest.fn(),
      isWalletConnected: true,
    };

    const wallets: MinimalWallet[] = [keplr];

    await act(async () => {
      render(<WalletModal wallets={wallets} onClose={onClose} />);
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: /disconnect keplr/i,
      }),
    );

    expect(keplr.disconnect).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
