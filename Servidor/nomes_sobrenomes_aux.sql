-- Inserindo dados no banco auxiliar para o projeto RFID

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP DATABASE IF EXISTS `db_auxiliar`;
CREATE DATABASE `db_auxiliar`;
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
VALUES("Abel"),("Abelardo"),("Adílio"),("Ada"),("Ana"),("Arley"),("Bianca"),("Bruna"),
      ("Bruno"),("Camila"),("Carla"),("Carlos"),("Cida"),("Diego"),("Ezequiel"),("Fernanda"),
      ("Fernando"),("Gabriel"),("Gustavo"),("Hamilton"),("Helena"),("Irina"),("Irineu"),
      ("Joao"),("Jose"),("Leandro"),("Lucas"),("Lucia"),("Lucio"),("Maicon"),("Marcos"),
      ("Maria"),("Natalia"),("Nathalia"),("Paula"),("Paulo"),("Patricia"),("Pedro"),("Quenia"),
      ("Renato"),("Roberta"),("Roberto"),("Rodrigo"),("Sabrina"),("Saulo"),("Savio"),
      ("Silvana"),("Silvio"),("Thiago"),("Ulysses"),("Vitor"),("Victor"),("Ze");

INSERT INTO `tb_sobrenomes`(`no_sobrenome`)
VALUES("Assuncao"),("Almeida"),("Alves"),("Amaral"),("Amaro"),("Arakaki"),("Araujo"),("Augusto"),("Bastos"),
      ("Bezerra"),("Borges"),("Cavalcanti"),("Camoes"),("Carvalho"),("Correa"),("Costa"),("Coutinho"),
      ("Elmiro"),("Emanuel"),("Ferreira"),("Galvao"),("Gomes"),("Jesus"),("Junior"),("Kawano"),
      ("Lazaro"),("Lima"),("Macedo"),("Martins"),("Medeiros"),("Monteiro"),("Nascimento"),("Neto"),("Neves"),
      ("Oliveira"),("Pereira"),("Pessanha"),("Ribeiro"),("Rocha"),("Rodrigues"),("Santos"),("Saraiva"),("Silveira"),
      ("Siqueira"),("Souto"),("Souza"),("Teixeira"),("Vasconcelos"),("Vieira"),("Vitorassi"),("Zanetti");
