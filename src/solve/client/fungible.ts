import { AxiosInstance, AxiosResponse } from "axios";
import {
  Affiliate,
  Asset,
  MultiChainMsg,
  Operation,
  SwapVenue,
} from "../types";

export interface AssetsRequest {
  chain_id?: string;
  native_only?: boolean;
}

export interface AssetsResponse {
  chain_to_assets_map: Record<string, { assets: Asset[] }>;
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

export interface MsgsRequest {
  source_asset_denom: string;
  source_asset_chain_id: string;
  dest_asset_denom: string;
  dest_asset_chain_id: string;
  amount_in: string;
  address_list: string[];
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

  async getAssets(
    request: AssetsRequest = {}
  ): Promise<Record<string, Asset[]>> {
    const response = await this.httpClient.get<AssetsResponse>(
      "/fungible/assets",
      {
        params: request,
      }
    );

    return Object.entries(response.data.chain_to_assets_map).reduce(
      (acc, [chainID, { assets }]) => {
        acc[chainID] = assets;

        return acc;
      },
      {} as Record<string, Asset[]>
    );
  }

  async getMessages(request: MsgsRequest): Promise<MsgsResponse> {
    const response = await this.httpClient.post<
      MsgsResponse,
      AxiosResponse<MsgsResponse, any>,
      MsgsRequest
    >("/fungible/msgs", request);

    return response.data;
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
}
