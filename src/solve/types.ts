export interface Asset {
  denom: string;
  chain_id: string;

  origin_denom: string;
  origin_chain_id: string;

  symbol?: string;
  name?: string;
  logo_uri?: string;
  decimals?: number;
}

export type AssetWithMetadata = Required<Asset>;

export interface Chain {
  chain_name: string;
  chain_id: string;
  pfm_enabled: boolean;
  cosmos_sdk_version: string;
  modules: Record<string, ModuleVersionInfo>;
}

export interface ModuleVersionInfo {
  path: string;
  version: string;
  sum: string;
}

export interface SwapVenue {
  name: string;
  chain_id: string;
}

export interface SwapOperation {
  pool: string;
  denom_in: string;
  denom_out: string;
}

export interface SwapExactCoinOut {
  swap_venue: SwapVenue;
  swap_operations: SwapOperation[];
  swap_amount_out: string;
}

export interface SwapIn {
  swap_venue: SwapVenue;
  swap_operations: SwapOperation[];
  swap_amount_in?: string;
}

export interface Transfer {
  port: string;
  channel: string;
  chain_id: string;
  pfm_enabled: boolean;
  dest_denom: string;
}

export interface Swap {
  swap_in?: SwapIn;
  swap_out?: SwapExactCoinOut;
  estimated_affiliate_fee?: string;
}

export interface OperationWithSwap {
  swap: Swap;
  transfer: never;
}

export interface OperationWithTransfer {
  swap: never;
  transfer: Transfer;
}

export type Operation = OperationWithSwap | OperationWithTransfer;

export function isSwapOperation(
  operation: Operation
): operation is OperationWithSwap {
  return operation.swap !== undefined;
}

export function isTransferOperation(
  operation: Operation
): operation is OperationWithTransfer {
  return operation.transfer !== undefined;
}

export interface Affiliate {
  basis_points_fee: string;
  address: string;
}

export interface MultiChainMsg {
  chain_id: string;
  path: string[];
  msg: string;
  msg_type_url: string;
}
