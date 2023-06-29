import axios from "axios";

const API_URL = "https://api.skip.money/v1";
// const API_URL = "https://solve-dev.skip.money/v1";

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

  const chains = response.data.chains as Chain[];

  return chains.filter((chain) => chain.chainName !== "agoric");
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

export interface SwapVenue {
  name: string;
  chainId: string;
}

export interface SwapIn {
  swapVenue: SwapVenue;
  swapOperations: SwapOperation[];
  amountIn?: string;
}

export interface SwapOperation {
  pool: string;
  denomIn: string;
  denomOut: string;
}

export interface Swap {
  swapVenue: SwapVenue;
  swapOperations: SwapOperation[];
  swapAmountIn: string;
}

export interface SwapExactCoinOut {
  swapVenue: SwapVenue;
  swapOperations: SwapOperation[];
  swapAmountOut: string;
}

export interface Affiliate {
  basisPointsFee: string;
  address: string;
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

export interface SwapRouteRequest {
  sourceAsset: IBCDenom;
  destAsset: IBCDenom;
  amountIn: string;
  cumulativeAffiliateFeeBps: string;
}

export interface SwapRouteResponse {
  preSwapHops: IBCHop[];
  postSwapHops: IBCHop[];

  chainIds: string[];

  sourceAsset: IBCDenom;
  destAsset: IBCDenom;

  amountIn: string;

  userSwap: SwapIn;
  userSwapAmountOut: string;

  feeSwap?: SwapExactCoinOut;

  swapChainId: string;
  totalAffiliateFee: string;
}

export async function getSwapRoute(request: SwapRouteRequest) {
  const response = await axios.post(`${API_URL}/ibc/swap_route`, request);

  return response.data as SwapRouteResponse;
}

export interface SwapMsgsRequest {
  preSwapHops: IBCHop[];
  postSwapHops: IBCHop[];

  chainIdsToAddresses: Record<string, string>;

  sourceAsset: IBCDenom;
  destAsset: IBCDenom;
  amountIn: string;

  userSwap: SwapIn;
  userSwapAmountOut: string;
  userSwapSlippageTolerancePercent: string;

  feeSwap?: SwapExactCoinOut;
  affiliates: Affiliate[];
}

export interface SwapMsgsResponse {
  requested: MultiHopMsg[];
}

export async function getSwapMessages(request: SwapMsgsRequest) {
  const response = await axios.post(`${API_URL}/ibc/swap_msgs`, request);

  return response.data as SwapMsgsResponse;
}
