import { AxiosInstance, AxiosResponse } from "axios";
import { Affiliate, MultiChainMsg, Operation, SwapVenue } from "../types";

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

export class FungibleService {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const response = await this.httpClient.post<
      RouteResponse,
      AxiosResponse<RouteResponse, any>,
      RouteRequest
    >("/fungible/route", {
      ...request,
      cumulative_affiliate_fee_bps: request.cumulative_affiliate_fee_bps ?? "0",
    });

    return response.data;
  }

  async getMessages(request: MsgsRequest): Promise<MsgsResponse> {
    const response = await this.httpClient.post<
      MsgsResponse,
      AxiosResponse<MsgsResponse, any>,
      MsgsRequest
    >("/fungible/msgs", request);

    return response.data;
  }
}
