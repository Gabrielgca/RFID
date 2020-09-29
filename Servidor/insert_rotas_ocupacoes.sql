-- Esta procedure lê as ocorrências do sistema RFID e
-- insere as rotas e ocupações para este, caso elas
-- ainda não existam.

USE `db_rfid_v2`;

DELIMITER // 

CREATE OR REPLACE PROCEDURE insert_ocupacao(IN id_disp INT,IN id_rta INT,IN dt_ocorrencia DATE,IN hr_ocorrencia TIME)
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
                  WHERE id_cadastro = IDC
				  AND id_rota <= id_rta) THEN
            SELECT id_rota
            INTO @ult_rota_cadastro
            FROM tb_rota
            WHERE id_cadastro = IDC
			AND id_rota <= id_rta
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
    DECLARE IDO,IDR,IDD,IDC INT;
    DECLARE DTO,DTR DATE;
    DECLARE HRO,HRR TIME;
    DECLARE STO CHAR(1);
    DECLARE ocorrencias CURSOR FOR SELECT * FROM tb_ocorrencia;
	DECLARE rotas CURSOR FOR SELECT * FROM tb_rota;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

	CREATE TEMPORARY TABLE tb_rota_temp(
		id_dispositivo_origem INT,
		id_dispositivo_destino INT,
		id_cadastro INT,
		dt_rota DATE,
		hr_rota TIME
	);
	
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
            SELECT id_dispositivo,st_ocorrencia,dt_ocorrencia,hr_ocorrencia
            INTO @curr_disp,@curr_status,@curr_dt_ocorrencia,@curr_hr_ocorrencia
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
                INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                VALUES(NULL,IDD,IDC,DTO,HRO);
            ELSE
                IF IDD = 1 AND STO = 'S' THEN
                    INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                    VALUES(IDD,NULL,IDC,DTO,HRO);
                ELSE
                    IF STO = 'E' THEN
                        INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                        VALUES(1,IDD,IDC,DTO,HRO);
                    ELSE 
                        IF STO = 'S' THEN
                            INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
                            VALUES(IDD,1,IDC,DTO,HRO);
                        END IF;
                    END IF;
                END IF;
            END IF;
        ELSE
			IF STO = 'E' THEN				
				IF @curr_disp = 1 AND IDD = 1 THEN
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(1,NULL,IDC,@curr_dt_ocorrencia,@curr_hr_ocorrencia);
					
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(NULL,1,IDC,DTO,HRO);
				ELSE
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(@curr_disp,IDD,IDC,@curr_dt_ocorrencia,@curr_hr_ocorrencia);
				END IF;
			END IF;
        END IF;
    END LOOP;
	INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		SELECT id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota
		FROM tb_rota_temp
		ORDER BY TIMESTAMP(dt_rota,hr_rota) ASC;
		
	IF EXISTS (SELECT *
			   FROM tb_rota) THEN
		OPEN rotas;
		SET done = FALSE;
		
		insere2: LOOP
			FETCH rotas INTO IDR,IDO,IDD,IDC,DTR,HRR;
			IF done THEN
				LEAVE insere2;
			END IF;
			
			IF (IDO IS NULL AND IDD = 1) OR (IDO = 1 AND IDD IS NULL) THEN
				CALL insert_ocupacao(1,IDR,DTR,HRR);
			ELSE
				CALL insert_ocupacao(IDO,IDR,DTR,HRR);
				CALL insert_ocupacao(IDD,IDR,DTR,HRR);
			END IF;
		END LOOP;
	END IF;
END;//

DELIMITER ;
