CREATE TABLE prescricoes (
    id            BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prontuario_id BIGINT NOT NULL,
    tipo          VARCHAR(20) NOT NULL,
    data_emissao  DATE NOT NULL,
    data_validade DATE NOT NULL,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_prescricoes_prontuario FOREIGN KEY (prontuario_id) REFERENCES prontuarios(id)
);

CREATE TABLE prescricao_itens (
    id            BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prescricao_id BIGINT NOT NULL,
    medicamento   VARCHAR(200) NOT NULL,
    dosagem       VARCHAR(100) NOT NULL,
    posologia     VARCHAR(500) NOT NULL,
    duracao       VARCHAR(100) NOT NULL,
    CONSTRAINT fk_prescricao_itens_prescricao FOREIGN KEY (prescricao_id) REFERENCES prescricoes(id)
);
