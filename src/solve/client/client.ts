import https from "https";
import axios, { AxiosInstance } from "axios";
import { Chain } from "../types";
import { FungibleService } from "./fungible";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.skip.money/v1";

export const ENDPOINTS = {
  GET_CHAINS: `${API_URL}/info/chains`,
  GET_ROUTE: `${API_URL}/fungible/route`,
};

interface GetChainsResponse {
  chains: Chain[];
}

export class SkipClient {
  private httpClient: AxiosInstance;
  private ignoreChains: string[];

  public fungible: FungibleService;

  constructor(ignoreChains: string[] = []) {
    this.ignoreChains = ignoreChains;

    const agent = new https.Agent({
      keepAlive: true,
    });

    this.httpClient = axios.create({
      baseURL: API_URL,
      httpsAgent: agent,
    });

    this.fungible = new FungibleService(this.httpClient);
  }

  async chains(): Promise<Chain[]> {
    const response = await this.httpClient.get<GetChainsResponse>(
      "/info/chains"
    );

    const { chains } = response.data;

    return chains.filter(
      (chain) => !this.ignoreChains.includes(chain.chain_id)
    );
  }
}
