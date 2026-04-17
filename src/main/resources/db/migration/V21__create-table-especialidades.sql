CREATE TABLE especialidades (
    id   BIGINT       NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    ativo TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_especialidade_nome (nome)
);

INSERT INTO especialidades (nome) VALUES
    ('ORTOPEDIA'),
    ('CARDIOLOGIA'),
    ('GINECOLOGIA'),
    ('DERMATOLOGIA');

ALTER TABLE medicos ADD COLUMN especialidade_id BIGINT;

UPDATE medicos m
    JOIN especialidades e ON m.especialidade = e.nome
SET m.especialidade_id = e.id;

ALTER TABLE medicos MODIFY especialidade_id BIGINT NOT NULL;

ALTER TABLE medicos
    ADD CONSTRAINT fk_medico_especialidade
    FOREIGN KEY (especialidade_id) REFERENCES especialidades (id);

ALTER TABLE medicos DROP COLUMN especialidade;
