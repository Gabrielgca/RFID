-- Inserindo dados no banco auxiliar para o projeto RFID

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE OR REPLACE DATABASE `db_auxiliar`;
USE `db_auxiliar`;

CREATE TABLE IF NOT EXISTS `tb_nomes`(
    `id_nome` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `no_nome` VARCHAR(15) NOT NULL,
    PRIMARY KEY(`id_nome`),
    UNIQUE INDEX `id_nome_UNIQUE` (`id_nome` ASC)
);

CREATE TABLE IF NOT EXISTS `tb_sobrenomes`(
    `id_sobrenome` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `no_sobrenome` VARCHAR(15) NOT NULL,
    PRIMARY KEY(`id_sobrenome`),
    UNIQUE INDEX `id_sobrenome_UNIQUE` (`id_sobrenome` ASC)
);

INSERT INTO `tb_nomes`(`no_nome`) 
VALUES("Abel"),("Abelardo"),("Adílio"),("Ada"),("Ana"),("Bianca"),("Bruna"),
      ("Bruno"),("Carla"),("Carlos"),("Cida"),("Ezequiel"),("Fernanda"),
      ("Fernando"),("Gabriel"),("Gustavo"),("Lucia"),("Helena"),("Maria"),
      ("Renato"),("Silvana"),("Thiago"),("Ze");

INSERT INTO `tb_sobrenomes`(`no_sobrenome`)
VALUES("Assuncao"),("Amaro"),("Araujo"),("Augusto"),("Borges"),("Cavalcanti"),
      ("Camoes"),("Correa"),("Emanuel"),("Ferreira"),("Galvao"),("Lazaro"),
      ("Medeiros"),("Silveira"),("Siqueira"),("Teixeira"),("Vieira"),("Zanetti");
