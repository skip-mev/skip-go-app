import { AxiosInstance, AxiosResponse } from "axios";
import { Packet, StatusError, StatusState, TransferInfo } from "../types";

export interface StatusRequest {
  tx_hash: string;
  chain_id: string;
}

export interface StatusResponse {
  status: StatusState;
  transfer_sequence: TransferInfo[];
  error?: StatusError;
}

export interface TrackRequest {
  tx_hash: string;
  chain_id: string;
}

export interface TrackResponse {
  success: boolean;
  tx_hash: string;
}

export class TransactionService {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  async track(txHash: string, chainID: string): Promise<TrackResponse> {
    const response = await this.httpClient.post<
      TrackResponse,
      AxiosResponse<TrackResponse, any>,
      TrackRequest
    >("/tx/track", {
      tx_hash: txHash,
      chain_id: chainID,
    });

    return response.data;
  }

  async status(txHash: string, chainID: string): Promise<StatusResponse> {
    const params: StatusRequest = {
      tx_hash: txHash,
      chain_id: chainID,
    };

    const response = await this.httpClient.get<StatusResponse>("/tx/status", {
      params,
    });

    return response.data;
  }
}
