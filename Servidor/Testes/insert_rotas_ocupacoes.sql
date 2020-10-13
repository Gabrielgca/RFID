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
    DECLARE cadastros CURSOR FOR SELECT id_cadastro FROM tb_cadastro;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT IF(QTDE_PESSOAS.VAL < 0,0,QTDE_PESSOAS.VAL)
	INTO @qtde_ocupacoes
	FROM (SELECT ENTRADAS.CONT - SAIDAS.CONT AS VAL 
		  FROM (SELECT COUNT(*) AS CONT
			    FROM tb_rota
				WHERE id_dispositivo_destino = id_disp
				AND id_rota <= id_rta) AS ENTRADAS,
			   (SELECT COUNT(*) AS CONT
				FROM tb_rota
				WHERE id_dispositivo_origem = id_disp
				AND id_rota <= id_rta) AS SAIDAS) AS QTDE_PESSOAS; 

    SELECT id_disp_localizacao
    INTO @id_disp_localizacao
    FROM tb_disp_localizacao
    WHERE id_dispositivo = id_disp;

    INSERT INTO tb_ocupacao(id_disp_localizacao,dt_ocupacao,hr_ocupacao,nr_pessoas)
    VALUES(@id_disp_localizacao,dt_ocorrencia,hr_ocorrencia,@qtde_ocupacoes);
END;//

DELIMITER ;

CREATE OR REPLACE FUNCTION GET_NEXT_OCORRENCIA_CADASTRO(id_ocorr INT,id_cadas INT)
RETURNS INT
	RETURN (SELECT id_dispositivo
	        FROM tb_ocorrencia
			WHERE id_cadastro = id_cadas
			AND id_ocorrencia > id_ocorr
			ORDER BY id_ocorrencia ASC,TIMESTAMP(dt_ocorrencia,hr_ocorrencia) ASC
			LIMIT 1);

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
		id_rota INT AUTO_INCREMENT,
		id_dispositivo_origem INT,
		id_dispositivo_destino INT,
		id_cadastro INT,
		dt_rota DATE,
		hr_rota TIME,
		PRIMARY KEY (id_rota)
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
            INTO @prev_ocorrencia_disp,@prev_ocorrencia_status,@prev_dt_ocorrencia,@prev_hr_ocorrencia
            FROM tb_ocorrencia
            WHERE id_cadastro = IDC
            AND id_ocorrencia < IDO
            ORDER BY id_ocorrencia DESC,TIMESTAMP(dt_ocorrencia,hr_ocorrencia) DESC
            LIMIT 1;
        ELSE
            SET @prev_ocorrencia_disp = NULL;
        END IF;

		IF IDD = 1 AND STO = 'E' THEN
			IF EXISTS (SELECT *
					   FROM tb_rota_temp
					   WHERE id_cadastro = IDC) THEN
			    SELECT id_dispositivo_origem,id_dispositivo_destino
				INTO @ult_dispositivo_origem,@ult_dispositivo_destino
				FROM tb_rota_temp
				WHERE id_cadastro = IDC
				ORDER BY id_rota DESC,TIMESTAMP(dt_rota,hr_rota) DESC
				LIMIT 1;
			
				IF @ult_dispositivo_destino IS NULL THEN
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(NULL,IDD,IDC,DTO,HRO);
				ELSE
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(IDD,NULL,IDC,DTO,HRO);
					
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(NULL,IDD,IDC,DTO,HRO);
				END IF;
			ELSE
				INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
				VALUES(NULL,IDD,IDC,DTO,HRO);	
			END IF;
		ELSE
			IF IDD = 1 AND STO = 'S' THEN
				IF IFNULL(GET_NEXT_OCORRENCIA_CADASTRO(IDO,IDC),1) = 1 THEN
					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
					VALUES(IDD,NULL,IDC,DTO,HRO);
				END IF;
			ELSE
				IF STO = 'E' THEN
					IF NOT EXISTS(SELECT *
								  FROM tb_rota_temp
								  WHERE id_cadastro = IDC) THEN
						INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
						VALUES(NULL,1,IDC,DTO,HRO);
					END IF;
					
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
        -- ELSE
		--	IF STO = 'E' THEN				
		--		IF @prev_ocorrencia_disp = 1 AND IDD = 1 THEN
		--			INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		--			VALUES(1,NULL,IDC,@prev_dt_ocorrencia,@prev_hr_ocorrencia);
		--			
		--			INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		--			VALUES(NULL,1,IDC,DTO,HRO);
		--		ELSE
		--			IF @prev_ocorrencia_disp != IDD THEN
		--				IF @prev_ocorrencia_disp != 1 THEN
		--					INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		--					VALUES(@prev_ocorrencia_disp,1,IDC,@prev_dt_ocorrencia,@prev_hr_ocorrencia);
		--				END IF;
		--				INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		--				VALUES(1,IDD,IDC,@prev_dt_ocorrencia,@prev_hr_ocorrencia);
		--			ELSE
		--				SELECT id_dispositivo_origem,id_dispositivo_destino
		--				INTO @ult_dispositivo_origem,@ult_dispositivo_destino
		--				FROM tb_rota_temp
		--				WHERE id_cadastro = IDC
		--				ORDER BY id_rota DESC,TIMESTAMP(dt_rota,hr_rota) DESC
		--				LIMIT 1;
		--										
		--				INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		--				VALUES(@ult_dispositivo_destino,@ult_dispositivo_origem,IDC,@prev_dt_ocorrencia,@prev_hr_ocorrencia);
		--				
		--				INSERT INTO tb_rota_temp(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		--				VALUES(@ult_dispositivo_origem,@ult_dispositivo_destino,IDC,@prev_dt_ocorrencia,@prev_hr_ocorrencia);
		--			END IF;
		--		END IF;
		--	END IF;
        -- END IF;
    END LOOP;
	INSERT INTO tb_rota(id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota)
		SELECT id_dispositivo_origem,id_dispositivo_destino,id_cadastro,dt_rota,hr_rota
		FROM tb_rota_temp
		ORDER BY id_rota ASC,TIMESTAMP(dt_rota,hr_rota) ASC;
		
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
