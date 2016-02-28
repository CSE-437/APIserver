-- MySQL dump 10.13  Distrib 5.5.46, for Linux (x86_64)
--
-- Host: localhost    Database: anki
-- ------------------------------------------------------
-- Server version	5.5.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cards` (
  `cardid` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `deckid` smallint(5) unsigned NOT NULL,
  `front` text NOT NULL,
  `back` text NOT NULL,
  PRIMARY KEY (`cardid`),
  KEY `deckid` (`deckid`),
  CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`deckid`) REFERENCES `decks` (`deckid`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cards_id`
--

DROP TABLE IF EXISTS `cards_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cards_id` (
  `userid` smallint(5) unsigned NOT NULL,
  `cardid` mediumint(8) unsigned NOT NULL,
  `anki_cid` tinytext,
  KEY `userid` (`userid`),
  KEY `cardid` (`cardid`),
  CONSTRAINT `cards_id_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`),
  CONSTRAINT `cards_id_ibfk_2` FOREIGN KEY (`cardid`) REFERENCES `cards` (`cardid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `decks`
--

DROP TABLE IF EXISTS `decks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `decks` (
  `deckid` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `deckname` tinytext NOT NULL,
  `deckdescription` text,
  `owner_uid` smallint(5) unsigned NOT NULL,
  `ispublic` tinyint(1) NOT NULL,
  `dpassword` char(40) DEFAULT NULL,
  PRIMARY KEY (`deckid`),
  KEY `owner_uid` (`owner_uid`),
  CONSTRAINT `decks_ibfk_1` FOREIGN KEY (`owner_uid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `decks_id`
--

DROP TABLE IF EXISTS `decks_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `decks_id` (
  `userid` smallint(5) unsigned NOT NULL,
  `deckid` smallint(5) unsigned NOT NULL,
  `anki_did` tinytext,
  `canedit` tinyint(1) NOT NULL,
  KEY `userid` (`userid`),
  KEY `deckid` (`deckid`),
  CONSTRAINT `decks_id_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`),
  CONSTRAINT `decks_id_ibfk_2` FOREIGN KEY (`deckid`) REFERENCES `decks` (`deckid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `userid` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `username` tinytext NOT NULL,
  `password` char(40) NOT NULL,
  `email_address` tinytext NOT NULL,
  `token` char(128) NOT NULL,
  `token_changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-02-28 22:05:23
