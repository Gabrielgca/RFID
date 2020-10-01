USE `db_rfid_v2`;

-- Esta função retorna a próxima data em que ocorreu um status 'apagado'
-- à partir do atual status 'aceso' enviado.
CREATE OR REPLACE FUNCTION NEXT_DT_APAGADO(id_curr_aceso INT, id_disp INT)
RETURNS DATE    
    RETURN (SELECT dt_ocorrencia
           FROM db_indoor.tb_estado_dispositivo
           WHERE id_estado_dispositivo > id_curr_aceso
           AND id_dispositivo = id_disp
           AND st_estado = '0'
           LIMIT 1);

-- Esta função retorna a próxima hora em que ocorreu um status 'apagado'
-- à partir do atual status 'aceso' enviado.
CREATE OR REPLACE FUNCTION NEXT_HR_APAGADO(id_curr_aceso INT, id_disp INT)
RETURNS TIME
    RETURN (SELECT hr_ocorrencia
           FROM db_indoor.tb_estado_dispositivo
           WHERE id_estado_dispositivo > id_curr_aceso
           AND id_dispositivo = id_disp
           AND st_estado = '0'
           LIMIT 1);

-- Esta função retorna a próxima data em que uma localização ficou vazia.
CREATE OR REPLACE FUNCTION NEXT_DT_VAZIO(id_curr_nao_vazio INT, id_disp_loc INT)
RETURNS DATE
    RETURN (SELECT dt_ocupacao
           FROM tb_ocupacao
           WHERE id_ocupacao > id_curr_nao_vazio
           AND id_disp_localizacao = id_disp_loc
           AND nr_pessoas <= 0
           LIMIT 1);

-- Esta função retorna a próxima data em que uma localização deixou
-- de estar vazia.
CREATE OR REPLACE FUNCTION NEXT_DT_NAO_VAZIO(id_curr_vazio INT, id_disp_loc INT)
RETURNS DATE
    RETURN (SELECT dt_ocupacao
           FROM tb_ocupacao
           WHERE id_ocupacao > id_curr_vazio
           AND id_disp_localizacao = id_disp_loc
           AND nr_pessoas > 0
           LIMIT 1);

-- Esta função retorna a próxima hora em que uma localização ficou vazia.
CREATE OR REPLACE FUNCTION NEXT_HR_VAZIO(id_curr_nao_vazio INT, id_disp_loc INT)
RETURNS TIME
    RETURN (SELECT hr_ocupacao
           FROM tb_ocupacao
           WHERE id_ocupacao > id_curr_nao_vazio
           AND id_disp_localizacao = id_disp_loc
           AND nr_pessoas <= 0
           LIMIT 1);

-- Esta função retorna a próxima hora em que uma localização deixou
-- de estar vazia.
CREATE OR REPLACE FUNCTION NEXT_HR_NAO_VAZIO(id_curr_vazio INT, id_disp_loc INT)
RETURNS TIME
    RETURN (SELECT hr_ocupacao
           FROM tb_ocupacao
           WHERE id_ocupacao > id_curr_vazio
           AND id_disp_localizacao = id_disp_loc
           AND nr_pessoas > 0
           LIMIT 1);

-- Esta função decide qual data incial enviar, para o calculo de
-- consumo: se a data em que se teve início o status 'aceso',
-- ou se a data em que a sala ficou vazia.
CREATE OR REPLACE FUNCTION DATA_INICIO_CONS (dt_vazio DATE, hr_vazio TIME, dt_nao_vazio DATE, hr_nao_vazio TIME)
RETURNS DATE
     RETURN (SELECT CASE
                        WHEN DATA_ACESO > dt_vazio THEN
                            DATA_ACESO
                        ELSE
                            dt_vazio
                        END
            FROM vw_lum_tempo_aceso
            WHERE TIMESTAMP(dt_vazio,hr_vazio) BETWEEN
                  TIMESTAMP(DATA_ACESO,HORA_ACESO) AND
                  TIMESTAMP(DATA_APAGADO,HORA_APAGADO) 
            OR TIMESTAMP(dt_nao_vazio,hr_nao_vazio) BETWEEN 
               TIMESTAMP(DATA_ACESO,HORA_ACESO) AND 
               TIMESTAMP(DATA_APAGADO,HORA_APAGADO)
            LIMIT 1);

