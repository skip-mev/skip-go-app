import axios from "axios";

const API_URL = "https://api.skip.money/v1";

export interface Chain {
  chainId: string;
  chainName: string;
  pfmEnabled: boolean;
}

export interface IBCAddress {
  address: string;
  chainId: string;
}

export interface IBCDenom {
  denom: string;
  chainId: string;
}

export interface IBCHop {
  port: string;
  channel: string;
  chainId: string;
  pfmEnabled: boolean;
  destDenom: string;
}

export interface Recommendation {
  destAsset: IBCDenom;
  reason: string;
  route: IBCHop[];
}

export interface MultiHopMsg {
  chainId: string;
  path: string[];
  msg: string;
  msgTypeUrl: string;
}

interface GetChainsResponse {
  chains: Chain[];
}

export async function getChains() {
  const response = await axios.get<GetChainsResponse>(`${API_URL}/ibc/chains`);

  return response.data.chains as Chain[];
}

interface TransferRouteRequestWithDestAsset {
  sourceAsset: IBCDenom;
  destAsset: IBCDenom;
}

interface TransferRouteRequestWithDestAssetChainID {
  sourceAsset: IBCDenom;
  destAssetChainId: string;
}

export type TransferRouteRequest =
  | TransferRouteRequestWithDestAsset
  | TransferRouteRequestWithDestAssetChainID;

export interface TransferRouteResponse {
  requested: IBCHop[];
  recs: Recommendation[];
}

export async function getRoute(
  sourceAsset: string,
  sourceChainID: string,
  destAsset: string,
  destChainID: string
) {
  const data = {
    sourceAsset: {
      denom: sourceAsset,
      chainId: sourceChainID,
    },
    destAsset: destAsset
      ? {
          denom: destAsset,
          chainId: destChainID,
        }
      : undefined,
    destAssetChainId: !destAsset ? destChainID : undefined,
  };

  const response = await axios.post(`${API_URL}/ibc/transfer_route`, data);

  return response.data as TransferRouteResponse;
}

export interface TransferMsgsRequest {
  amount: string;
  sourceAsset: IBCDenom;
  destAssetChainId: string;
  route: IBCHop[];
  userAddresses: IBCAddress[];
}

export interface TransferMsgsResponse {
  requested: MultiHopMsg[];
}

export async function getTransferMsgs(
  amount: string,
  sourceAsset: IBCDenom,
  destAssetChainId: string,
  route: IBCHop[],
  userAddresses: IBCAddress[]
) {
  const data: TransferMsgsRequest = {
    amount,
    sourceAsset,
    destAssetChainId,
    route,
    userAddresses,
  };

  const response = await axios.post(`${API_URL}/ibc/transfer_msgs`, data);

  const responseData = response.data as TransferMsgsResponse;

  return responseData.requested;
}
