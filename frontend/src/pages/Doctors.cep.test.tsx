import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Doctors from './Doctors';
import { cepApi } from '@/api/cep';
import { medicosApi } from '@/api/medicos';
import { especialidadesApi } from '@/api/especialidades';
import { toast } from 'sonner';

vi.mock('@/components/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { login: 'funcionario@voll.med', role: 'ROLE_FUNCIONARIO' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/api/medicos', () => ({
  medicosApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/api/especialidades', () => ({
  especialidadesApi: {
    listAll: vi.fn(),
  },
}));

vi.mock('@/api/cep', () => ({
  cepApi: {
    consultar: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const cepApiMock = vi.mocked(cepApi);
const medicosApiMock = vi.mocked(medicosApi);
const especialidadesApiMock = vi.mocked(especialidadesApi);
const toastMock = vi.mocked(toast);

function emptyPage() {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  };
}

describe('Doctors - Integração CEP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    medicosApiMock.list.mockResolvedValue(emptyPage());
    especialidadesApiMock.listAll.mockResolvedValue([
      { id: 1, nome: 'Ortopedia' },
      { id: 2, nome: 'Cardiologia' },
    ]);
  });

  it('busca CEP, autopreenche campos de endereço, preserva número já digitado e mantém campos editáveis', async () => {
    cepApiMock.consultar.mockResolvedValueOnce({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
      complemento: 'lado ímpar',
    });

    render(<Doctors />);

    // Abrir modal de novo médico
    const novoBtn = await screen.findByRole('button', { name: /novo médico/i });
    await userEvent.click(novoBtn);

    const dialog = await screen.findByRole('dialog');
    const modal = within(dialog);

    // Preencher número antes da busca
    const inputNumero = modal.getByLabelText(/número/i);
    await userEvent.type(inputNumero, '1234');

    // Preencher CEP
    const inputCep = modal.getByLabelText(/cep/i);
    await userEvent.type(inputCep, '01001000');

    // Clicar em Buscar CEP
    const buscarCepBtn = modal.getByRole('button', { name: /buscar cep/i });
    await userEvent.click(buscarCepBtn);

    // Verificar chamada do endpoint
    expect(cepApiMock.consultar).toHaveBeenCalledWith('01001000');

    // Verificar preenchimento automático
    await waitFor(() => {
      expect(modal.getByLabelText(/logradouro/i)).toHaveValue('Praça da Sé');
      expect(modal.getByLabelText(/bairro/i)).toHaveValue('Sé');
      expect(modal.getByLabelText(/cidade/i)).toHaveValue('São Paulo');
      expect(modal.getByLabelText(/^uf/i)).toHaveValue('SP');
      expect(modal.getByLabelText(/complemento/i)).toHaveValue('lado ímpar');
      // Número deve ter sido preservado
      expect(modal.getByLabelText(/número/i)).toHaveValue('1234');
    });

    // Campos continuam editáveis
    const inputCidade = modal.getByLabelText(/cidade/i);
    await userEvent.clear(inputCidade);
    await userEvent.type(inputCidade, 'São Paulo Capital');
    expect(inputCidade).toHaveValue('São Paulo Capital');

    expect(toastMock.success).toHaveBeenCalledWith('Endereço encontrado e preenchido!');
  });

  it('exibe erro amigável caso a API de CEP falhe, sem quebrar o formulário', async () => {
    cepApiMock.consultar.mockRejectedValueOnce({
      response: { data: [{ campo: 'cep', mensagem: 'CEP não encontrado' }] },
    });

    render(<Doctors />);

    const novoBtn = await screen.findByRole('button', { name: /novo médico/i });
    await userEvent.click(novoBtn);

    const dialog = await screen.findByRole('dialog');
    const modal = within(dialog);

    const inputCep = modal.getByLabelText(/cep/i);
    await userEvent.type(inputCep, '99999999');

    const buscarCepBtn = modal.getByRole('button', { name: /buscar cep/i });
    await userEvent.click(buscarCepBtn);

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('cep: CEP não encontrado');
    });

    // O formulário continua aberto e utilizável
    expect(modal.getByLabelText(/logradouro/i)).toHaveValue('');
  });

  it('exibe validação caso o usuário tente buscar com menos de 8 dígitos', async () => {
    render(<Doctors />);

    const novoBtn = await screen.findByRole('button', { name: /novo médico/i });
    await userEvent.click(novoBtn);

    const dialog = await screen.findByRole('dialog');
    const modal = within(dialog);

    const inputCep = modal.getByLabelText(/cep/i);
    await userEvent.type(inputCep, '12345');

    const buscarCepBtn = modal.getByRole('button', { name: /buscar cep/i });
    await userEvent.click(buscarCepBtn);

    expect(toastMock.error).toHaveBeenCalledWith('Informe um CEP válido com 8 dígitos para buscar.');
    expect(cepApiMock.consultar).not.toHaveBeenCalled();
  });
});
