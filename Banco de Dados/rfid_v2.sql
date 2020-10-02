-- MySQL Script generated by MySQL Workbench
-- Fri Sep 25 16:18:32 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

-- -----------------------------------------------------
-- Database `db_rfid_v2`
-- -----------------------------------------------------
DROP DATABASE IF EXISTS `db_rfid_v2`;
CREATE DATABASE `db_rfid_v2`;
USE `db_rfid_v2`;

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Table `tb_cadastro`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_cadastro` (
  `id_cadastro` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Indentificador do cadastro.',
  `no_usuario` VARCHAR(45) NOT NULL COMMENT 'Nome do usuário cadastrado.',
  `ed_arquivo_imagem` VARCHAR(70) NULL COMMENT 'Endereço no servidor da imagem do usuário.',
  `vl_idade` INT NOT NULL COMMENT 'Idade, em anos, do usuário.',
  `no_area_trabalho` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id_cadastro`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_cadastro_UNIQUE` ON `tb_cadastro` (`id_cadastro` ASC);


-- -----------------------------------------------------
-- Table `tb_dispositivo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_dispositivo` (
  `id_dispositivo` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Idendificador do dispositivo.',
  `no_dispositivo` VARCHAR(15) NOT NULL COMMENT 'Descrição do dispositivo.',
  `st_ativo` CHAR(1) NOT NULL DEFAULT 'A' COMMENT 'Status ativo ou inativo do dispositivo.',
  PRIMARY KEY (`id_dispositivo`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_dispositivo_UNIQUE` ON `tb_dispositivo` (`id_dispositivo` ASC);


