import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './axios';
import { cepApi } from './cep';

vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const apiMock = vi.mocked(api);

describe('cepApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar GET /enderecos/cep/{cep} e retornar os dados', async () => {
    const mockEndereco = {
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
      complemento: 'lado ímpar',
    };

    apiMock.get.mockResolvedValueOnce({ data: mockEndereco });

    const resultado = await cepApi.consultar('01001000');

    expect(apiMock.get).toHaveBeenCalledWith('/enderecos/cep/01001000');
    expect(resultado).toEqual(mockEndereco);
  });

  it('deve propagar erro quando a chamada da API falhar', async () => {
    apiMock.get.mockRejectedValueOnce(new Error('Erro de rede'));

    await expect(cepApi.consultar('00000000')).rejects.toThrow('Erro de rede');
    expect(apiMock.get).toHaveBeenCalledWith('/enderecos/cep/00000000');
  });
});
