ALTER TABLE consultas
    ADD COLUMN consulta_origem_id BIGINT NULL,
    ADD COLUMN cancelado_por      VARCHAR(20) NULL,
    ADD CONSTRAINT fk_consultas_origem FOREIGN KEY (consulta_origem_id) REFERENCES consultas(id);
