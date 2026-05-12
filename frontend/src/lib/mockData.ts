// Mock data for Voll.med system

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  crm: string;
  specialty: string;
  address: {
    zipCode?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    number?: string;
    complement?: string;
  };
  status: 'active' | 'inactive';
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: {
    zipCode?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    number?: string;
    complement?: string;
  };
  status: 'active' | 'inactive';
}

export interface Specialty {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface Insurance {
  id: string;
  name: string;
  ansCode: string;
  type: string;
  status: 'active' | 'inactive';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  insuranceId?: string;
  date: string;
  time: string;
  type: 'consultation' | 'return' | 'teleconsultation';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  priority: 'routine' | 'medium' | 'high';
  originConsultation?: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  lastConsultation: string;
  diagnosis?: string;
  status: 'open' | 'closed';
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicalRecordId: string;
  date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  status: 'active' | 'cancelled';
  notes?: string;
}

export interface Certificate {
  id: string;
  patientId: string;
  doctorId: string;
  issueDate: string;
  daysOff: number;
  cid?: string;
  notes?: string;
}

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dra. Ana Paula Souza',
    email: 'ana.souza@vollmed.com',
    phone: '(62) 99999-0001',
    crm: '12345/GO',
    specialty: 'Cardiologia',
    address: {
      zipCode: '74000-000',
      street: 'Avenida Goiás',
      neighborhood: 'Centro',
      city: 'Goiânia',
      state: 'GO',
      number: '1000',
      complement: 'Sala 501',
    },
    status: 'active',
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@vollmed.com',
    phone: '(62) 99999-0002',
    crm: '12346/GO',
    specialty: 'Dermatologia',
    address: {
      zipCode: '74000-100',
      street: 'Rua 1',
      neighborhood: 'Setor Central',
      city: 'Goiânia',
      state: 'GO',
      number: '500',
    },
    status: 'active',
  },
  {
    id: '3',
    name: 'Dra. Fernanda Costa',
    email: 'fernanda.costa@vollmed.com',
    phone: '(62) 99999-0003',
    crm: '12347/GO',
    specialty: 'Pediatria',
    address: {
      zipCode: '74000-200',
      street: 'Avenida Parque',
      neighborhood: 'Oeste',
      city: 'Goiânia',
      state: 'GO',
      number: '750',
    },
    status: 'active',
  },
  {
    id: '4',
    name: 'Dr. Roberto Silva',
    email: 'roberto.silva@vollmed.com',
    phone: '(62) 99999-0004',
    crm: '12348/GO',
    specialty: 'Ortopedia',
    address: {
      zipCode: '74000-300',
      street: 'Rua 2',
      neighborhood: 'Leste',
      city: 'Goiânia',
      state: 'GO',
      number: '250',
    },
    status: 'active',
  },
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(62) 98888-0001',
    cpf: '123.456.789-00',
    address: {
      zipCode: '74000-000',
      street: 'Avenida Goiás',
      neighborhood: 'Centro',
      city: 'Goiânia',
      state: 'GO',
      number: '1500',
    },
    status: 'active',
  },
  {
    id: '2',
    name: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    phone: '(62) 98888-0002',
    cpf: '234.567.890-11',
    address: {
      zipCode: '74000-100',
      street: 'Rua 1',
      neighborhood: 'Setor Central',
      city: 'Goiânia',
      state: 'GO',
      number: '800',
    },
    status: 'active',
  },
  {
    id: '3',
    name: 'Pedro Ferreira Lima',
    email: 'pedro.ferreira@email.com',
    phone: '(62) 98888-0003',
    cpf: '345.678.901-22',
    address: {
      zipCode: '74000-200',
      street: 'Avenida Parque',
      neighborhood: 'Oeste',
      city: 'Goiânia',
      state: 'GO',
      number: '1200',
    },
    status: 'active',
  },
  {
    id: '4',
    name: 'Ana Paula Gomes',
    email: 'ana.paula@email.com',
    phone: '(62) 98888-0004',
    cpf: '456.789.012-33',
    address: {
      zipCode: '74000-300',
      street: 'Rua 2',
      neighborhood: 'Leste',
      city: 'Goiânia',
      state: 'GO',
      number: '600',
    },
    status: 'active',
  },
  {
    id: '5',
    name: 'Lucas Martins Alves',
    email: 'lucas.martins@email.com',
    phone: '(62) 98888-0005',
    cpf: '567.890.123-44',
    address: {
      zipCode: '74000-400',
      street: 'Rua 3',
      neighborhood: 'Norte',
      city: 'Goiânia',
      state: 'GO',
      number: '450',
    },
    status: 'active',
  },
];

