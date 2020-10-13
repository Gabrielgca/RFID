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
VALUES("Abel"),("Abelardo"),("Adílio"),("Ada"),("Alice"),("Ana"),("Ana Clara"),("Ana Julia"),
      ("Ana Luiza"),("Antonella"),("Anthony"),("Antonio"),("Arley"),("Arthur"),("Bernardo"),
      ("Benjamin"),("Bianca"),("Bruna"),("Bruno"),("Caio"),("Camila"),("Carla"),("Carlos"),
      ("Cecilha"),("Cida"),("Clara"),("Daniel"),("Diego"),("Ezequiel"),("Fernanda"),("Fernando"),
      ("Gabriel"),("Gustavo"),("Hamilton"),("Helena"),("Irina"),("Irineu"),("Joao"),("Jose"),
      ("Leandro"),("Lucas"),("Lucia"),("Lucio"),("Maicon"),("Marcos"),("Maria"),("Natalia"),
      ("Nathalia"),("Paula"),("Paulo"),("Patricia"),("Pedro"),("Quenia"),("Renato"),("Roberta"),
      ("Roberto"),("Rodrigo"),("Sabrina"),("Saulo"),("Savio"),("Silvana"),("Silvio"),("Thiago"),
      ("Ulysses"),("Vitor"),("Victor"),("Ze");

INSERT INTO `tb_sobrenomes`(`no_sobrenome`)
VALUES("Assuncao"),("Abreu"),("Albuquerque"),("Almeida"),("Alvares"),("Alvarenga"),("Alves"),("Alexandreli"),("Amaral"),
      ("Amaro"),("Ambrosio"),("Amorim"),("Arakaki"),("Araujo"),("Arruda"),("Assis"),("Aguiar"),("Augusto"),("Azevedo"),
      ("Barbosa"),("Barcelos"),("Barreto"),("Barros"),("Barroso"),("Bastos"),("Bernardes"),("Bezerra"),("Bicalho"),
      ("Bispo"),("Borges"),("Brito"),("Cavalcanti"),("Camoes"),("Campos"),("Cardoso"),("Carvalho"),("Cervantes"),
      ("Chagas"),("Chaves"),("Coelho"),("Correa"),("Correia"),("Costa"),("Coutinho"),("Dantas"),("Dias"),("Domingues"),
      ("Duarte"),("Dutra"),("Elmiro"),("Emanuel"),("Farias"),("Feitosa"),("Fernandez"),("Ferreira"),("Figueira"),
      ("Fonsceca"),("Fontes"),("Freitas"),("Galvao"),("Gaspar"),("Gomes"),("Guedes"),("Guerra"),("Jesus"),("Junior"),
      ("Kawano"),("Lacerda"),("Lazaro"),("Lemos"),("Lima"),("Lisboa"),("Lopes"),("Lorenzoni"),("Loureiro"),("Macedo"),
      ("Machado"),("Madureira"),("Malta"),("Manoel"),("Marinho"),("Martins"),("Medeiros"),("Monteiro"),("Nascimento"),
      ("Neto"),("Neves"),("Oliveira"),("Pereira"),("Pessanha"),("Ribeiro"),("Rocha"),("Rodrigues"),("Santos"),("Saraiva"),
      ("Silveira"),("Siqueira"),("Souto"),("Souza"),("Teixeira"),("Vasconcelos"),("Vieira"),("Vitorassi"),("Zanetti");
