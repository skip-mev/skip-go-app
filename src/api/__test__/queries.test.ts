import { AllTheProviders, renderHook, waitFor } from "@/test";

import { useChainByID, useChains } from "../queries";

test("useChains attaches a prettyName", async () => {
  const { result } = renderHook(() => useChains(), {
    wrapper: AllTheProviders,
  });

  await waitFor(() => expect(result.current.isLoading).toBeFalsy(), {
    timeout: 10000,
  });

  expect(result.current.chains).toBeDefined();

  if (!result.current.chains) {
    throw new Error("chains is undefined");
  }

  for (const chain of result.current.chains) {
    expect(chain.prettyName).toBeDefined();
  }
});

test("useChainByID returns the chain matching the specified chainID", async () => {
  const { result } = renderHook(() => useChainByID("osmosis-1"), {
    wrapper: AllTheProviders,
  });

  await waitFor(() => expect(result.current.isLoading).toBeFalsy(), {
    timeout: 10000,
  });

  expect(result.current.chain?.chainID).toEqual("osmosis-1");
});

test("useChainByID returns undefined if a matching chain cannot be found", async () => {
  const { result } = renderHook(() => useChainByID("bitcoin-satoshis-vision"), {
    wrapper: AllTheProviders,
  });

  await waitFor(() => expect(result.current.isLoading).toBeFalsy(), {
    timeout: 10000,
  });

  expect(result.current.chain).toBeUndefined();
});
