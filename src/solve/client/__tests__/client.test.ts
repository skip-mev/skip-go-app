import { rest } from "msw";
import { setupServer } from "msw/node";
import { SkipClient } from "../client";
import { IGNORE_CHAINS } from "../../../config";

const handlers = [
  rest.post(
    "https://api.skip.money/v1/fungible/route",
    async (req, res, ctx) => {
      const body = await req.json();

      if (!body.cumulative_affiliate_fee_bps) {
        return res(
          ctx.status(400),
          ctx.json({
            code: 3,
            message: "invalid cumulativeAffiliateFeeBps",
            details: [],
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({
          source_asset_denom: "uosmo",
          source_asset_chain_id: "osmosis-1",
          dest_asset_denom: "uatom",
          dest_asset_chain_id: "cosmoshub-4",
          amount_in: "1000000",
          operations: [
            {
              swap: {
                swap_in: {
                  swap_venue: {
                    name: "osmosis-poolmanager",
                    chain_id: "osmosis-1",
                  },
                  swap_operations: [
                    {
                      pool: "1",
                      denom_in: "uosmo",
                      denom_out:
                        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                    },
                  ],
                  swap_amount_in: "1000000",
                },
                estimated_affiliate_fee:
                  "0ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
              },
            },
            {
              transfer: {
                port: "transfer",
                channel: "channel-0",
                chain_id: "osmosis-1",
                pfm_enabled: true,
                dest_denom: "uatom",
              },
            },
          ],
          chain_ids: ["osmosis-1", "cosmoshub-4"],
          does_swap: true,
          estimated_amount_out: "54631",
          swap_venue: {
            name: "osmosis-poolmanager",
            chain_id: "osmosis-1",
          },
        })
      );
    }
  ),
  rest.get("https://api.skip.money/v1/info/chains", (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        chains: [
          {
            chain_name: "osmosis",
            chain_id: "osmosis-1",
            pfm_enabled: true,
            cosmos_sdk_version: "v0.47.3",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v4",
                version: "v4.3.1",
                sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
              },
              "github.com/osmosis-labs/osmosis/x/ibc-hooks": {
                path: "github.com/osmosis-labs/osmosis/x/ibc-hooks",
                version: "v0.0.7",
                sum: "h1:rd5guXn/SF6i66PO5rlGaDK0AT81kCpiLixyQ5EJ6Yg=",
              },
            },
          },
          {
            chain_name: "agoric",
            chain_id: "agoric-3",
            pfm_enabled: false,
            cosmos_sdk_version: "v0.45.11",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v3",
                version: "v3.4.0",
                sum: "h1:ha3cqEG36pqMWqA1D+kxDWBTZXpeFMd/aZIQF7I0xro=",
              },
            },
          },
          {
            chain_name: "8ball",
            chain_id: "eightball-1",
            pfm_enabled: false,
            cosmos_sdk_version: "v0.46.7",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v5",
                version: "v5.1.0",
                sum: "h1:m1NHXFkwwvNeJegZqtyox1WLinh+PMy4ivU/Cs9KjeA=",
              },
            },
          },
          {
            chain_name: "akash",
            chain_id: "akashnet-2",
            pfm_enabled: false,
            cosmos_sdk_version: "v0.45.9",
            modules: {
              "github.com/cosmos/ibc-go": {
                path: "github.com/cosmos/ibc-go/v3",
                version: "v3.1.0",
                sum: "",
              },
            },
          },
        ],
      })
    );
  }),
];

const server = setupServer(...handlers);

describe("SkipClient", () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers());

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  describe("/v1/info/chains", () => {
    it("filters ignored chains", async () => {
      const client = new SkipClient(IGNORE_CHAINS);

      const response = await client.chains();

      const responseChainIDs = response.map((chain) => chain.chain_id);

      for (const ignoredChain of IGNORE_CHAINS) {
        expect(responseChainIDs).not.toContain(ignoredChain);
      }
    });
  });

  describe("/v1/fungible/route", () => {
    it("sets a value for cumulative_affiliate_fee_bps if not provided", async () => {
      const client = new SkipClient();

      await expect(
        client.fungible.getRoute({
          amount_in: "1000000",
          source_asset_denom: "uosmo",
          source_asset_chain_id: "osmosis-1",
          dest_asset_denom: "uatom",
          dest_asset_chain_id: "cosmoshub-4",
        })
      ).resolves.toEqual(expect.anything());
    });
  });
});
