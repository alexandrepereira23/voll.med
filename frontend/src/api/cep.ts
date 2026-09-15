import api from './axios';

export interface EnderecoCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}

export const cepApi = {
  consultar: async (cep: string): Promise<EnderecoCepResponse> => {
    const { data } = await api.get<EnderecoCepResponse>(`/enderecos/cep/${cep}`);
    return data;
  },
};
