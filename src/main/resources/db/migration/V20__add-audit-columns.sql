ALTER TABLE medicos
    ADD COLUMN criado_em DATETIME,
    ADD COLUMN atualizado_em DATETIME;

ALTER TABLE pacientes
    ADD COLUMN criado_em DATETIME,
    ADD COLUMN atualizado_em DATETIME;

ALTER TABLE consultas
    ADD COLUMN criado_em DATETIME,
    ADD COLUMN atualizado_em DATETIME;

ALTER TABLE prontuarios
    ADD COLUMN criado_em DATETIME,
    ADD COLUMN atualizado_em DATETIME;

ALTER TABLE prescricoes
    ADD COLUMN criado_em DATETIME,
    ADD COLUMN atualizado_em DATETIME;

ALTER TABLE atestados
    ADD COLUMN criado_em DATETIME,
    ADD COLUMN atualizado_em DATETIME;
