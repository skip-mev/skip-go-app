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
