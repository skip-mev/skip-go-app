export const CHAINS_RESPONSE = {
  chains: [
    {
      chain_name: "Arbitrum",
      chain_id: "42161",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: false,
        feegrant: false,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
      bech32_prefix: "",
      fee_assets: [],
      chain_type: "evm",
    },
    {
      chain_name: "Polygon",
      chain_id: "137",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: false,
        feegrant: false,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
      bech32_prefix: "",
      fee_assets: [],
      chain_type: "evm",
    },
    {
      chain_name: "loyal",
      chain_id: "loyal-main-02",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/loyal/images/lyl.png",
      bech32_prefix: "loyal",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "osmosis",
      chain_id: "osmosis-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmosis-chain-logo.png",
      bech32_prefix: "osmo",
      fee_assets: [
        {
          denom: "uosmo",
          gas_price: {
            low: "0.0025",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "kichain",
      chain_id: "kichain-2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
      bech32_prefix: "ki",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "archway",
      chain_id: "archway-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
      bech32_prefix: "archway",
      fee_assets: [
        {
          denom: "aarch",
          gas_price: {
            low: "1000000000000",
            average: "1500000000000",
            high: "2000000000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "injective",
      chain_id: "injective-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
      bech32_prefix: "inj",
      fee_assets: [
        {
          denom: "inj",
          gas_price: {
            low: "500000000",
            average: "1000000000",
            high: "1500000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "akash",
      chain_id: "akashnet-2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
      bech32_prefix: "akash",
      fee_assets: [
        {
          denom: "uakt",
          gas_price: null,
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "nyx",
      chain_id: "nyx",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nyx.png",
      bech32_prefix: "n",
      fee_assets: [
        {
          denom: "unym",
          gas_price: null,
        },
        {
          denom: "unyx",
          gas_price: null,
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "lum",
      chain_id: "lum-network-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
      bech32_prefix: "lum",
      fee_assets: [
        {
          denom: "ulum",
          gas_price: {
            low: "0.01",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "noble",
      chain_id: "noble-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.png",
      bech32_prefix: "noble",
      fee_assets: [
        {
          denom: "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
          gas_price: {
            low: "0.001",
            average: "0.001",
            high: "0.001",
          },
        },
        {
          denom: "uusdc",
          gas_price: {
            low: "0",
            average: "0",
            high: "0.01",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "planq",
      chain_id: "planq_7070-2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
      bech32_prefix: "plq",
      fee_assets: [
        {
          denom: "aplanq",
          gas_price: {
            low: "30000000000",
            average: "35000000000",
            high: "40000000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "secret",
      chain_id: "secret-4",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
      bech32_prefix: "secret",
      fee_assets: [
        {
          denom: "uscrt",
          gas_price: {
            low: "0.1",
            average: "0.25",
            high: "0.5",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "fetchhub",
      chain_id: "fetchhub-4",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
      bech32_prefix: "fetch",
      fee_assets: [
        {
          denom: "afet",
          gas_price: {
            low: "0.025",
            average: "0.025",
            high: "0.035",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "quicksilver",
      chain_id: "quicksilver-2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
      bech32_prefix: "quick",
      fee_assets: [
        {
          denom: "uqck",
          gas_price: {
            low: "0.0001",
            average: "0.0001",
            high: "0.00025",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "assetmantle",
      chain_id: "mantle-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/AM_Logo.png",
      bech32_prefix: "mantle",
      fee_assets: [
        {
          denom: "umntl",
          gas_price: {
            low: "0.01",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "konstellation",
      chain_id: "darchub",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/Konstellation-dark.png",
      bech32_prefix: "darc",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "aura",
      chain_id: "xstaxy-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/aura/images/Aura-logo-2.2.png",
      bech32_prefix: "aura",
      fee_assets: [
        {
          denom: "uaura",
          gas_price: {
            low: "0.001",
            average: "0.0025",
            high: "0.004",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "umee",
      chain_id: "umee-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
      bech32_prefix: "umee",
      fee_assets: [
        {
          denom: "uumee",
          gas_price: {
            low: "0.06",
            average: "0.1",
            high: "0.14",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "neutron",
      chain_id: "neutron-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/neutron-black-logo.png",
      bech32_prefix: "neutron",
      fee_assets: [
        {
          denom: "untrn",
          gas_price: {
            low: "0.01",
            average: "0.01",
            high: "0.01",
          },
        },
        {
          denom: "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          gas_price: {
            low: "0.005",
            average: "0.005",
            high: "0.005",
          },
        },
        {
          denom: "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
          gas_price: {
            low: "0.05",
            average: "0.05",
            high: "0.05",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "passage",
      chain_id: "passage-2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
      bech32_prefix: "pasg",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "terra",
      chain_id: "columbus-5",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
      bech32_prefix: "terra",
      fee_assets: [
        {
          denom: "uluna",
          gas_price: {
            low: "28.325",
            average: "28.325",
            high: "28.325",
          },
        },
        {
          denom: "uusd",
          gas_price: {
            low: "0.75",
            average: "0.75",
            high: "0.75",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "agoric",
      chain_id: "agoric-3",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/Agoric-logo-color.png",
      bech32_prefix: "agoric",
      fee_assets: [
        {
          denom: "ubld",
          gas_price: {
            low: "0.03",
            average: "0.05",
            high: "0.07",
          },
        },
        {
          denom: "uist",
          gas_price: {
            low: "0.0034",
            average: "0.007",
            high: "0.02",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "chihuahua",
      chain_id: "chihuahua-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
      bech32_prefix: "chihuahua",
      fee_assets: [
        {
          denom: "uhuahua",
          gas_price: {
            low: "500",
            average: "1250",
            high: "2000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "nois",
      chain_id: "nois-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
      bech32_prefix: "nois",
      fee_assets: [
        {
          denom: "unois",
          gas_price: {
            low: "0.05",
            average: "0.05",
            high: "0.1",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "ununifi",
      chain_id: "ununifi-beta-v1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/ununifi/images/ununifi.png",
      bech32_prefix: "ununifi",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "canto",
      chain_id: "canto_7700-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
      bech32_prefix: "canto",
      fee_assets: [
        {
          denom: "acanto",
          gas_price: {
            low: "1250000000000",
            average: "2500000000000",
            high: "3750000000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "crescent",
      chain_id: "crescent-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
      bech32_prefix: "cre",
      fee_assets: [
        {
          denom: "ibc/61DF64ADF65230540C14C63D64897BE08A3DC9A516A91425913F01240E2F432F",
          gas_price: {
            low: "0.008146",
            average: "0.020365",
            high: "0.024438",
          },
        },
        {
          denom: "ubcre",
          gas_price: {
            low: "0.0083",
            average: "0.02075",
            high: "0.0249",
          },
        },
        {
          denom: "ibc/764D1629980B02BAFF3D25BEE4FB1E0C5E350AFA252FDF66E68E10D2179A826A",
          gas_price: {
            low: "200000000",
            average: "500000000",
            high: "600000000",
          },
        },
        {
          denom: "ibc/9EC8A1701813BB7B73BFED2496009ABB2C8BF187E6CDFA788D77F68E08BC05CD",
          gas_price: {
            low: "0.000842",
            average: "0.002105",
            high: "0.002526",
          },
        },
        {
          denom: "ibc/C814F0B662234E24248AE3B2FE2C1B54BBAF12934B757F6E7BC5AEC119963895",
          gas_price: {
            low: "0.000568",
            average: "0.00142",
            high: "0.001704",
          },
        },
        {
          denom: "ibc/D64F87FAE0B35C1954DD7921BA7A2939705DE77CBF72B8002F2E3552EDE4DE52",
          gas_price: {
            low: "0.00006",
            average: "0.00015",
            high: "0.00018",
          },
        },
        {
          denom: "ibc/CD01034D6749F20AAC5330EF4FD8B8CA7C40F7527AB8C4A302FBD2A070852EE1",
          gas_price: {
            low: "0.000842",
            average: "0.002105",
            high: "0.002526",
          },
        },
        {
          denom: "ibc/8F865D9760B482FF6254EDFEC1FF2F1273B9AB6873A7DE484F89639795D73D75",
          gas_price: {
            low: "0.0004",
            average: "0.001",
            high: "0.0012",
          },
        },
        {
          denom: "ibc/BFF0D3805B50D93E2FA5C0B2DDF7E0B30A631076CD80BC12A48C0E95404B4A41",
          gas_price: {
            low: "0.000842",
            average: "0.002105",
            high: "0.002526",
          },
        },
        {
          denom: "ibc/0634D0993744740D675AD01E81156EAC945AEAAE17C074918DC7FF52F41B263E",
          gas_price: {
            low: "0.0014",
            average: "0.0035",
            high: "0.0042",
          },
        },
        {
          denom: "ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30",
          gas_price: {
            low: "3350000000",
            average: "8375000000",
            high: "10050000000",
          },
        },
        {
          denom: "ibc/11F940BCDFD7CFBFD7EDA13F25DA95D308286D441209D780C9863FD4271514EB",
          gas_price: {
            low: "0.002",
            average: "0.005",
            high: "0.006",
          },
        },
        {
          denom: "ibc/4627AD2524E3E0523047E35BB76CC90E37D9D57ACF14F0FCBCEB2480705F3CB8",
          gas_price: {
            low: "5",
            average: "12.5",
            high: "15",
          },
        },
        {
          denom: "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          gas_price: {
            low: "0.000063",
            average: "0.0001575",
            high: "0.000189",
          },
        },
        {
          denom: "ibc/C950356239AD2A205DE09FDF066B1F9FF19A7CA7145EA48A5B19B76EE47E52F7",
          gas_price: {
            low: "0.065405",
            average: "0.1635125",
            high: "0.196215",
          },
        },
        {
          denom: "ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3",
          gas_price: {
            low: "0.000842",
            average: "0.002105",
            high: "0.002526",
          },
        },
        {
          denom: "ucre",
          gas_price: {
            low: "0.01",
            average: "0.025",
            high: "0.03",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "xpla",
      chain_id: "dimension_37-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
      bech32_prefix: "xpla",
      fee_assets: [
        {
          denom: "axpla",
          gas_price: {
            low: "850000000000",
            average: "1147500000000",
            high: "1487500000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "bitsong",
      chain_id: "bitsong-2b",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
      bech32_prefix: "bitsong",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "mars",
      chain_id: "mars-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-protocol.png",
      bech32_prefix: "mars",
      fee_assets: [
        {
          denom: "umars",
          gas_price: {
            low: "0",
            average: "0",
            high: "0.01",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "gravitybridge",
      chain_id: "gravity-bridge-3",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
      bech32_prefix: "gravity",
      fee_assets: [
        {
          denom: "gravity0x4f6103BAd230295baCF30f914FDa7D4273B7F585",
          gas_price: null,
        },
        {
          denom: "gravity0x892A6f9dF0147e5f079b0993F486F9acA3c87881",
          gas_price: null,
        },
        {
          denom: "gravity0xa670d7237398238DE01267472C6f13e5B8010FD1",
          gas_price: null,
        },
        {
          denom: "gravity0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",
          gas_price: null,
        },
        {
          denom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
          gas_price: {
            low: "0.0002",
            average: "0.0005",
            high: "0.0008",
          },
        },
        {
          denom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          gas_price: {
            low: "0.0002",
            average: "0.0005",
            high: "0.0008",
          },
        },
        {
          denom: "gravity0x817bbDbC3e8A1204f3691d14bB44992841e3dB35",
          gas_price: null,
        },
        {
          denom: "gravity0xd8e2F184EedC79A9bdE9Eb7E34B0fF34e98692B7",
          gas_price: null,
        },
        {
          denom: "ibc/00F2B62EB069321A454B708876476AFCD9C23C8C9C4A5A206DDF1CD96B645057",
          gas_price: null,
        },
        {
          denom: "ibc/29A7122D024B5B8FA8A2EFBB4FA47272C25C8926AA005A96807127208082DAB3",
          gas_price: null,
        },
        {
          denom: "gravity0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b",
          gas_price: null,
        },
        {
          denom: "gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
          gas_price: null,
        },
        {
          denom: "ibc/5012B1C96F286E8A6604A87037CE51241C6F1CA195B71D1E261FCACB69FB6BC2",
          gas_price: null,
        },
        {
          denom: "gravity0x514910771AF9Ca656af840dff83E8264EcF986CA",
          gas_price: null,
        },
        {
          denom: "gravity0x8D983cb9388EaC77af0474fA441C4815500Cb7BB",
          gas_price: null,
        },
        {
          denom: "ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519",
          gas_price: null,
        },
        {
          denom: "ugraviton",
          gas_price: null,
        },
        {
          denom: "gravity0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC",
          gas_price: null,
        },
        {
          denom: "ibc/2E5D0AC026AC1AFA65A23023BA4F24BB8DDF94F118EDC0BAD6F625BFC557CDED",
          gas_price: null,
        },
        {
          denom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          gas_price: null,
        },
        {
          denom: "gravity0x2C5Bcad9Ade17428874855913Def0A02D8bE2324",
          gas_price: null,
        },
        {
          denom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          gas_price: null,
        },
        {
          denom: "gravity0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
          gas_price: null,
        },
        {
          denom: "gravity0xa693B19d2931d498c5B318dF961919BB4aee87a5",
          gas_price: null,
        },
        {
          denom: "gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
          gas_price: null,
        },
        {
          denom: "gravity0x8a854288a5976036A725879164Ca3e91d30c6A1B",
          gas_price: null,
        },
        {
          denom: "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
          gas_price: null,
        },
        {
          denom: "gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b",
          gas_price: null,
        },
        {
          denom: "gravity0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
          gas_price: null,
        },
        {
          denom: "gravity0xc3761EB917CD790B30dAD99f6Cc5b4Ff93C4F9eA",
          gas_price: null,
        },
        {
          denom: "gravity0x01e0E2e61f554eCAaeC0cC933E739Ad90f24a86d",
          gas_price: null,
        },
        {
          denom: "gravity0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
          gas_price: null,
        },
        {
          denom: "gravity0x853d955aCEf822Db058eb8505911ED77F175b99e",
          gas_price: null,
        },
        {
          denom: "ibc/0C273962C274B2C05B22D9474BFE5B84D6A6FCAD198CB9B0ACD35EA521A36606",
          gas_price: null,
        },
        {
          denom: "ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602",
          gas_price: null,
        },
        {
          denom: "gravity0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          gas_price: null,
        },
        {
          denom: "gravity0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC",
          gas_price: null,
        },
        {
          denom: "ibc/048BE20AE2E6BFD4142C547E04F17E5F94363003A12B7B6C084E08101BFCF7D1",
          gas_price: null,
        },
        {
          denom: "gravity0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be",
          gas_price: null,
        },
        {
          denom: "gravity0x30D20208d987713f46DFD34EF128Bb16C404D10f",
          gas_price: null,
        },
        {
          denom: "gravity0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE",
          gas_price: null,
        },
        {
          denom: "gravity0x147faF8De9d8D8DAAE129B187F0D02D819126750",
          gas_price: null,
        },
        {
          denom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
          gas_price: null,
        },
        {
          denom: "gravity0x35a532d376FFd9a705d0Bb319532837337A398E7",
          gas_price: null,
        },
        {
          denom: "gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78",
          gas_price: null,
        },
        {
          denom: "gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e",
          gas_price: null,
        },
        {
          denom: "gravity0x467719aD09025FcC6cF6F8311755809d45a5E5f3",
          gas_price: null,
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "cronos",
      chain_id: "cronosmainnet_25-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cronos.png",
      bech32_prefix: "crc",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "omniflixhub",
      chain_id: "omniflixhub-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
      bech32_prefix: "omniflix",
      fee_assets: [
        {
          denom: "uflix",
          gas_price: {
            low: "0.001",
            average: "0.0025",
            high: "0.025",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "jackal",
      chain_id: "jackal-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
      bech32_prefix: "jkl",
      fee_assets: [
        {
          denom: "ujkl",
          gas_price: {
            low: "0.002",
            average: "0.002",
            high: "0.02",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "nolus",
      chain_id: "pirin-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: false,
        feegrant: false,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
      bech32_prefix: "nolus",
      fee_assets: [
        {
          denom: "unls",
          gas_price: {
            low: "0.01",
            average: "0.025",
            high: "0.05",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "meme",
      chain_id: "meme-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
      bech32_prefix: "meme",
      fee_assets: [
        {
          denom: "umeme",
          gas_price: {
            low: "0.025",
            average: "0.035",
            high: "0.045",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "comdex",
      chain_id: "comdex-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
      bech32_prefix: "comdex",
      fee_assets: [
        {
          denom: "ucmdx",
          gas_price: {
            low: "0",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "quasar",
      chain_id: "quasar-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
      bech32_prefix: "quasar",
      fee_assets: [
        {
          denom: "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
          gas_price: {
            low: "0.01",
            average: "0.01",
            high: "0.02",
          },
        },
        {
          denom: "ibc/FA7775734CC73176B7425910DE001A1D2AD9B6D9E93129A5D0750EAD13E4E63A",
          gas_price: {
            low: "0.01",
            average: "0.01",
            high: "0.02",
          },
        },
        {
          denom: "ibc/FA0006F056DB6719B8C16C551FC392B62F5729978FC0B125AC9A432DBB2AA1A5",
          gas_price: {
            low: "0.01",
            average: "0.01",
            high: "0.02",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "evmos",
      chain_id: "evmos_9001-2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
      bech32_prefix: "evmos",
      fee_assets: [
        {
          denom: "aevmos",
          gas_price: {
            low: "80000000000",
            average: "80000000000",
            high: "80000000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "bitcanna",
      chain_id: "bitcanna-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
      bech32_prefix: "bcna",
      fee_assets: [
        {
          denom: "ubcna",
          gas_price: {
            low: "0.001",
            average: "0.0025",
            high: "0.01",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "sifchain",
      chain_id: "sifchain-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: false,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
      bech32_prefix: "sif",
      fee_assets: [
        {
          denom: "rowan",
          gas_price: {
            low: "1000000000000",
            average: "1500000000000",
            high: "2000000000000",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "8ball",
      chain_id: "eightball-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
      bech32_prefix: "8ball",
      fee_assets: [
        {
          denom: "uebl",
          gas_price: null,
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "teritori",
      chain_id: "teritori-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/chain.png",
      bech32_prefix: "tori",
      fee_assets: [
        {
          denom: "utori",
          gas_price: {
            low: "0",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "migaloo",
      chain_id: "migaloo-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/migaloo-light.png",
      bech32_prefix: "migaloo",
      fee_assets: [
        {
          denom: "uwhale",
          gas_price: {
            low: "0.25",
            average: "0.3",
            high: "0.35",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "persistence",
      chain_id: "core-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
      bech32_prefix: "persistence",
      fee_assets: [
        {
          denom: "uxprt",
          gas_price: {
            low: "0",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "shentu",
      chain_id: "shentu-2.2",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
      bech32_prefix: "shentu",
      fee_assets: [],
      chain_type: "cosmos",
    },
    {
      chain_name: "axelar",
      chain_id: "axelar-dojo-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: false,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axelar-chain-logo.png",
      bech32_prefix: "axelar",
      fee_assets: [
        {
          denom: "uaxl",
          gas_price: {
            low: "0.007",
            average: "0.007",
            high: "0.01",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "stride",
      chain_id: "stride-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: false,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stride-chain-logo.png",
      bech32_prefix: "stride",
      fee_assets: [
        {
          denom: "ibc/D24B4564BCD51D3D02D9987D92571EAC5915676A9BD6D9B0C1D0254CB8A5EA34",
          gas_price: {
            low: "0.001",
            average: "0.01",
            high: "0.1",
          },
        },
        {
          denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gas_price: {
            low: "0.0001",
            average: "0.001",
            high: "0.01",
          },
        },
        {
          denom: "stuatom",
          gas_price: {
            low: "0.0001",
            average: "0.001",
            high: "0.01",
          },
        },
        {
          denom: "stuosmo",
          gas_price: {
            low: "0.001",
            average: "0.01",
            high: "0.1",
          },
        },
        {
          denom: "ustrd",
          gas_price: {
            low: "0.0005",
            average: "0.005",
            high: "0.05",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "kujira",
      chain_id: "kaiyo-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kujira-chain-logo.png",
      bech32_prefix: "kujira",
      fee_assets: [
        {
          denom: "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
          gas_price: null,
        },
        {
          denom: "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5",
          gas_price: null,
        },
        {
          denom: "ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5",
          gas_price: null,
        },
        {
          denom: "ibc/004EBF085BBED1029326D56BE8A2E67C08CECE670A94AC1947DF413EF5130EB2",
          gas_price: null,
        },
        {
          denom: "ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23",
          gas_price: null,
        },
        {
          denom: "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
          gas_price: null,
        },
        {
          denom: "ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10",
          gas_price: null,
        },
        {
          denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          gas_price: null,
        },
        {
          denom: "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
          gas_price: null,
        },
        {
          denom: "ibc/3607EB5B5E64DD1C0E12E07F077FF470D5BC4706AFCBC98FE1BA960E5AE4CE07",
          gas_price: null,
        },
        {
          denom: "ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602",
          gas_price: null,
        },
        {
          denom: "ukuji",
          gas_price: null,
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "terra2",
      chain_id: "phoenix-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
      bech32_prefix: "terra",
      fee_assets: [
        {
          denom: "uluna",
          gas_price: {
            low: "0.015",
            average: "0.025",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "cosmoshub",
      chain_id: "cosmoshub-4",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      bech32_prefix: "cosmos",
      fee_assets: [
        {
          denom: "uatom",
          gas_price: {
            low: "0.0013",
            average: "0.025",
            high: "0.03",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "kava",
      chain_id: "kava_2222-10",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: false,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
      bech32_prefix: "kava",
      fee_assets: [
        {
          denom: "ukava",
          gas_price: {
            low: "0.05",
            average: "0.1",
            high: "0.25",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "sommelier",
      chain_id: "sommelier-3",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
      bech32_prefix: "somm",
      fee_assets: [
        {
          denom: "usomm",
          gas_price: null,
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "cryptoorgchain",
      chain_id: "crypto-org-chain-mainnet-1",
      pfm_enabled: false,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cronos.png",
      bech32_prefix: "cro",
      fee_assets: [
        {
          denom: "basecro",
          gas_price: {
            low: "0.025",
            average: "0.03",
            high: "0.04",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "stargaze",
      chain_id: "stargaze-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
      bech32_prefix: "stars",
      fee_assets: [
        {
          denom: "ustars",
          gas_price: {
            low: "1",
            average: "1.1",
            high: "1.2",
          },
        },
      ],
      chain_type: "cosmos",
    },
    {
      chain_name: "juno",
      chain_id: "juno-1",
      pfm_enabled: true,
      cosmos_sdk_version: "",
      modules: {},
      cosmos_module_support: {
        authz: true,
        feegrant: true,
      },
      supports_memo: true,
      logo_uri: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
      bech32_prefix: "juno",
      fee_assets: [
        {
          denom: "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
          gas_price: {
            low: "0.003",
            average: "0.003",
            high: "0.003",
          },
        },
        {
          denom: "ujuno",
          gas_price: {
            low: "0.075",
            average: "0.075",
            high: "0.075",
          },
        },
      ],
      chain_type: "cosmos",
    },
  ],
};
