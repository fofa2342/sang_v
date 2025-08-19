CREATE DATABASE  IF NOT EXISTS `dons_sang` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dons_sang`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dons_sang
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `constantes`
--

DROP TABLE IF EXISTS `constantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `constantes` (
  `id_constante` int NOT NULL AUTO_INCREMENT,
  `id_donneur` int NOT NULL,
  `date_mesure` date NOT NULL,
  `poids` decimal(5,2) DEFAULT NULL,
  `tension` varchar(20) DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `pouls` int DEFAULT NULL,
  `autres` text,
  PRIMARY KEY (`id_constante`),
  KEY `fk_const_donneur` (`id_donneur`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `demande`
--

DROP TABLE IF EXISTS `demande`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demande` (
  `id_demande` int NOT NULL AUTO_INCREMENT,
  `id_receveur` int NOT NULL,
  `date_demande` datetime NOT NULL,
  `produit_demande` enum('SANG_TOTAL','PLASMA','PLAQUETTES') NOT NULL,
  `quantite_ml` int NOT NULL,
  `statut` enum('EN_ATTENTE','APPROUVÉ','REFUSÉ','LIVRÉ') DEFAULT 'EN_ATTENTE',
  `prescripteur` varchar(100) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id_demande`),
  KEY `fk_demande_receveur` (`id_receveur`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `distribution`
--

DROP TABLE IF EXISTS `distribution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `distribution` (
  `id_distribution` int NOT NULL AUTO_INCREMENT,
  `id_demande` int NOT NULL,
  `id_stock` int NOT NULL,
  `date_distribution` datetime NOT NULL,
  `quantite_ml` int DEFAULT NULL,
  `distribue_par` int DEFAULT NULL,
  PRIMARY KEY (`id_distribution`),
  KEY `fk_distribution_demande` (`id_demande`),
  KEY `fk_distribution_stock` (`id_stock`),
  KEY `fk_distribution_utilisateur` (`distribue_par`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `don`
--

DROP TABLE IF EXISTS `don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don` (
  `id_don` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `date_don` datetime NOT NULL,
  `type_don` enum('SANG_TOTAL','PLASMA','PLAQUETTES') DEFAULT 'SANG_TOTAL',
  `volume_ml` int DEFAULT NULL,
  `id_infirmier` int DEFAULT NULL,
  `id_entretien` int DEFAULT NULL,
  `etat` enum('EN_COURS','VALIDE','REFUSE') DEFAULT 'EN_COURS',
  PRIMARY KEY (`id_don`),
  KEY `fk_don_infirmier` (`id_infirmier`),
  KEY `fk_don_entretien` (`id_entretien`),
  KEY `fk_don_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `donneurs`
--

DROP TABLE IF EXISTS `donneurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donneurs` (
  `id_donneur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `sexe` enum('M','F') NOT NULL,
  `age` int DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `id_groupe_sanguin` int DEFAULT NULL,
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_donneur`),
  KEY `fk_donneur_groupe` (`id_groupe_sanguin`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entretien`
--

DROP TABLE IF EXISTS `entretien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entretien` (
  `id_entretien` int NOT NULL AUTO_INCREMENT,
  `id_donneur` int NOT NULL,
  `date_entretien` date NOT NULL,
  `questions` text,
  `statut` enum('VALIDE','REFUSE','EN_ATTENTE') DEFAULT 'EN_ATTENTE',
  `valide_par` int DEFAULT NULL,
  PRIMARY KEY (`id_entretien`),
  KEY `fk_entretien_donneur` (`id_donneur`),
  KEY `fk_entretien_medecin` (`valide_par`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groupe_sanguin`
--

DROP TABLE IF EXISTS `groupe_sanguin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupe_sanguin` (
  `id_groupe` int NOT NULL AUTO_INCREMENT,
  `type_groupe` enum('A','B','AB','O') NOT NULL,
  `rhesus` enum('+','-') NOT NULL,
  PRIMARY KEY (`id_groupe`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receveur`
--

DROP TABLE IF EXISTS `receveur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receveur` (
  `id_receveur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `groupe_sanguin` varchar(5) DEFAULT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_receveur`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `id_stock` int NOT NULL AUTO_INCREMENT,
  `id_don` int NOT NULL,
  `date_entree` date NOT NULL,
  `date_peremption` date DEFAULT NULL,
  `statut` enum('DISPONIBLE','PÉRIMÉ','SORTI') DEFAULT 'DISPONIBLE',
  `localisation` varchar(100) DEFAULT NULL,
  `quantite_ml` int DEFAULT NULL,
  PRIMARY KEY (`id_stock`),
  KEY `fk_stock_don` (`id_don`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('RECEVEUR','DONNEUR','ADMIN','MEDECIN','INFIRMIER','TECHNICIEN','ASSISTANT','RESPONSABLE') NOT NULL DEFAULT 'ASSISTANT',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom_utilisateur` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-19 11:20:39
