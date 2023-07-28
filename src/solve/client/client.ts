import https from "https";
import axios, { AxiosInstance } from "axios";
import { Chain } from "../types";
import { FungibleService } from "./fungible";
import { TransactionService } from "./transaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.skip.money/v1";

interface GetChainsResponse {
  chains: Chain[];
}

export class SkipClient {
  private httpClient: AxiosInstance;
  private ignoreChains: string[];

  public fungible: FungibleService;
  public transaction: TransactionService;

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
    this.transaction = new TransactionService(this.httpClient);
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
