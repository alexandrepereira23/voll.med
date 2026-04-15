CREATE TABLE auditoria_prontuario (
    id            BIGINT NOT NULL AUTO_INCREMENT,
    prontuario_id BIGINT,
    usuario_id    BIGINT,
    acao          VARCHAR(20) NOT NULL,
    data_hora     DATETIME NOT NULL,
    ip_origem     VARCHAR(45),
    PRIMARY KEY (id),
    KEY idx_auditoria_prontuario_data (prontuario_id, data_hora)
);
