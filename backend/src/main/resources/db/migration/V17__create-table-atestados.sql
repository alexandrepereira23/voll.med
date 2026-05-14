CREATE TABLE atestados (
    id            BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prontuario_id BIGINT NOT NULL,
    dias_afastamento INT NOT NULL,
    cid10         VARCHAR(10),
    data_emissao  DATE NOT NULL,
    observacoes   TEXT,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_atestados_prontuario FOREIGN KEY (prontuario_id) REFERENCES prontuarios(id)
);
