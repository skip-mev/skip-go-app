export const CHAINS_RESPONSE = {
  chains: [
    {
      chain_name: "passage",
      chain_id: "passage-2",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.16",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.4.2",
          sum: "h1:PG4Yy0/bw6Hvmha3RZbc53KYzaCwuB07Ot4GLyzcBvo=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "gitopia",
      chain_id: "gitopia",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v5",
          version: "v5.0.0-20220801112651-041096304a27",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "loyal",
      chain_id: "loyal-main-02",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.6",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v5",
          version: "v5.1.0",
          sum: "h1:m1NHXFkwwvNeJegZqtyox1WLinh+PMy4ivU/Cs9KjeA=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "kichain",
      chain_id: "kichain-2",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.12",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.3.1",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "planq",
      chain_id: "planq_7070-2",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.3",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v5",
          version: "v5.0.0",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "secret",
      chain_id: "secret-4",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.12",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v4",
          version: "v4.0.3",
          sum: "h1:3E7I9C+gM7n0+OkI7JmvWH5PGD6pZOIc1+mUUooh6dI=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "injective",
      chain_id: "injective-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.47.2",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v7",
          version: "v7.0.1",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
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
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v4",
          version: "v4.0.5",
          sum: "h1:KKUqeGhVBK38+1LwThC8IeIcsJZ6COX5kvhiJroFqCM=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
    },
    {
      chain_name: "konstellation",
      chain_id: "darchub",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.9",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.0.0",
          sum: "h1:XUNplHVS51Q2gMnTFsFsH9QJ7flsovMamnltKbEgPQ4=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "noble",
      chain_id: "noble-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.15",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.4.0",
          sum: "",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v3",
          version: "v3.1.5",
          sum: "h1:iXXjziCSAebzuRUPFSnqD7epSDB8LEPgkh9zhbj7ha4=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "bitsong",
      chain_id: "bitsong-2b",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.3.1",
          sum: "h1:i8o3iPSPN8fr7AjCPQnHEKz/VfeMrxc8mjvgAw6txWk=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v2",
          version: "v2.1.1",
          sum: "h1:4hBySIpnbC0VeR8cfJFdRGVu5I3hAD2XTXGbIqXn6xw=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "quicksilver",
      chain_id: "quicksilver-2",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v5",
          version: "v5.2.1",
          sum: "h1:i8Kl9KZfPJVYuihjbGPnjTQWecXQfRLz+QrjJGhzY9o=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "archway",
      chain_id: "archway-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.16",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "fetchhub",
      chain_id: "fetchhub-4",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.6",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.1.0",
          sum: "h1:aVPqkrGBluz6t9+d/sLZIG/zQ9O1KJzVeR4UlL/IFTQ=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "assetmantle",
      chain_id: "mantle-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.1",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.0.0",
          sum: "h1:XUNplHVS51Q2gMnTFsFsH9QJ7flsovMamnltKbEgPQ4=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v2",
          version: "v2.1.1",
          sum: "h1:4hBySIpnbC0VeR8cfJFdRGVu5I3hAD2XTXGbIqXn6xw=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
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
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: false,
    },
    {
      chain_name: "neutron",
      chain_id: "neutron-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.15",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v4",
          version: "v4.0.5",
          sum: "h1:KKUqeGhVBK38+1LwThC8IeIcsJZ6COX5kvhiJroFqCM=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "nyx",
      chain_id: "nyx",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.15",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.0",
          sum: "h1:yOzVsyZzsv4XPBux8gq+D0LhZn45yGWKjvT+6Vyo5no=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "aura",
      chain_id: "xstaxy-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.14",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "canto",
      chain_id: "canto_7700-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.9",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.2.0",
          sum: "h1:Mh+RWo5FHPMM1Xsrar3uwKufdEGdIp5LDkVk9cYKYYA=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "umee",
      chain_id: "umee-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.2.0",
          sum: "h1:HKS5WNxQrlmjowHb73J9LqlNJfvTnvkbhXZ9QzNTU7Q=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "empower",
      chain_id: "empowerchain-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.47.3",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v7",
          version: "v7.0.1",
          sum: "h1:NIBNRWjlOoFvFQu1ZlgwkaSeHO5avf4C1YQiWegt8jw=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "chihuahua",
      chain_id: "chihuahua-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.12",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.2.2",
          sum: "h1:1Tdjj4H6L+iGoDmT/zvJDAysWZpE2kW1twl7u6KKIJY=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
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
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "terra",
      chain_id: "columbus-5",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.14",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "passage",
      chain_id: "passage-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.9",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v2",
          version: "v2.0.2",
          sum: "h1:y7eUgggMEVe43wHLw9XrGbeaTWtfkJYMoL3m6YW4fIY=",
        },
      },
      cosmos_module_support: {
        authz: false,
        feegrant: false,
      },
      supports_memo: false,
    },
    {
      chain_name: "ununifi",
      chain_id: "ununifi-beta-v1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.47.3",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v7",
          version: "v7.0.1",
          sum: "h1:NIBNRWjlOoFvFQu1ZlgwkaSeHO5avf4C1YQiWegt8jw=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "nois",
      chain_id: "nois-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.14",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "crescent",
      chain_id: "crescent-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.10",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.4.0",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "xpla",
      chain_id: "dimension_37-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.9",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.2.0",
          sum: "h1:Mh+RWo5FHPMM1Xsrar3uwKufdEGdIp5LDkVk9cYKYYA=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v2",
          version: "v2.1.1",
          sum: "h1:4hBySIpnbC0VeR8cfJFdRGVu5I3hAD2XTXGbIqXn6xw=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "composable",
      chain_id: "centauri-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.47.3",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v7",
          version: "v7.0.1",
          sum: "",
        },
        "github.com/strangelove-ventures/async-icq": {
          path: "github.com/strangelove-ventures/async-icq/v7",
          version: "v7.0.0-20230413165143-a3b65ccdc897",
          sum: "h1:lCTD5L1v1K1KC6KXjyt4o1X+yzV14RbbrPZaF29n8uI=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v7",
          version: "v7.0.0-20230412224111-136e94e98861",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: false,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "mars",
      chain_id: "mars-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.1.1",
          sum: "h1:oqqMNyjj6SLQF8rvgCaDGwfdITEIsbhs8F77/8xvRIo=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "gravitybridge",
      chain_id: "gravity-bridge-3",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.16",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
    },
    {
      chain_name: "cronos",
      chain_id: "cronosmainnet_25-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.7",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v5",
          version: "v5.2.0",
          sum: "h1:LxwttRQqdUJpQ3/Gc3XPg5lkRo3pcbzx65dxFIY6ONE=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "omniflixhub",
      chain_id: "omniflixhub-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.16",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.4.2",
          sum: "h1:PG4Yy0/bw6Hvmha3RZbc53KYzaCwuB07Ot4GLyzcBvo=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "jackal",
      chain_id: "jackal-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.4.0",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "nolus",
      chain_id: "pirin-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.15",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: false,
        feegrant: false,
      },
      supports_memo: true,
    },
    {
      chain_name: "meme",
      chain_id: "meme-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.1",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v2",
          version: "v2.2.0",
          sum: "h1:nqpvElI9ku5oQZtKvLerhZ/UXH7QoL44VBTWwZkS4C8=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
    },
    {
      chain_name: "comdex",
      chain_id: "comdex-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.46.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.4.2",
          sum: "h1:PG4Yy0/bw6Hvmha3RZbc53KYzaCwuB07Ot4GLyzcBvo=",
        },
        "github.com/osmosis-labs/osmosis/x/ibc-hooks": {
          path: "github.com/osmosis-labs/osmosis/x/ibc-hooks",
          version: "v0.0.6",
          sum: "h1:PjfLL5rwwm44CeLnNQssrFgmj4BdeIS5DriKYhGz7IM=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v4",
          version: "v4.0.4",
          sum: "h1:8Tn4Gy/DAq7wzV1CxEGv80ujZ+nUvzgwwdCobO/Gj8Y=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
    },
    {
      chain_name: "quasar",
      chain_id: "quasar-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.14",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.0",
          sum: "h1:yOzVsyZzsv4XPBux8gq+D0LhZn45yGWKjvT+6Vyo5no=",
        },
        "github.com/strangelove-ventures/async-icq": {
          path: "github.com/strangelove-ventures/async-icq/v4",
          version: "v4.0.0-rc0",
          sum: "h1:foE/5O2/XiqGsdTKx3R0BTfKgW9KnUYyQLZt0WFSesE=",
        },
      },
      cosmos_module_support: {
        authz: false,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "bitcanna",
      chain_id: "bitcanna-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.1.1",
          sum: "h1:oqqMNyjj6SLQF8rvgCaDGwfdITEIsbhs8F77/8xvRIo=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "evmos",
      chain_id: "evmos_9001-2",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.12",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.2.0",
          sum: "h1:HKS5WNxQrlmjowHb73J9LqlNJfvTnvkbhXZ9QzNTU7Q=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "sifchain",
      chain_id: "sifchain-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.9",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v2",
          version: "v2.0.2",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
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
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "migaloo",
      chain_id: "migaloo-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.2.0",
          sum: "h1:HKS5WNxQrlmjowHb73J9LqlNJfvTnvkbhXZ9QzNTU7Q=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v6",
          version: "v6.0.3",
          sum: "h1:HOBZ9m5vl5L6BP/oLtZ3xygmj1KmqgJjbWuvlsD52YA=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "teritori",
      chain_id: "teritori-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.10",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.4.0",
          sum: "h1:ha3cqEG36pqMWqA1D+kxDWBTZXpeFMd/aZIQF7I0xro=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v2",
          version: "v2.1.1",
          sum: "h1:4hBySIpnbC0VeR8cfJFdRGVu5I3hAD2XTXGbIqXn6xw=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "persistence",
      chain_id: "core-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.14",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "shentu",
      chain_id: "shentu-2.2",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.2.1",
          sum: "h1:AlP2YGktkbkKOeN0bEVMKNKsfCQJrjF+dTWxERNRkRU=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "axelar",
      chain_id: "axelar-dojo-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.2.0",
          sum: "h1:Fx/kKq/uvawrAxk6ZrQ6sEIgffLRU5Cs/AUnvpPBrHI=",
        },
      },
      cosmos_module_support: {
        authz: false,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "stride",
      chain_id: "stride-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.47.3",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v7",
          version: "v7.2.0",
          sum: "h1:dx0DLUl7rxdyZ8NiT6UsrbzKOJx/w7s+BOaewFRH6cg=",
        },
      },
      cosmos_module_support: {
        authz: false,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "kujira",
      chain_id: "kaiyo-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.13",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.1.1",
          sum: "",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "terra2",
      chain_id: "phoenix-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.46.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.1.1",
          sum: "h1:oqqMNyjj6SLQF8rvgCaDGwfdITEIsbhs8F77/8xvRIo=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v6",
          version: "v6.0.2",
          sum: "h1:YzEbpmjBmccYK9rZP6p9L1SdAHJPs2X03zfAJdNwlag=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "cosmoshub",
      chain_id: "cosmoshub-4",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.16-ics",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.4.2",
          sum: "h1:PG4Yy0/bw6Hvmha3RZbc53KYzaCwuB07Ot4GLyzcBvo=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v4",
          version: "v4.0.4",
          sum: "h1:8Tn4Gy/DAq7wzV1CxEGv80ujZ+nUvzgwwdCobO/Gj8Y=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "kava",
      chain_id: "kava_2222-10",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.11",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v6",
          version: "v6.1.1",
          sum: "h1:oqqMNyjj6SLQF8rvgCaDGwfdITEIsbhs8F77/8xvRIo=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
    },
    {
      chain_name: "sommelier",
      chain_id: "sommelier-3",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.10",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v3",
          version: "v3.4.0",
          sum: "h1:ha3cqEG36pqMWqA1D+kxDWBTZXpeFMd/aZIQF7I0xro=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "cryptoorgchain",
      chain_id: "crypto-org-chain-mainnet-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.46.12",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v5",
          version: "v5.2.1",
          sum: "h1:i8Kl9KZfPJVYuihjbGPnjTQWecXQfRLz+QrjJGhzY9o=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "stargaze",
      chain_id: "stargaze-1",
      pfm_enabled: false,
      cosmos_sdk_version: "v0.45.16",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.4.2",
          sum: "h1:PG4Yy0/bw6Hvmha3RZbc53KYzaCwuB07Ot4GLyzcBvo=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
    {
      chain_name: "juno",
      chain_id: "juno-1",
      pfm_enabled: true,
      cosmos_sdk_version: "v0.45.16",
      modules: {
        "github.com/cosmos/ibc-go": {
          path: "github.com/cosmos/ibc-go/v4",
          version: "v4.3.1",
          sum: "h1:xbg0CaCdxK3lvgGvSaI91ROOLd7s30UqEcexH6Ba4Ys=",
        },
        "github.com/osmosis-labs/osmosis/x/ibc-hooks": {
          path: "github.com/osmosis-labs/osmosis/x/ibc-hooks",
          version: "v0.0.0-20230201151635-ef43e092d196",
          sum: "h1:V8OgwzvHwvGt2yEHRFsiWUPC647qez2LNgcvLzXgw8U=",
        },
        "github.com/strangelove-ventures/packet-forward-middleware": {
          path: "github.com/strangelove-ventures/packet-forward-middleware/v4",
          version: "v4.0.5",
          sum: "h1:KKUqeGhVBK38+1LwThC8IeIcsJZ6COX5kvhiJroFqCM=",
        },
      },
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
    },
  ],
};