// Mock Specialties
export const mockSpecialties: Specialty[] = [
  { id: '1', name: 'Cardiologia', status: 'active' },
  { id: '2', name: 'Dermatologia', status: 'active' },
  { id: '3', name: 'Pediatria', status: 'active' },
  { id: '4', name: 'Ortopedia', status: 'active' },
  { id: '5', name: 'Clínica Geral', status: 'active' },
  { id: '6', name: 'Oftalmologia', status: 'active' },
];

// Mock Insurance
export const mockInsurance: Insurance[] = [
  {
    id: '1',
    name: 'Unimed',
    ansCode: '34028-1',
    type: 'Operadora',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bradesco Saúde',
    ansCode: '34029-0',
    type: 'Operadora',
    status: 'active',
  },
  {
    id: '3',
    name: 'Amil',
    ansCode: '34030-4',
    type: 'Operadora',
    status: 'active',
  },
  {
    id: '4',
    name: 'Particular',
    ansCode: 'N/A',
    type: 'Particular',
    status: 'active',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    insuranceId: '1',
    date: '2026-05-10',
    time: '09:00',
    type: 'consultation',
    status: 'scheduled',
    priority: 'routine',
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    insuranceId: '2',
    date: '2026-05-10',
    time: '10:30',
    type: 'consultation',
    status: 'confirmed',
    priority: 'medium',
  },
  {
    id: '3',
    patientId: '3',
    doctorId: '3',
    insuranceId: '3',
    date: '2026-05-11',
    time: '14:00',
    type: 'return',
    status: 'scheduled',
    priority: 'routine',
  },
  {
    id: '4',
    patientId: '4',
    doctorId: '4',
    insuranceId: '1',
    date: '2026-05-11',
    time: '15:30',
    type: 'teleconsultation',
    status: 'scheduled',
    priority: 'high',
  },
  {
    id: '5',
    patientId: '5',
    doctorId: '1',
    insuranceId: '4',
    date: '2026-05-12',
    time: '11:00',
    type: 'consultation',
    status: 'cancelled',
    priority: 'routine',
  },
];

// Mock Medical Records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    lastConsultation: '2026-05-08',
    diagnosis: 'Hipertensão Arterial',
    status: 'open',
    notes: 'Paciente em acompanhamento regular',
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    lastConsultation: '2026-05-07',
    diagnosis: 'Dermatite Atópica',
    status: 'open',
    notes: 'Prescrever tratamento tópico',
  },
  {
    id: '3',
    patientId: '3',
    doctorId: '3',
    lastConsultation: '2026-05-06',
    diagnosis: 'Otite Média',
    status: 'closed',
  },
  {
    id: '4',
    patientId: '4',
    doctorId: '4',
    lastConsultation: '2026-05-05',
    diagnosis: 'Fratura de Tíbia',
    status: 'open',
    notes: 'Acompanhamento pós-operatório',
  },
];

// Mock Prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    medicalRecordId: '1',
    date: '2026-05-08',
    medications: [
      {
        name: 'Losartana',
        dosage: '50mg',
        frequency: '1x ao dia',
        duration: '30 dias',
      },
    ],
    status: 'active',
    notes: 'Tomar pela manhã',
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    medicalRecordId: '2',
    date: '2026-05-07',
    medications: [
      {
        name: 'Hidrocortisona',
        dosage: '1%',
        frequency: '2x ao dia',
        duration: '14 dias',
      },
    ],
    status: 'active',
  },
];

// Mock Certificates
export const mockCertificates: Certificate[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    issueDate: '2026-05-08',
    daysOff: 3,
    cid: 'I10',
    notes: 'Repouso indicado',
  },
  {
    id: '2',
    patientId: '3',
    doctorId: '3',
    issueDate: '2026-05-06',
    daysOff: 7,
    cid: 'H66',
  },
];

// Dashboard stats
export const getDashboardStats = () => ({
  appointmentsToday: mockAppointments.filter(
    (apt) => apt.date === new Date().toISOString().split('T')[0]
  ).length,
  totalPatients: mockPatients.length,
  activeDoctors: mockDoctors.filter((doc) => doc.status === 'active').length,
  pendingAppointments: mockAppointments.filter(
    (apt) => apt.status === 'scheduled'
  ).length,
});

// Get today's appointments
export const getTodayAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockAppointments
    .filter((apt) => apt.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
};
