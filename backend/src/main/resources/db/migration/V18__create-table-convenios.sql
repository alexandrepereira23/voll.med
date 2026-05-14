CREATE TABLE convenios (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(150) NOT NULL,
    codigo_ans  VARCHAR(20) NOT NULL,
    tipo        VARCHAR(20) NOT NULL,
    ativo       TINYINT(1) NOT NULL DEFAULT 1,
    criado_em   DATETIME,
    atualizado_em DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_convenio_codigo_ans (codigo_ans)
);

CREATE TABLE convenio_pacientes (
    id                  BIGINT NOT NULL AUTO_INCREMENT,
    paciente_id         BIGINT NOT NULL,
    convenio_id         BIGINT NOT NULL,
    numero_carteirinha  VARCHAR(50) NOT NULL,
    validade            DATE,
    ativo               TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_convenio_paciente (paciente_id, convenio_id),
    CONSTRAINT fk_convenio_pacientes_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes (id),
    CONSTRAINT fk_convenio_pacientes_convenio FOREIGN KEY (convenio_id) REFERENCES convenios (id)
);

ALTER TABLE consultas
    ADD COLUMN convenio_id BIGINT,
    ADD CONSTRAINT fk_consultas_convenio FOREIGN KEY (convenio_id) REFERENCES convenios (id);
