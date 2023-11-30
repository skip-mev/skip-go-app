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

export interface ChainTransaction {
  chain_id: string;
  tx_hash: string;
}

export interface ModuleVersionInfo {
  path: string;
  version: string;
  sum: string;
}

export type TransferState =
  | "TRANSFER_UNKNOWN"
  | "TRANSFER_PENDING"
  | "TRANSFER_RECEIVED"
  | "TRANSFER_SUCCESS"
  | "TRANSFER_FAILURE";

export interface TransferInfo {
  src_chain_id: string;
  dst_chain_id: string;
  state: TransferState;
  packet_txs: Packet;
}

export interface Packet {
  send_tx?: ChainTransaction;
  receive_tx?: ChainTransaction;
  acknowledge_tx?: ChainTransaction;
  timeout_tx?: ChainTransaction;

  error?: PacketError;
}

export interface PacketError {
  code: number;
  message: string;
}

export interface StatusError {
  code: number;
  message: string;
}

export type StatusState =
  | "STATE_UNKNOWN"
  | "STATE_SUBMITTED"
  | "STATE_PENDING"
  | "STATE_RECEIVED"
  | "STATE_COMPLETED"
  | "STATE_ABANDONED";

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
  operation: Operation,
): operation is OperationWithSwap {
  return operation.swap !== undefined;
}

export function isTransferOperation(
  operation: Operation,
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
