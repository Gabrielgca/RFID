-- Esta procedure lê as ocorrências do sistema RFID e
-- insere as rotas e ocupações para este, caso elas
-- ainda não existam.

USE `db_rfid_v2`;

DELIMITER // 

CREATE OR REPLACE PROCEDURE insert_ocupacao(IN id_disp INT,IN dt_ocorrencia DATE,IN hr_ocorrencia TIME)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE IDC INT;
    DECLARE ocupacao INT DEFAULT 0;
    DECLARE qtde_ocupacoes INT DEFAULT 0;
    DECLARE cadastros CURSOR FOR SELECT id_cadastro FROM tb_cadastro;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cadastros;

    insere: LOOP
        FETCH cadastros INTO IDC;
        IF done THEN
            LEAVE insere;
        END IF;

        IF EXISTS (SELECT * FROM tb_rota 
                  WHERE id_cadastro = IDC) THEN
            SELECT id_rota
            INTO @ult_rota_cadastro
            FROM tb_rota
            WHERE id_cadastro = IDC
            ORDER BY id_rota DESC,TIMESTAMP(dt_rota,hr_rota) DESC
            LIMIT 1;
            
            SELECT COUNT(*)
            INTO ocupacao
            FROM tb_rota
            WHERE id_rota = @ult_rota_cadastro
            AND id_dispositivo_destino = id_disp;

            SET qtde_ocupacoes = qtde_ocupacoes + ocupacao;
        END IF;
    END LOOP;

    SELECT id_disp_localizacao
    INTO @id_disp_localizacao
    FROM tb_disp_localizacao
    WHERE id_dispositivo = id_disp;

    INSERT INTO tb_ocupacao(id_disp_localizacao,dt_ocupacao,hr_ocupacao,nr_pessoas)
    VALUES(@id_disp_localizacao,dt_ocorrencia,hr_ocorrencia,qtde_ocupacoes);
END;//

DELIMITER ;

DELIMITER //

CREATE OR REPLACE PROCEDURE insert_rotas_ocupacoes ()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE IDO,IDD,IDC INT;
    DECLARE DTO DATE;
    DECLARE HRO TIME;
    DECLARE STO CHAR(1);
    DECLARE ocorrencias CURSOR FOR SELECT * FROM tb_ocorrencia;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN ocorrencias;

    insere: LOOP
        FETCH ocorrencias INTO IDO,IDD,IDC,DTO,HRO,STO;
        IF done THEN
            LEAVE insere;
        END IF;

        IF EXISTS (SELECT *
                  FROM tb_ocorrencia
                  WHERE id_cadastro = IDC
                  AND id_ocorrencia < IDO) THEN
            SELECT id_dispositivo,st_ocorrencia
            INTO @curr_disp,@curr_status
            FROM tb_ocorrencia
            WHERE id_cadastro = IDC
            AND id_ocorrencia < IDO
            ORDER BY id_ocorrencia DESC,TIMESTAMP(dt_ocorrencia,hr_ocorrencia) DESC
            LIMIT 1;
        ELSE
            SET @curr_disp = NULL;
        END IF;

        IF @curr_disp IS NULL THEN
            IF IDD = 1 AND STO = 'E' THEN
                INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                VALUES(NULL,IDD,IDC,DTO,HRO);

                CALL insert_ocupacao(IDD,DTO,HRO);
            ELSE
                IF IDD = 1 AND STO = 'S' THEN
                    INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                    VALUES(IDD,NULL,IDC,DTO,HRO);

                    CALL insert_ocupacao(IDD,DTO,HRO);
                ELSE
                    IF STO = 'E' THEN
                        INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                        VALUES(1,IDD,IDC,DTO,HRO);

                        CALL insert_ocupacao(1,DTO,HRO);
                        CALL insert_ocupacao(IDD,DTO,HRO);
                    ELSE 
                        IF STO = 'S' THEN
                            INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                            VALUES(IDD,1,IDC,DTO,HRO);

                            CALL insert_ocupacao(IDD,DTO,HRO);
                            CALL insert_ocupacao(1,DTO,HRO);
                        END IF;
                    END IF;
                END IF;
            END IF;
        ELSE
            IF IDD = @curr_disp THEN
                IF @curr_status = 'E' THEN
                    SELECT id_dispositivo_origem,id_dispositivo_destino
                    INTO @ult_id_disp_origem,@ult_id_disp_destino
                    FROM tb_rota
                    WHERE id_cadastro = IDC
                    ORDER BY id_rota DESC,TIMESTAMP(dt_rota,hr_rota) DESC
                    LIMIT 1;
                    
                    IF @ult_id_disp_origem IS NOT NULL THEN                
                        INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                        VALUES(@ult_id_disp_destino,@ult_id_disp_origem,IDC,DTO,HRO);

                        CALL insert_ocupacao(IDD,DTO,HRO);
                        CALL insert_ocupacao(@ult_id_disp_origem,DTO,HRO);
                    END IF;
                ELSE    
                    SELECT id_dispositivo_destino
                    INTO @ult_id_disp_destino
                    FROM tb_rota
                    WHERE id_cadastro = IDC
                    ORDER BY id_rota DESC,TIMESTAMP(dt_rota,hr_rota) DESC
                    LIMIT 1;

                    INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                    VALUES(@ult_id_disp_destino,IDD,IDC,DTO,HRO);

                    CALL insert_ocupacao(IDD,DTO,HRO);
                END IF;
            ELSE
                SELECT id_dispositivo_origem,id_dispositivo_destino
                INTO @ult_id_disp_origem,@ult_id_disp_destino
                FROM tb_rota
                WHERE id_cadastro = IDC
                ORDER BY id_rota DESC,TIMESTAMP(dt_rota,hr_rota) DESC
                LIMIT 1;

                INSERT INTO tb_rota (id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                VALUES(@ult_id_disp_destino,IDD,IDC,DTO,HRO);

                CALL insert_ocupacao(@ult_id_disp_destino,DTO,HRO);
                CALL insert_ocupacao(IDD,DTO,HRO);
            END IF;
        END IF;
    END LOOP;
END;//

DELIMITER ;
