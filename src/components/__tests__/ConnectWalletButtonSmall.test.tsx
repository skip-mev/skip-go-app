import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

import { render, screen } from "@/test";

import { ConnectWalletButtonSmall } from "../ConnectWalletButtonSmall";

describe("ConnectWalletButtonSmall", () => {
  it("handles clicks", async () => {
    const fn = jest.fn();

    await act(async () => {
      render(<ConnectWalletButtonSmall onClick={fn} />);
    });

    await userEvent.click(screen.getByRole("button"));

    expect(fn).toHaveBeenCalled();
  });
});