-- Esta função decide qual hora incial enviar, para o calculo de
-- consumo: se a hora em que se teve início o status 'aceso',
-- ou se a hora em que a sala ficou vazia.
CREATE OR REPLACE FUNCTION HORA_INICIO_CONS (dt_vazio DATE, hr_vazio TIME, dt_nao_vazio DATE, hr_nao_vazio TIME)
RETURNS TIME
     RETURN (SELECT CASE
                        WHEN HORA_ACESO > hr_vazio THEN
                            HORA_ACESO
                        ELSE
                            hr_vazio
                        END
            FROM vw_lum_tempo_aceso
            WHERE TIMESTAMP(dt_vazio,hr_vazio) BETWEEN
                  TIMESTAMP(DATA_ACESO,HORA_ACESO) AND
                  TIMESTAMP(DATA_APAGADO,HORA_APAGADO) 
            OR TIMESTAMP(dt_nao_vazio,hr_nao_vazio) BETWEEN 
               TIMESTAMP(DATA_ACESO,HORA_ACESO) AND 
               TIMESTAMP(DATA_APAGADO,HORA_APAGADO)
            LIMIT 1);

-- Esta função decide qual data final enviar, para o calculo de
-- consumo: se a data em que se encerrou o status 'aceso',
-- ou se a data em que a sala deixou de ficar vazia.
CREATE OR REPLACE FUNCTION DATA_FIM_CONS (dt_vazio DATE, hr_vazio TIME, dt_nao_vazio DATE, hr_nao_vazio TIME)
RETURNS DATE
     RETURN (SELECT CASE
                        WHEN DATA_APAGADO > dt_nao_vazio THEN
                            dt_nao_vazio
                        ELSE
                            DATA_APAGADO
                        END
            FROM vw_lum_tempo_aceso
            WHERE TIMESTAMP(dt_vazio,hr_vazio) BETWEEN
                  TIMESTAMP(DATA_ACESO,HORA_ACESO) AND
                  TIMESTAMP(DATA_APAGADO,HORA_APAGADO) 
            OR TIMESTAMP(dt_nao_vazio,hr_nao_vazio) BETWEEN 
               TIMESTAMP(DATA_ACESO,HORA_ACESO) AND 
               TIMESTAMP(DATA_APAGADO,HORA_APAGADO)
            LIMIT 1);            

-- Esta função decide qual hora final enviar, para o calculo de
-- consumo: se a hora em que se encerrou o status 'aceso',
-- ou se a hora em que a sala deixou de ficar vazia.
CREATE OR REPLACE FUNCTION HORA_FIM_CONS (dt_vazio DATE, hr_vazio TIME, dt_nao_vazio DATE, hr_nao_vazio TIME)
RETURNS TIME
     RETURN (SELECT CASE
                        WHEN HORA_APAGADO > hr_nao_vazio THEN
                            hr_nao_vazio
                        ELSE
                            HORA_APAGADO
                        END
            FROM vw_lum_tempo_aceso
            WHERE TIMESTAMP(dt_vazio,hr_vazio) BETWEEN
                  TIMESTAMP(DATA_ACESO,HORA_ACESO) AND
                  TIMESTAMP(DATA_APAGADO,HORA_APAGADO) 
            OR TIMESTAMP(dt_nao_vazio,hr_nao_vazio) BETWEEN 
               TIMESTAMP(DATA_ACESO,HORA_ACESO) AND 
               TIMESTAMP(DATA_APAGADO,HORA_APAGADO)
            LIMIT 1);

CREATE OR REPLACE VIEW vw_lum_tempo_aceso AS
    SELECT ED_ACESO.dt_ocorrencia AS DATA_ACESO, 
           ED_ACESO.hr_ocorrencia AS HORA_ACESO, 
           NEXT_DT_APAGADO(ED_ACESO.id_estado_dispositivo,ED_ACESO.id_dispositivo) as DATA_APAGADO,
           NEXT_HR_APAGADO(ED_ACESO.id_estado_dispositivo,ED_ACESO.id_dispositivo) as HORA_APAGADO,
           TIMEDIFF(TIMESTAMP(IFNULL(NEXT_DT_APAGADO(ED_ACESO.id_estado_dispositivo,ED_ACESO.id_dispositivo),CURRENT_DATE),
                              IFNULL(NEXT_HR_APAGADO(ED_ACESO.id_estado_dispositivo,ED_ACESO.id_dispositivo),CURRENT_TIME)),
                    TIMESTAMP(ED_ACESO.dt_ocorrencia,ED_ACESO.hr_ocorrencia)) AS TEMPO_ACESO
    FROM db_indoor.tb_estado_dispositivo as ED_ACESO
    WHERE ED_ACESO.id_dispositivo = 2
    AND ED_ACESO.st_estado = '1'
    GROUP BY ED_ACESO.dt_ocorrencia,ED_ACESO.hr_ocorrencia;   

