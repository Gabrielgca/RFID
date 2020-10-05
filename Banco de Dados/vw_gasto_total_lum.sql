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

-- Esta View seleciona todos os intervalos em que o dispositivo 2 
-- ficou com o status em 'aceso'.
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

-- Esta View seleciona os intervalos 'não-vazios' de todas as salas.
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

-- Esta View seleciona os intervalos 'vazios' de todas as salas.
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

-- Esta View seleciona o tempo em que o laboratório ficou vazio e
-- com o seu status de luminosidade em 'aceso', e o gasto total,em Watts,
-- nessa situação específica.
CREATE OR REPLACE VIEW vw_gasto_total_lum_lab AS
    SELECT 	DISP.id_dispositivo AS DISPOSITIVO,
			LOC_DISP.no_localizacao AS NOME_LOCAL,
			TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) AS TEMP_NAO_VAZIO,
			TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AS TEMP_ACESO,
			TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) AS TEMP_VAZIO,
			TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO) AS TEMP_APAGADO,
			TEMPO_ACESO AS TOTAL_TEMP_ACESO,
			SEC_TO_TIME(
				TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
			) AS TEMPO_ACESO_E_VAZIO,
			ROUND(
				(TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
				)) / POWER(60,2)
			,1) AS HORAS_ACESO_E_VAZIO,
			ROUND(
				(TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
				)) / POWER(60,2) * LOC_DISP.vl_qtde_lampadas * LOC_DISP.vl_consumo_lamp
			,1) AS CONSUMO_TOTAL_WATTS
	FROM vw_lum_tempo_aceso AS TEMPO_ACESO
	LEFT JOIN vw_loc_tempo_nao_vazio AS TEMPO_NAO_VAZIO
	ON  (((TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) BETWEEN
		TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO)
		) OR
		(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) BETWEEN
		TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO)
		)) OR
		(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) <
		 TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		 TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) >
		 TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO)))	     
	    AND TEMPO_NAO_VAZIO.DISPOSITIVO = 2
	INNER JOIN tb_dispositivo AS DISP ON id_dispositivo = 2
	INNER JOIN tb_disp_localizacao AS DISP_LOC ON DISP.id_dispositivo = DISP_LOC.id_dispositivo
	INNER JOIN tb_localizacao_disp AS LOC_DISP ON DISP_LOC.id_localizacao_disp = LOC_DISP.id_localizacao_disp
	GROUP BY TEMPO_ACESO,TEMP_APAGADO
	ORDER BY TEMP_ACESO;
	
-- Esta View seleciona o tempo em que a sala principal ficou vazia e
-- com a seu status de luminosidade em 'aceso', e o gasto total,em Watts,
-- nessa situação específica.
CREATE OR REPLACE VIEW vw_gasto_total_lum_principal AS
    SELECT 	DISP.id_dispositivo AS DISPOSITIVO,
			LOC_DISP_PRINCIPAL.no_localizacao AS NOME_LOCAL,
			TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) AS TEMP_NAO_VAZIO,
			TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AS TEMP_ACESO,
			TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) AS TEMP_VAZIO,
			TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO) AS TEMP_APAGADO,
			TEMPO_ACESO.TEMPO_ACESO AS TOTAL_TEMP_ACESO,
			SEC_TO_TIME(
				TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
			) AS TEMPO_ACESO_E_VAZIO,
			ROUND(
				(TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
				)) / POWER(60,2) 
			,1)AS HORAS_ACESO_E_VAZIO,
			(LOC_DISP_PRINCIPAL.vl_qtde_lampadas*LOC_DISP_PRINCIPAL.vl_consumo_lamp*
			ROUND(
				(TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
				)) / POWER(60,2),
			1))+
			(LOC_DISP_SALA_REUNIAO.vl_qtde_lampadas*LOC_DISP_SALA_REUNIAO.vl_consumo_lamp*
			ROUND(
				(TIME_TO_SEC(TEMPO_ACESO.TEMPO_ACESO)
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
				)) / POWER(60,2),
			1))	AS CONSUMO_TOTAL_WATTS,
			((LOC_DISP_PRINCIPAL.vl_qtde_lampadas * LOC_DISP_PRINCIPAL.vl_consumo_lamp)
		   + (LOC_DISP_SALA_REUNIAO.vl_qtde_lampadas * LOC_DISP_SALA_REUNIAO.vl_consumo_lamp)) AS CONSUMO_LAMPS
	FROM vw_lum_tempo_aceso AS TEMPO_ACESO
	LEFT JOIN vw_loc_tempo_nao_vazio AS TEMPO_NAO_VAZIO
	ON  (((TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) BETWEEN
		TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO)
		) OR
		(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) BETWEEN
		TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		TIMESTAMP(TEMPO_ACESO.DATA_APAGADO,TEMPO_ACESO.HORA_APAGADO)
		)) OR
		(TIMESTAMP(TEMPO_NAO_VAZIO.DATA_NAO_VAZIO,TEMPO_NAO_VAZIO.HORA_NAO_VAZIO) <
		 TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO) AND
		 TIMESTAMP(TEMPO_NAO_VAZIO.DATA_VAZIO,TEMPO_NAO_VAZIO.HORA_VAZIO) >
		 TIMESTAMP(TEMPO_ACESO.DATA_ACESO,TEMPO_ACESO.HORA_ACESO)))	     
	    AND TEMPO_NAO_VAZIO.DISPOSITIVO = 1
	INNER JOIN tb_dispositivo AS DISP ON id_dispositivo = 1
	INNER JOIN tb_disp_localizacao AS DISP_LOC ON DISP.id_dispositivo = DISP_LOC.id_dispositivo
	INNER JOIN tb_localizacao_disp AS LOC_DISP_PRINCIPAL ON DISP_LOC.id_localizacao_disp = LOC_DISP_PRINCIPAL.id_localizacao_disp
	INNER JOIN tb_localizacao_disp AS LOC_DISP_SALA_REUNIAO ON LOC_DISP_SALA_REUNIAO.id_localizacao_disp = 3 
	GROUP BY TEMPO_ACESO,TEMP_APAGADO
	ORDER BY TEMP_ACESO;