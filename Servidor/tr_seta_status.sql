-- Trigger que seta o status da ocorrência (Entrada = 'E' ou Saída = 'S') 
-- de acordo com o status da última ocorrência de um determinado usuário.
-- Se a última ocorrência for entrada setar como saída e vice-versa.

USE `db_rfid`;

DELIMITER $$

CREATE OR REPLACE TRIGGER set_new_status
    BEFORE INSERT
    ON tb_ocorrencia FOR EACH ROW
BEGIN
    DECLARE st_oc CHAR(1);

    IF EXISTS (SELECT * FROM tb_ocorrencia
               WHERE id_cadastro = NEW.id_cadastro) THEN

        SET @ocorrencia_exists = TRUE;
        SET @new_id_ocorrencia = NEW.id_ocorrencia;
        SET @curr_id_cadastro = NEW.id_cadastro;
        
        SELECT st_ocorrencia
        INTO @curr_st_ocorrencia
        FROM tb_ocorrencia
        WHERE id_cadastro = NEW.id_cadastro
        AND id_dispositivo = NEW.id_dispositivo
        ORDER BY TIMESTAMP(dt_ocorrencia,hr_ocorrencia) DESC
        LIMIT 1;
    ELSE
        set @ocorrencia_exists = FALSE;
    END IF;
END$$

CREATE OR REPLACE TRIGGER upd_ocorrencia_status
    BEFORE INSERT
    ON tb_ocorrencia FOR EACH ROW
    FOLLOWS set_new_status
BEGIN
    IF @ocorrencia_exists = TRUE THEN
        IF @curr_st_ocorrencia = 'E' THEN
            SET NEW.st_ocorrencia = 'S';
        ELSE
            SET NEW.st_ocorrencia = 'E';
        END IF;
    END IF;
END$$

DELIMITER ;