CREATE OR REPLACE VIEW vw_loc_tempo_nao_vazio AS
    SELECT DISP_LOC.id_dispositivo AS DISPOSITIVO,
		   OCP_NAO_VAZIO.dt_ocupacao AS DATA_NAO_VAZIO,
           OCP_NAO_VAZIO.hr_ocupacao AS HORA_NAO_VAZIO,
           IFNULL(NEXT_DT_VAZIO(OCP_NAO_VAZIO.id_ocupacao,OCP_NAO_VAZIO.id_disp_localizacao),CURRENT_DATE) AS DATA_VAZIO,
           IFNULL(NEXT_HR_VAZIO(OCP_NAO_VAZIO.id_ocupacao,OCP_NAO_VAZIO.id_disp_localizacao),CURRENT_TIME) AS HORA_VAZIO,
           TIMEDIFF(TIMESTAMP(IFNULL(NEXT_DT_VAZIO(OCP_NAO_VAZIO.id_ocupacao,OCP_NAO_VAZIO.id_disp_localizacao),CURRENT_DATE),
                              IFNULL(NEXT_HR_VAZIO(OCP_NAO_VAZIO.id_ocupacao,OCP_NAO_VAZIO.id_disp_localizacao),CURRENT_TIME)),
                    TIMESTAMP(OCP_NAO_VAZIO.dt_ocupacao,OCP_NAO_VAZIO.hr_ocupacao)) AS TEMPO_NAO_VAZIO
    FROM tb_ocupacao AS OCP_NAO_VAZIO
	INNER JOIN tb_disp_localizacao AS DISP_LOC ON OCP_NAO_VAZIO.id_disp_localizacao = DISP_LOC.id_disp_localizacao
    WHERE OCP_NAO_VAZIO.nr_pessoas > 0
    GROUP BY DISPOSITIVO,DATA_VAZIO,HORA_VAZIO;

CREATE OR REPLACE VIEW vw_loc_tempo_vazio AS
    SELECT DISP_LOC.id_dispositivo AS DISPOSITIVO,
		   OCP_VAZIO.dt_ocupacao AS DATA_VAZIO,
           OCP_VAZIO.hr_ocupacao AS HORA_VAZIO,
           IFNULL(NEXT_DT_NAO_VAZIO(OCP_VAZIO.id_ocupacao,OCP_VAZIO.id_disp_localizacao),CURRENT_DATE) AS DATA_NAO_VAZIO,
           IFNULL(NEXT_HR_NAO_VAZIO(OCP_VAZIO.id_ocupacao,OCP_VAZIO.id_disp_localizacao),CURRENT_TIME) AS HORA_NAO_VAZIO,
           TIMEDIFF(TIMESTAMP(IFNULL(NEXT_DT_NAO_VAZIO(OCP_VAZIO.id_ocupacao,OCP_VAZIO.id_disp_localizacao),CURRENT_DATE),
                              IFNULL(NEXT_HR_NAO_VAZIO(OCP_VAZIO.id_ocupacao,OCP_VAZIO.id_disp_localizacao),CURRENT_TIME)),
                    TIMESTAMP(OCP_VAZIO.dt_ocupacao,OCP_VAZIO.hr_ocupacao)) AS TEMPO_VAZIO
    FROM tb_ocupacao AS OCP_VAZIO
	INNER JOIN tb_disp_localizacao AS DISP_LOC ON OCP_VAZIO.id_disp_localizacao = DISP_LOC.id_disp_localizacao
    WHERE OCP_VAZIO.nr_pessoas <= 0
    GROUP BY DISPOSITIVO,DATA_NAO_VAZIO,HORA_NAO_VAZIO;

-- Esta View seleciona o tempo em que uma sala ficou vazia e
-- com a seu status de luminosidade em 'aceso', e o gasto total,
-- nessa situação específica.
CREATE OR REPLACE VIEW vw_gasto_total_lum_lab AS
    SELECT 	TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) AS TEMP_NAO_VAZIO,
			TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AS TEMP_ACESO,
			TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) AS TEMP_VAZIO,
			TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO) AS TEMP_APAGADO,
			TIMEDIFF(TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO),
					 TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO)) AS TOTAL_TEMP_ACESO,
			SEC_TO_TIME(
				TIME_TO_SEC(
					TIMEDIFF(TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO),
							 TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO))
				)
				-
				IFNULL(
					SUM(
						TIME_TO_SEC(
							TIMEDIFF(
								IF(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) >
								   TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO),
									TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO),
									TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO)
								),
								IF(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) <
								   TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO),
									TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO),
									TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO)					
								)
							)
						)
					),
					0
				)
			) AS TEMPO_ACESO_E_VAZIO
	FROM vw_lum_tempo_aceso AS TEMPO_ACESO
	LEFT JOIN vw_loc_tempo_nao_vazio AS TEMPO_NAO_VAZIO
	ON  ((TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) BETWEEN
		TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO)
		) OR
		(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) BETWEEN
		TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO)
		))
	    AND TEMPO_NAO_VAZIO.DISPOSITIVO = 3
	GROUP BY TEMPO_ACESO,TEMP_APAGADO
	ORDER BY TEMP_ACESO;