-- -----------------------------------------------------
-- Table `tb_ocorrencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_ocorrencia` (
  `id_ocorrencia` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador da ocorrência.',
  `id_dispositivo` INT UNSIGNED NOT NULL COMMENT 'Identificador do dispositivo.',
  `id_cadastro` INT UNSIGNED NOT NULL COMMENT 'Identificador do cadastro.',
  `dt_ocorrencia` DATE NOT NULL COMMENT 'Data em que houve a detecção de um movimento.',
  `hr_ocorrencia` TIME NOT NULL COMMENT 'Hora em que houve a detecção de um movimento.',
  `st_ocorrencia` CHAR(1) NOT NULL DEFAULT 'E' COMMENT 'Se o movimento foi de \'entrada\' ou \'saída\'.',
  PRIMARY KEY (`id_ocorrencia`),
  CONSTRAINT `fk_tb_ocorrencia_tb_dispositivo1`
    FOREIGN KEY (`id_dispositivo`)
    REFERENCES `tb_dispositivo` (`id_dispositivo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_ocorrencia_cadastro1`
    FOREIGN KEY (`id_cadastro`)
    REFERENCES `tb_cadastro` (`id_cadastro`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_ocorrencia_UNIQUE` ON `tb_ocorrencia` (`id_ocorrencia` ASC);

CREATE INDEX `fk_tb_ocorrencia_tb_dispositivo1_idx` ON `tb_ocorrencia` (`id_dispositivo` ASC);

CREATE INDEX `fk_tb_ocorrencia_tb_cadastro1_idx` ON `tb_ocorrencia` (`id_cadastro` ASC);


-- -----------------------------------------------------
-- Table `tb_cartao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_cartao` (
  `id_cartao` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Indentificador do cartão.',
  `no_cartao` VARCHAR(10) NOT NULL COMMENT 'Tag RFID do cartão.',
  PRIMARY KEY (`id_cartao`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_cartao_UNIQUE` ON `tb_cartao` (`id_cartao` ASC);

CREATE UNIQUE INDEX `no_cartao_UNIQUE` ON `tb_cartao` (`no_cartao` ASC);


-- -----------------------------------------------------
-- Table `tb_cadastro_cartao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_cadastro_cartao` (
  `id_cadastro_cartao` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador da associação entre cadastro e cartão.',
  `id_cadastro` INT UNSIGNED NOT NULL COMMENT 'Identificador do cadastro.',
  `id_cartao` INT UNSIGNED NOT NULL COMMENT 'Identificador do cartão.',
  `st_estado` CHAR(1) NOT NULL COMMENT 'Indica se o cartão está ativo ou inativo\n',
  PRIMARY KEY (`id_cadastro_cartao`),
  CONSTRAINT `fk_tb_cadastro_cartao_tb_cadastro1`
    FOREIGN KEY (`id_cadastro`)
    REFERENCES `tb_cadastro` (`id_cadastro`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_cadastro_cartao_tb_cartao1`
    FOREIGN KEY (`id_cartao`)
    REFERENCES `tb_cartao` (`id_cartao`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_tb_cadastro_cartao_tb_cadastro1_idx` ON `tb_cadastro_cartao` (`id_cadastro` ASC);

CREATE INDEX `fk_tb_cadastro_cartao_tb_cartao1_idx` ON `tb_cadastro_cartao` (`id_cartao` ASC);

CREATE UNIQUE INDEX `id_cadastro_cartao_UNIQUE` ON `tb_cadastro_cartao` (`id_cadastro_cartao` ASC);


-- -----------------------------------------------------
-- Table `tb_localizacao_disp`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_localizacao_disp` (
  `id_localizacao_disp` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificação da localização do dispositivo',
  `no_empresa` VARCHAR(40) NOT NULL COMMENT 'Nome da empresa em que se encontra a localização.',
  `no_localizacao` VARCHAR(40) NOT NULL COMMENT 'Nome da localização do dispositivo',
  `vl_andar` INT NULL COMMENT 'Indicação do andar da localização\n',
  `vl_area` INT NOT NULL COMMENT 'Tamanho em metros quadrados da localização.',
  `vl_qtde_lampadas` INT NOT NULL COMMENT 'Quantidade de lâmpadas instaladas na localização.',
  `vl_consumo_lamp` INT NOT NULL COMMENT 'Consumo total por lâmpada instalada, em watts.',
  `ed_arquivo_imagem` VARCHAR(70) NULL COMMENT 'Endereço no servidor da imagem da localização.',
  `st_status` CHAR(1) NOT NULL DEFAULT 'A',
  PRIMARY KEY (`id_localizacao_disp`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_localizacao_disp_UNIQUE` ON `tb_localizacao_disp` (`id_localizacao_disp` ASC);


-- -----------------------------------------------------
-- Table `tb_disp_localizacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_disp_localizacao` (
  `id_disp_localizacao` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador tabela associativa \'Dispositivo Localização\'.',
  `id_dispositivo` INT UNSIGNED NOT NULL COMMENT 'Idenificador do dispositivo',
  `id_localizacao_disp` INT UNSIGNED NOT NULL COMMENT 'Identificador da localização do dispositivo\n',
  `st_situacao` CHAR(1) NOT NULL COMMENT 'Status indicando Ativo e Inativo\n',
  PRIMARY KEY (`id_disp_localizacao`),
  CONSTRAINT `fk_tb_disp_localizacao_tb_localizacao_disp1`
    FOREIGN KEY (`id_localizacao_disp`)
    REFERENCES `tb_localizacao_disp` (`id_localizacao_disp`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_disp_localizacao_tb_dispositivo1`
    FOREIGN KEY (`id_dispositivo`)
    REFERENCES `tb_dispositivo` (`id_dispositivo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_tb_disp_localizacao_tb_localizacao_disp1_idx` ON `tb_disp_localizacao` (`id_localizacao_disp` ASC);

CREATE INDEX `fk_tb_disp_localizacao_tb_dispositivo1_idx` ON `tb_disp_localizacao` (`id_dispositivo` ASC);

CREATE UNIQUE INDEX `id_disp_localizacao_UNIQUE` ON `tb_disp_localizacao` (`id_disp_localizacao` ASC);


-- -----------------------------------------------------
-- Table `tb_permissao_disp`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_permissao_disp` (
  `id_permissao` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador da permissao',
  `no_permissao` VARCHAR(30) NOT NULL COMMENT 'Descrição da permissão\n',
  `st_status` CHAR(1) NOT NULL COMMENT 'Status Ativo / Inativo\n',
  PRIMARY KEY (`id_permissao`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_permissao_UNIQUE` ON `tb_permissao_disp` (`id_permissao` ASC);


-- -----------------------------------------------------
-- Table `tb_perm_horario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_perm_horario` (
  `id_perm_horario` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador da ocorrência horário permissão',
  `dt_inicio` DATE NULL COMMENT 'Data de início da permissão - Não obrigatória principalmente quando o permanente está setado.',
  `dt_fim` DATE NULL COMMENT 'Data final da permissão - Não obrigatória.',
  `hr_incial` TIME NOT NULL COMMENT 'Hora de início da permissão',
  `hr_final` TIME NOT NULL COMMENT 'Hora final da permissão\n',
  `st_permanente` CHAR(1) NOT NULL COMMENT 'Indica se essa permissão é permanente.',
  PRIMARY KEY (`id_perm_horario`))
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_perm_horario_UNIQUE` ON `tb_perm_horario` (`id_perm_horario` ASC);


-- -----------------------------------------------------
-- Table `tb_perm_usu_disp`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_perm_usu_disp` (
  `id_perm_usu_disp` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador permissão usuário x dispositivo',
  `id_cadastro` INT UNSIGNED NOT NULL COMMENT 'Identificador do cadastro',
  `id_permissao` INT UNSIGNED NOT NULL COMMENT 'Identificador da permissão',
  `id_disp_localizacao` INT UNSIGNED NOT NULL COMMENT 'Identificador tabela associativa \'Dispositivo Localização\'.\n',
  `id_perm_horario` INT UNSIGNED NULL COMMENT 'Identificador permissão por horário de bloqueio.. se existir não libera',
  `st_status` CHAR(1) NOT NULL COMMENT 'Status permissão Ativo ou Inativo',
  PRIMARY KEY (`id_perm_usu_disp`),
  CONSTRAINT `fk_tb_perm_usu_disp_tb_permissao_disp1`
    FOREIGN KEY (`id_permissao`)
    REFERENCES `tb_permissao_disp` (`id_permissao`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_perm_usu_disp_tb_cadastro1`
    FOREIGN KEY (`id_cadastro`)
    REFERENCES `tb_cadastro` (`id_cadastro`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_perm_usu_disp_tb_disp_localizacao1`
    FOREIGN KEY (`id_disp_localizacao`)
    REFERENCES `tb_disp_localizacao` (`id_disp_localizacao`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_perm_usu_disp_tb_perm_horario1`
    FOREIGN KEY (`id_perm_horario`)
    REFERENCES `tb_perm_horario` (`id_perm_horario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_tb_perm_usu_disp_tb_permissao_disp1_idx` ON `tb_perm_usu_disp` (`id_permissao` ASC);

CREATE INDEX `fk_tb_perm_usu_disp_tb_cadastro1_idx` ON `tb_perm_usu_disp` (`id_cadastro` ASC);

CREATE INDEX `fk_tb_perm_usu_disp_tb_disp_localizacao1_idx` ON `tb_perm_usu_disp` (`id_disp_localizacao` ASC);

CREATE INDEX `fk_tb_perm_usu_disp_tb_perm_horario1_idx` ON `tb_perm_usu_disp` (`id_perm_horario` ASC);

CREATE UNIQUE INDEX `id_perm_usu_disp_UNIQUE` ON `tb_perm_usu_disp` (`id_perm_usu_disp` ASC);


-- -----------------------------------------------------
-- Table `tb_rota`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_rota` (
  `id_rota` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador de uma rota.',
  `id_dispositivo_origem` INT UNSIGNED NULL COMMENT 'Identificador do dispositivo(origem).',
  `id_dispositivo_destino` INT UNSIGNED NULL COMMENT 'Identificador do dispositivo(destino)',
  `id_cadastro` INT UNSIGNED NOT NULL COMMENT 'Identificador do cadastro.',
  `dt_rota` DATE NOT NULL COMMENT 'Data em que ocorreu rota.',
  `hr_rota` TIME NOT NULL COMMENT 'Hora em que ocorreu rota.',
  PRIMARY KEY (`id_rota`),
  CONSTRAINT `fk_tb_rotas_tb_dispositivo1`
    FOREIGN KEY (`id_dispositivo_origem`)
    REFERENCES `tb_dispositivo` (`id_dispositivo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_rotas_tb_dispositivo2`
    FOREIGN KEY (`id_dispositivo_destino`)
    REFERENCES `tb_dispositivo` (`id_dispositivo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tb_rotas_tb_cadastro1`
    FOREIGN KEY (`id_cadastro`)
    REFERENCES `tb_cadastro` (`id_cadastro`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_rota_UNIQUE` ON `tb_rota` (`id_rota` ASC);

CREATE INDEX `fk_tb_rota_tb_dispositivo1_idx` ON `tb_rota` (`id_dispositivo_origem` ASC);

CREATE INDEX `fk_tb_rota_tb_dispositivo2_idx` ON `tb_rota` (`id_dispositivo_destino` ASC);

CREATE INDEX `fk_tb_rota_tb_cadastro1_idx` ON `tb_rota` (`id_cadastro` ASC);


-- -----------------------------------------------------
-- Table `tb_ocupacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_ocupacao` (
  `id_ocupacao` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Identificador da ocupação.',
  `id_disp_localizacao` INT UNSIGNED NOT NULL COMMENT 'Identificador tabela associativa \'Dispositivo Localização\'.',
  `dt_ocupacao` DATE NOT NULL COMMENT 'Data do resumo da ocorrência, atrelado ao cadastro ocorrencia por dispositivo.',
  `hr_ocupacao` TIME NOT NULL COMMENT 'Hora do resumo da ocorrência, atrelado ao cadastro ocorrencia por dispositivo.',
  `nr_pessoas` INT NOT NULL COMMENT 'Número de pessoas existentes na sala = Nr. de entradas - nr. de saídas do dispositivo.',
  PRIMARY KEY (`id_ocupacao`),
  CONSTRAINT `fk_tb_ocupacao_tb_disp_localizacao1`
    FOREIGN KEY (`id_disp_localizacao`)
    REFERENCES `tb_disp_localizacao` (`id_disp_localizacao`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE UNIQUE INDEX `id_ocupacao_UNIQUE` ON `tb_ocupacao` (`id_ocupacao` ASC);

CREATE INDEX `fk_tb_ocupacao_tb_disp_localizacao1_idx` ON `tb_ocupacao` (`id_disp_localizacao` ASC);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
