--- Trigger que seta o status da ocorrência (Entrada = 'E' ou Saída = 'S') 
--- de acordo com o status da última ocorrência de um determinado usuário.
--- Se a última ocorrência for entrada setar como saída e vice-versa.

DELIMITER$$

CREATE OR REPLACE TRIGGER seta_status
    AFTER INSERT
    ON tb_ocorrencia FOR EACH ROW
BEGIN
    DECLARE st_oc CHAR(1);

    SELECT st_ocorrencia
    INTO st_oc
    FROM tb_ocorrencia
    WHERE id_cadastro = NEW.id_cadastro
    ORDER BY TIMESTAMP(dt_ocorrencia,hr_ocorrencia) DESC
    LIMIT 1

    IF st_oc = 'E' THEN
        SET NEW.st_ocorrencia = 'S'
    ELSE
        SET NEW.st_ocorrencia = 'E'
END$$

DELIMITER;