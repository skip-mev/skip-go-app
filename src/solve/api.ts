import axios from "axios";
import { Affiliate, Chain, MultiChainMsg, Operation, SwapVenue } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.skip.money/v1";

interface GetChainsResponse {
  chains: Chain[];
}

const IGNORE_CHAINS = ["agoric", "8ball", "akashnet-2"];

export async function getChains() {
  const response = await axios.get<GetChainsResponse>(`${API_URL}/info/chains`);

  const chains = response.data.chains as Chain[];

  return chains.filter((chain) => !IGNORE_CHAINS.includes(chain.chain_name));
}

export interface RouteRequest {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;

  cumulative_affiliate_fee_bps?: string;
  swap_venue?: SwapVenue;
}

export interface RouteResponse {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;

  operations: Operation[];
  chain_ids: string[];

  does_swap: boolean;
  estimated_amount_out?: string;
  swap_venue?: SwapVenue;
}

export async function getRoute(request: RouteRequest) {
  const response = await axios.post(`${API_URL}/fungible/route`, {
    ...request,
    cumulative_affiliate_fee_bps: "0",
  });

  return response.data as RouteResponse;
}

export interface MsgsRequest {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  chain_ids_to_addresses: Record<string, string>;
  operations: Operation[];

  estimated_amount_out?: string;
  slippage_tolerance_percent?: string;
  affiliates?: Affiliate[];
}

export interface MsgsResponse {
  msgs: MultiChainMsg[];
}

export async function getMessages(request: MsgsRequest) {
  const response = await axios.post(`${API_URL}/fungible/msgs`, request);

  return response.data as MsgsResponse;
}
