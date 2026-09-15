import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Patients from './Patients';
import { cepApi } from '@/api/cep';
import { pacientesApi } from '@/api/pacientes';
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

vi.mock('@/api/pacientes', () => ({
  pacientesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
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
const pacientesApiMock = vi.mocked(pacientesApi);
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

describe('Patients - Integração CEP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pacientesApiMock.list.mockResolvedValue(emptyPage());
  });

  it('busca CEP, autopreenche campos de endereço e preserva o número no cadastro de paciente', async () => {
    cepApiMock.consultar.mockResolvedValueOnce({
      cep: '74000-000',
      logradouro: 'Avenida Goiás',
      bairro: 'Central',
      cidade: 'Goiânia',
      uf: 'GO',
      complemento: '',
    });

    render(<Patients />);

    // Abrir modal de novo paciente
    const novoBtn = await screen.findByRole('button', { name: /novo paciente/i });
    await userEvent.click(novoBtn);

    const dialog = await screen.findByRole('dialog');
    const modal = within(dialog);

    // Digita número antes
    const inputNumero = modal.getByLabelText(/número/i);
    await userEvent.type(inputNumero, '999');

    // Digita CEP
    const inputCep = modal.getByLabelText(/cep/i);
    await userEvent.type(inputCep, '74000000');

    // Clica em Buscar CEP
    const buscarCepBtn = modal.getByRole('button', { name: /buscar cep/i });
    await userEvent.click(buscarCepBtn);

    expect(cepApiMock.consultar).toHaveBeenCalledWith('74000000');

    await waitFor(() => {
      expect(modal.getByLabelText(/logradouro/i)).toHaveValue('Avenida Goiás');
      expect(modal.getByLabelText(/bairro/i)).toHaveValue('Central');
      expect(modal.getByLabelText(/cidade/i)).toHaveValue('Goiânia');
      expect(modal.getByLabelText(/^uf/i)).toHaveValue('GO');
      expect(modal.getByLabelText(/número/i)).toHaveValue('999');
    });

    expect(toastMock.success).toHaveBeenCalledWith('Endereço encontrado e preenchido!');
  });

  it('ao cadastrar paciente, o CEP no payload é sanitizado para 8 dígitos numéricos', async () => {
    pacientesApiMock.create.mockResolvedValueOnce({} as any);

    render(<Patients />);

    const novoBtn = await screen.findByRole('button', { name: /novo paciente/i });
    await userEvent.click(novoBtn);

    const dialog = await screen.findByRole('dialog');
    const modal = within(dialog);

    await userEvent.type(modal.getByLabelText(/nome/i), 'Carlos Silva');
    await userEvent.type(modal.getByLabelText(/e-mail/i), 'carlos@silva.com');
    await userEvent.type(modal.getByLabelText(/telefone/i), '62999998888');
    await userEvent.type(modal.getByLabelText(/cpf/i), '12345678901');

    await userEvent.type(modal.getByLabelText(/cep/i), '74000000');
    await userEvent.type(modal.getByLabelText(/^uf/i), 'GO');
    await userEvent.type(modal.getByLabelText(/cidade/i), 'Goiânia');
    await userEvent.type(modal.getByLabelText(/logradouro/i), 'Rua 10');
    await userEvent.type(modal.getByLabelText(/bairro/i), 'Setor Sul');
    await userEvent.type(modal.getByLabelText(/número/i), '100');

    const cadastrarBtn = modal.getByRole('button', { name: /^cadastrar$/i });
    await userEvent.click(cadastrarBtn);

    await waitFor(() => {
      expect(pacientesApiMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Carlos Silva',
          cpf: '12345678901',
          endereco: expect.objectContaining({
            cep: '74000000',
            logradouro: 'Rua 10',
            bairro: 'Setor Sul',
            cidade: 'Goiânia',
            uf: 'GO',
            numero: '100',
          }),
        })
      );
    });
  });
});
