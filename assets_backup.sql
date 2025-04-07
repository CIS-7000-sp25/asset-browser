-- MySQL dump 10.13  Distrib 9.2.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: assets
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add keyword',7,'add_keyword'),(26,'Can change keyword',7,'change_keyword'),(27,'Can delete keyword',7,'delete_keyword'),(28,'Can view keyword',7,'view_keyword'),(29,'Can add author',8,'add_author'),(30,'Can change author',8,'change_author'),(31,'Can delete author',8,'delete_author'),(32,'Can view author',8,'view_author'),(33,'Can add asset',9,'add_asset'),(34,'Can change asset',9,'change_asset'),(35,'Can delete asset',9,'delete_asset'),(36,'Can view asset',9,'view_asset'),(37,'Can add asset version',10,'add_assetversion'),(38,'Can change asset version',10,'change_assetversion'),(39,'Can delete asset version',10,'delete_assetversion'),(40,'Can view asset version',10,'view_assetversion'),(41,'Can add commit',11,'add_commit'),(42,'Can change commit',11,'change_commit'),(43,'Can delete commit',11,'delete_commit'),(44,'Can view commit',11,'view_commit');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(9,'library','asset'),(10,'library','assetversion'),(8,'library','author'),(11,'library','commit'),(7,'library','keyword'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-02-20 06:55:47.997904'),(2,'auth','0001_initial','2025-02-20 06:55:48.639969'),(3,'admin','0001_initial','2025-02-20 06:55:48.788500'),(4,'admin','0002_logentry_remove_auto_add','2025-02-20 06:55:48.798324'),(5,'admin','0003_logentry_add_action_flag_choices','2025-02-20 06:55:48.805112'),(6,'contenttypes','0002_remove_content_type_name','2025-02-20 06:55:48.917797'),(7,'auth','0002_alter_permission_name_max_length','2025-02-20 06:55:48.979503'),(8,'auth','0003_alter_user_email_max_length','2025-02-20 06:55:48.999249'),(9,'auth','0004_alter_user_username_opts','2025-02-20 06:55:49.006309'),(10,'auth','0005_alter_user_last_login_null','2025-02-20 06:55:49.064306'),(11,'auth','0006_require_contenttypes_0002','2025-02-20 06:55:49.068467'),(12,'auth','0007_alter_validators_add_error_messages','2025-02-20 06:55:49.075349'),(13,'auth','0008_alter_user_username_max_length','2025-02-20 06:55:49.142289'),(14,'auth','0009_alter_user_last_name_max_length','2025-02-20 06:55:49.208564'),(15,'auth','0010_alter_group_name_max_length','2025-02-20 06:55:49.225524'),(16,'auth','0011_update_proxy_permissions','2025-02-20 06:55:49.235159'),(17,'auth','0012_alter_user_first_name_max_length','2025-02-20 06:55:49.307873'),(18,'sessions','0001_initial','2025-02-20 06:55:49.351449'),(19,'library','0001_initial','2025-02-20 17:33:26.096274'),(20,'library','0002_remove_keyword_keyword','2025-02-20 17:33:26.140137'),(21,'library','0003_keyword_keyword','2025-02-20 17:33:26.192121'),(22,'library','0004_assetversion_filepath','2025-02-24 17:30:43.376258'),(23,'library','0005_author_remove_asset_thumbnailfilepath_and_more','2025-03-27 21:06:58.572326'),(24,'library','0006_asset_s3link','2025-03-28 06:39:33.607910'),(25,'library','0007_remove_asset_s3link_remove_asset_thumbnail_and_more','2025-03-28 22:46:08.818950'),(26,'library','0008_alter_commit_asset','2025-04-07 13:48:40.390581');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_asset`
--

DROP TABLE IF EXISTS `library_asset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_asset` (
  `id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assetName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assetStructureVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hasTexture` tinyint(1) NOT NULL,
  `checkedOutBy_id` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnailKey` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `library_asset_checkedOutBy_id_e6d5bb94_fk_library_author_pennkey` (`checkedOutBy_id`),
  CONSTRAINT `library_asset_checkedOutBy_id_e6d5bb94_fk_library_author_pennkey` FOREIGN KEY (`checkedOutBy_id`) REFERENCES `library_author` (`pennkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_asset`
--

LOCK TABLES `library_asset` WRITE;
/*!40000 ALTER TABLE `library_asset` DISABLE KEYS */;
INSERT INTO `library_asset` VALUES ('13694c1fd3c348e39a95e4a6ab11b36c','sittingMoomin','03.00.00',0,NULL,'sittingMoomin/thumbnail.png'),('35404bbaf2f0459e8af4438cdbdd44d5','skateboard','03.00.00',0,NULL,'skateboard/thumbnail.png'),('3603a56ac444460e9244c7d8ba98f288','parkBench','03.00.00',0,NULL,'parkBench/thumbnail.png'),('45c318f812a540e1b8ccdd26298fc38b','bookStack','03.00.00',0,NULL,'bookStack/thumbnail.png'),('4a0abe9a503c40f0a6a20153c873d686','teapot','03.00.00',0,NULL,'teapot/thumbnail.png'),('87fe25a12e9b4a0181e79aa71853a9a8','pickleBarrels','03.00.00',0,NULL,'pickleBarrels/thumbnail.png'),('90decb2941514ab88465212ea9dc3fda','yugiohClockArc','03.00.00',0,NULL,'yugiohClockArc/thumbnail.png'),('b1801a67967a4e41af88a7546feac774','campfire','03.00.00',0,NULL,'campfire/thumbnail.png'),('e0ad0ea9aad0413e986a422732906e03','vintageLamp','03.00.00',0,NULL,'vintageLamp/thumbnail.png'),('ea696a191c2f40c0a724d793018883d7','cafeTable','03.00.00',0,NULL,'cafeTable/thumbnail.png'),('f7ae1068ea2e4390aceb6dabe8bc819c','yellowDuck','03.00.00',0,NULL,'yellowDuck/thumbnail.png'),('fb767db6a6b94113bf3be49b773b6e38','cartoonFish','03.00.00',0,NULL,'cartoonFish/thumbnail.png');
/*!40000 ALTER TABLE `library_asset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_asset_keywordslist`
--

DROP TABLE IF EXISTS `library_asset_keywordslist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_asset_keywordslist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `asset_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `keyword_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `library_asset_keywordsList_asset_id_keyword_id_2a064302_uniq` (`asset_id`,`keyword_id`),
  KEY `library_asset_keywor_keyword_id_946423c7_fk_library_k` (`keyword_id`),
  CONSTRAINT `library_asset_keywor_keyword_id_946423c7_fk_library_k` FOREIGN KEY (`keyword_id`) REFERENCES `library_keyword` (`id`),
  CONSTRAINT `library_asset_keywordsList_asset_id_3a4ca979_fk_library_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `library_asset` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_asset_keywordslist`
--

LOCK TABLES `library_asset_keywordslist` WRITE;
/*!40000 ALTER TABLE `library_asset_keywordslist` DISABLE KEYS */;
INSERT INTO `library_asset_keywordslist` VALUES (1104,'13694c1fd3c348e39a95e4a6ab11b36c',4),(1103,'13694c1fd3c348e39a95e4a6ab11b36c',47),(1105,'13694c1fd3c348e39a95e4a6ab11b36c',48),(1106,'13694c1fd3c348e39a95e4a6ab11b36c',49),(1107,'35404bbaf2f0459e8af4438cdbdd44d5',50),(1108,'35404bbaf2f0459e8af4438cdbdd44d5',51),(1109,'35404bbaf2f0459e8af4438cdbdd44d5',52),(1110,'35404bbaf2f0459e8af4438cdbdd44d5',53),(1111,'35404bbaf2f0459e8af4438cdbdd44d5',54),(1112,'35404bbaf2f0459e8af4438cdbdd44d5',55),(1113,'35404bbaf2f0459e8af4438cdbdd44d5',56),(1114,'35404bbaf2f0459e8af4438cdbdd44d5',57),(1093,'3603a56ac444460e9244c7d8ba98f288',18),(1088,'3603a56ac444460e9244c7d8ba98f288',34),(1089,'3603a56ac444460e9244c7d8ba98f288',35),(1090,'3603a56ac444460e9244c7d8ba98f288',36),(1091,'3603a56ac444460e9244c7d8ba98f288',37),(1092,'3603a56ac444460e9244c7d8ba98f288',38),(1057,'45c318f812a540e1b8ccdd26298fc38b',6),(1058,'45c318f812a540e1b8ccdd26298fc38b',7),(1059,'45c318f812a540e1b8ccdd26298fc38b',8),(1060,'45c318f812a540e1b8ccdd26298fc38b',9),(1061,'45c318f812a540e1b8ccdd26298fc38b',10),(1062,'45c318f812a540e1b8ccdd26298fc38b',11),(1063,'45c318f812a540e1b8ccdd26298fc38b',12),(1064,'45c318f812a540e1b8ccdd26298fc38b',13),(1065,'45c318f812a540e1b8ccdd26298fc38b',14),(1066,'45c318f812a540e1b8ccdd26298fc38b',15),(1120,'4a0abe9a503c40f0a6a20153c873d686',10),(1122,'4a0abe9a503c40f0a6a20153c873d686',11),(1121,'4a0abe9a503c40f0a6a20153c873d686',13),(1123,'4a0abe9a503c40f0a6a20153c873d686',18),(1115,'4a0abe9a503c40f0a6a20153c873d686',58),(1116,'4a0abe9a503c40f0a6a20153c873d686',59),(1117,'4a0abe9a503c40f0a6a20153c873d686',60),(1118,'4a0abe9a503c40f0a6a20153c873d686',61),(1119,'4a0abe9a503c40f0a6a20153c873d686',62),(1099,'87fe25a12e9b4a0181e79aa71853a9a8',13),(1094,'87fe25a12e9b4a0181e79aa71853a9a8',39),(1095,'87fe25a12e9b4a0181e79aa71853a9a8',40),(1096,'87fe25a12e9b4a0181e79aa71853a9a8',41),(1097,'87fe25a12e9b4a0181e79aa71853a9a8',42),(1098,'87fe25a12e9b4a0181e79aa71853a9a8',43),(1100,'87fe25a12e9b4a0181e79aa71853a9a8',44),(1101,'87fe25a12e9b4a0181e79aa71853a9a8',45),(1102,'87fe25a12e9b4a0181e79aa71853a9a8',46),(1141,'90decb2941514ab88465212ea9dc3fda',49),(1137,'90decb2941514ab88465212ea9dc3fda',74),(1138,'90decb2941514ab88465212ea9dc3fda',75),(1139,'90decb2941514ab88465212ea9dc3fda',76),(1140,'90decb2941514ab88465212ea9dc3fda',77),(1070,'b1801a67967a4e41af88a7546feac774',19),(1071,'b1801a67967a4e41af88a7546feac774',20),(1072,'b1801a67967a4e41af88a7546feac774',21),(1073,'b1801a67967a4e41af88a7546feac774',22),(1074,'b1801a67967a4e41af88a7546feac774',23),(1075,'b1801a67967a4e41af88a7546feac774',24),(1076,'b1801a67967a4e41af88a7546feac774',25),(1077,'b1801a67967a4e41af88a7546feac774',26),(1078,'b1801a67967a4e41af88a7546feac774',27),(1079,'b1801a67967a4e41af88a7546feac774',28),(1130,'e0ad0ea9aad0413e986a422732906e03',18),(1124,'e0ad0ea9aad0413e986a422732906e03',63),(1125,'e0ad0ea9aad0413e986a422732906e03',64),(1126,'e0ad0ea9aad0413e986a422732906e03',65),(1127,'e0ad0ea9aad0413e986a422732906e03',66),(1128,'e0ad0ea9aad0413e986a422732906e03',67),(1129,'e0ad0ea9aad0413e986a422732906e03',68),(1067,'ea696a191c2f40c0a724d793018883d7',16),(1068,'ea696a191c2f40c0a724d793018883d7',17),(1069,'ea696a191c2f40c0a724d793018883d7',18),(1133,'f7ae1068ea2e4390aceb6dabe8bc819c',30),(1131,'f7ae1068ea2e4390aceb6dabe8bc819c',69),(1132,'f7ae1068ea2e4390aceb6dabe8bc819c',70),(1134,'f7ae1068ea2e4390aceb6dabe8bc819c',71),(1135,'f7ae1068ea2e4390aceb6dabe8bc819c',72),(1136,'f7ae1068ea2e4390aceb6dabe8bc819c',73),(1085,'fb767db6a6b94113bf3be49b773b6e38',2),(1083,'fb767db6a6b94113bf3be49b773b6e38',4),(1084,'fb767db6a6b94113bf3be49b773b6e38',5),(1080,'fb767db6a6b94113bf3be49b773b6e38',29),(1081,'fb767db6a6b94113bf3be49b773b6e38',30),(1082,'fb767db6a6b94113bf3be49b773b6e38',31),(1086,'fb767db6a6b94113bf3be49b773b6e38',32),(1087,'fb767db6a6b94113bf3be49b773b6e38',33);
/*!40000 ALTER TABLE `library_asset_keywordslist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_assetversion`
--

DROP TABLE IF EXISTS `library_assetversion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_assetversion` (
  `id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `versionName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `filepath` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `library_assetversion_asset_id_77975b7e_fk_library_asset_id` (`asset_id`),
  CONSTRAINT `library_assetversion_asset_id_77975b7e_fk_library_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `library_asset` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_assetversion`
--

LOCK TABLES `library_assetversion` WRITE;
/*!40000 ALTER TABLE `library_assetversion` DISABLE KEYS */;
INSERT INTO `library_assetversion` VALUES ('05fffa7f745e44b5b1d3b8c1e0683224','Variant Set','87fe25a12e9b4a0181e79aa71853a9a8','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\pickleBarrels\\pickleBarrels.usda','',''),('0929d82f431445c8b94e8b110e47e850','LOD0','87fe25a12e9b4a0181e79aa71853a9a8','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\pickleBarrels\\LODs\\pickleBarrels_LOD0.usda','',''),('12399c5169d54e8aac3d283c35955049','LOD1','4a0abe9a503c40f0a6a20153c873d686','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\teapot\\LODs\\teapot_LOD1.usda','',''),('13b2cddb8d7e4439babf9ed7a3466999','Variant Set','3603a56ac444460e9244c7d8ba98f288','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\parkBench\\parkBench.usda','',''),('1636497437ad4f6e8b0d7ef8ac3f49cd','Variant Set','4a0abe9a503c40f0a6a20153c873d686','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\teapot\\teapot.usda','',''),('1639f81c0f164a5089f3b14f4e8f3141','LOD0','e0ad0ea9aad0413e986a422732906e03','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\vintageLamp\\LODs\\vintageLamp_LOD0.usda','',''),('17f142ee1f6a42398d5ede56aa3848be','LOD0','ea696a191c2f40c0a724d793018883d7','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cafeTable\\LODs\\cafeTable_LOD0.usda','',''),('17f6df0b14a543bb98732634141c7a0b','LOD0','3603a56ac444460e9244c7d8ba98f288','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\parkBench\\LODs\\parkBench_LOD0.usda','',''),('1aca6984109b4c369b811af202c72d03','LOD2','4a0abe9a503c40f0a6a20153c873d686','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\teapot\\LODs\\teapot_LOD2.usda','',''),('1b24ba5f9de149eca56a9f9401b91422','Variant Set','fb767db6a6b94113bf3be49b773b6e38','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cartoonFish\\cartoonFish.usda','',''),('1da7942fd6254c0dacbb3508ff7ca541','LOD1','3603a56ac444460e9244c7d8ba98f288','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\parkBench\\LODs\\parkBench_LOD1.usda','',''),('26487ef36b9341bca59fe2f3cdcfb0d6','LOD0','90decb2941514ab88465212ea9dc3fda','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yugiohClockArc\\LODs\\yugiohClockArc_LOD0.usda','',''),('2894d400b374461b988270490a8c6b96','LOD1','90decb2941514ab88465212ea9dc3fda','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yugiohClockArc\\LODs\\yugiohClockArc_LOD1.usda','',''),('2c770aec0a5f4e268818a8efb08b8051','LOD0','f7ae1068ea2e4390aceb6dabe8bc819c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yellowDuck\\LODs\\yellowDuck_LOD0.usda','',''),('2d4eba51a5b94514992bf005ac2c290e','LOD2','87fe25a12e9b4a0181e79aa71853a9a8','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\pickleBarrels\\LODs\\pickleBarrels_LOD2.usda','',''),('38ae7876eaba464db1ffeef6d1b28bdb','Variant Set','13694c1fd3c348e39a95e4a6ab11b36c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\sittingMoomin\\sittingMoomin.usda','',''),('3f7a71e4ed5a442da810d93d1e257505','Variant Set','f7ae1068ea2e4390aceb6dabe8bc819c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yellowDuck\\yellowDuck.usda','',''),('4526ae568fa64b15909314e30d7ef0ec','Variant Set','90decb2941514ab88465212ea9dc3fda','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yugiohClockArc\\yugiohClockArc.usda','',''),('4a6fb165aa034416b4936bc75e1de945','Variant Set','e0ad0ea9aad0413e986a422732906e03','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\vintageLamp\\vintageLamp.usda','',''),('574c84e3af804e3c8a18306945ac6774','LOD1','f7ae1068ea2e4390aceb6dabe8bc819c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yellowDuck\\LODs\\yellowDuck_LOD1.usda','',''),('5f0a01d217d343019111a6a86ff92e36','Variant Set','b1801a67967a4e41af88a7546feac774','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\campfire\\campfire.usda','',''),('79b6cd9ce88b4a748d665b619095e6ac','LOD2','e0ad0ea9aad0413e986a422732906e03','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\vintageLamp\\LODs\\vintageLamp_LOD2.usda','',''),('7bd9fc11c21e4d1786843df3de4b9ea8','LOD0','4a0abe9a503c40f0a6a20153c873d686','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\teapot\\LODs\\teapot_LOD0.usda','',''),('8ed32cfd608c41a4ae682205660866f9','LOD0','45c318f812a540e1b8ccdd26298fc38b','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\bookStack\\LODs\\bookStack_LOD0.usda','',''),('98c7a935ff754781afb46b1023ff8ad3','LOD2','13694c1fd3c348e39a95e4a6ab11b36c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\sittingMoomin\\LODs\\sittingMoomin_LOD2.usda','',''),('993bf1d033e246b88e06e537da13ce21','Variant Set','35404bbaf2f0459e8af4438cdbdd44d5','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\skateboard\\skateboard.usda','',''),('a6167fe2a43149e6a992f0f07cb72d0f','LOD1','13694c1fd3c348e39a95e4a6ab11b36c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\sittingMoomin\\LODs\\sittingMoomin_LOD1.usda','',''),('a6573c64e6e345f2a8276203069d8409','LOD1','b1801a67967a4e41af88a7546feac774','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\campfire\\LODs\\campfire_LOD1.usda','',''),('acf0a8edd9b44e36b118139aebcdf89f','LOD1','87fe25a12e9b4a0181e79aa71853a9a8','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\pickleBarrels\\LODs\\pickleBarrels_LOD1.usda','',''),('b126a6232ad2486d8496ed2f2a850548','LOD1','35404bbaf2f0459e8af4438cdbdd44d5','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\skateboard\\LODs\\skateboard_LOD1.usda','',''),('b16c248a11dc417188d87451bcc0a0ce','LOD2','90decb2941514ab88465212ea9dc3fda','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yugiohClockArc\\LODs\\yugiohClockArc_LOD2.usda','',''),('b1b1f27c8dc44879993176f7969d1742','LOD0','b1801a67967a4e41af88a7546feac774','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\campfire\\LODs\\campfire_LOD0.usda','',''),('b861007aad674d4d8515bf76515accd0','LOD1','e0ad0ea9aad0413e986a422732906e03','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\vintageLamp\\LODs\\vintageLamp_LOD1.usda','',''),('c4b3f25cb262489e83bee3d314e394c9','LOD2','45c318f812a540e1b8ccdd26298fc38b','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\bookStack\\LODs\\bookStack_LOD2.usda','',''),('cbfdd87b66e24dbaaa00efc2d34d7675','LOD0','fb767db6a6b94113bf3be49b773b6e38','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cartoonFish\\LODs\\cartoonFish_LOD0.usda','',''),('cebe38ebc41b4d79afe45f57331d6900','Variant Set','45c318f812a540e1b8ccdd26298fc38b','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\bookStack\\bookStack.usda','',''),('d6ba6053e5cf48f9bf2784a8c40eadf6','LOD0','35404bbaf2f0459e8af4438cdbdd44d5','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\skateboard\\LODs\\skateboard_LOD0.usda','',''),('dd8f174c51a1414a919cdf54d058e34a','LOD1','45c318f812a540e1b8ccdd26298fc38b','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\bookStack\\LODs\\bookStack_LOD1.usda','',''),('dea51202c6324215acf4250308e9e803','LOD1','fb767db6a6b94113bf3be49b773b6e38','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cartoonFish\\LODs\\cartoonFish_LOD1.usda','',''),('ded4932025144895a529c761dbd5cf0d','LOD2','3603a56ac444460e9244c7d8ba98f288','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\parkBench\\LODs\\parkBench_LOD2.usda','',''),('dff661a403fa41099d06c5f5b6a1ed79','LOD2','f7ae1068ea2e4390aceb6dabe8bc819c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\yellowDuck\\LODs\\yellowDuck_LOD2.usda','',''),('e2f47f1e9fbe453ea4e21314dd4106de','LOD0','13694c1fd3c348e39a95e4a6ab11b36c','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\sittingMoomin\\LODs\\sittingMoomin_LOD0.usda','',''),('e63f54ffcac94e10947fb1e8a3a5320d','LOD1','ea696a191c2f40c0a724d793018883d7','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cafeTable\\LODs\\cafeTable_LOD1.usda','',''),('ec552984a1d04262917295a878433385','Variant Set','ea696a191c2f40c0a724d793018883d7','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cafeTable\\cafeTable.usda','',''),('f3be85efdc884319a643cdbfca3d6f19','LOD2','ea696a191c2f40c0a724d793018883d7','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cafeTable\\LODs\\cafeTable_LOD2.usda','',''),('f3e54f0bc9c942d79f6f0ea8f233a68f','LOD2','b1801a67967a4e41af88a7546feac774','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\campfire\\LODs\\campfire_LOD2.usda','',''),('f73a0f98d1704d0a90dac34c08d39bcc','LOD2','fb767db6a6b94113bf3be49b773b6e38','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\cartoonFish\\LODs\\cartoonFish_LOD2.usda','',''),('fd08423362af4cb5876ab03b7e5ee542','LOD2','35404bbaf2f0459e8af4438cdbdd44d5','C:\\Users\\Admin\\Documents\\School\\cis-7000-production-pipilines\\final-project\\week-6-assets\\skateboard\\LODs\\skateboard_LOD2.usda','','');
/*!40000 ALTER TABLE `library_assetversion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_assetversion_dependencies`
--

DROP TABLE IF EXISTS `library_assetversion_dependencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_assetversion_dependencies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assetversion_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_assetversion_dependencies`
--

LOCK TABLES `library_assetversion_dependencies` WRITE;
/*!40000 ALTER TABLE `library_assetversion_dependencies` DISABLE KEYS */;
/*!40000 ALTER TABLE `library_assetversion_dependencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_author`
--

DROP TABLE IF EXISTS `library_author`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_author` (
  `pennkey` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`pennkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_author`
--

LOCK TABLES `library_author` WRITE;
/*!40000 ALTER TABLE `library_author` DISABLE KEYS */;
INSERT INTO `library_author` VALUES ('aajiang','Aaron','Jiang',''),('chuu','Christina','Qiu',''),('claran','Clara','Nolan',''),('cxndy','Cindy','Xu',''),('czw','Charles','Wang',''),('echou','','',''),('eschou','Elyssa','Chou',''),('fernc','Caroline','Fernandes',''),('geant','Anthony','Ge',''),('jyguan','Jackie','Guan',''),('liuamy05','Amy','Liu',''),('raclin','Rachel','Lin',''),('soominp','Jacky','Park',''),('willcai','Will','Cai','');
/*!40000 ALTER TABLE `library_author` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_commit`
--

DROP TABLE IF EXISTS `library_commit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_commit` (
  `id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `note` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `library_commit_asset_id_413107ba_fk_library_asset_id` (`asset_id`),
  KEY `library_commit_author_id_176d6481` (`author_id`),
  CONSTRAINT `library_commit_asset_id_413107ba_fk_library_asset_id` FOREIGN KEY (`asset_id`) REFERENCES `library_asset` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_commit`
--

LOCK TABLES `library_commit` WRITE;
/*!40000 ALTER TABLE `library_commit` DISABLE KEYS */;
INSERT INTO `library_commit` VALUES ('00f87299e62c4749980ddce9856bb282','czw','02.00.00','2025-02-10 21:59:44.000000','Added LODs','3603a56ac444460e9244c7d8ba98f288'),('02ca9ad144c543feb2d32a9bd7966c25','jyguan','01.00.00','2024-11-21 17:00:00.000000','Initial creation','b1801a67967a4e41af88a7546feac774'),('0d24e8488a8b4642a2808519ba2e5643','cxndy','02.00.00','2025-02-13 22:05:22.000000','Added LODs','35404bbaf2f0459e8af4438cdbdd44d5'),('26708687009e41d38b15fde4d85e9110','jyguan','02.00.00','2025-01-30 21:20:00.000000','Added LODs','b1801a67967a4e41af88a7546feac774'),('26931719b3fb4ca9a87e0ba38b07b025','claran','01.00.00','2024-02-29 20:06:49.000000','Initial creation','13694c1fd3c348e39a95e4a6ab11b36c'),('2789cc52dcc243be89c9bc2cc7089856','czw','01.00.00','2024-11-13 21:49:00.000000','Initial creation','3603a56ac444460e9244c7d8ba98f288'),('3214852ce625498797b01eacd6c926f8','czw','03.00.00','2025-02-16 21:05:27.000000','Converted LODs to a variant set','90decb2941514ab88465212ea9dc3fda'),('44be786f643c4c33967c740272bac732','echou','02.00.00','2025-02-07 22:08:00.000000','Added LODs','45c318f812a540e1b8ccdd26298fc38b'),('4e44b1e05b5c49ccb4e7cb6788a3b5c7','fernc','02.00.00','2025-02-04 21:21:00.000000','Added LODs','e0ad0ea9aad0413e986a422732906e03'),('64ccf1d34d094487bc55a4e854c4d00f','jyguan','03.00.00','2025-02-14 02:59:00.000000','Converted LODs to a variant set','87fe25a12e9b4a0181e79aa71853a9a8'),('6899b705e1c04bb594ff6c0fcf94be18','claran','02.00.00','2025-02-12 00:50:32.000000','Added LODs','13694c1fd3c348e39a95e4a6ab11b36c'),('69349d98664c40758505208ad056c72e','fernc','03.00.00','2025-02-14 23:46:00.000000','Converted LODs to a variant set','ea696a191c2f40c0a724d793018883d7'),('7396bdc4c07b4a7a97748a7289c455ed','liuamy05','03.00.00','2025-02-16 05:22:06.000000','Converted LODs to a variant set','3603a56ac444460e9244c7d8ba98f288'),('7a91e4f9f198403692da13156db8e8a3','soominp','02.00.00','2025-02-10 00:14:28.000000','Added LODs','fb767db6a6b94113bf3be49b773b6e38'),('82a98e04e0b6424eb4ebbb39f302b224','aajiang','02.00.00','2025-02-09 04:48:00.000000','Added LODs','87fe25a12e9b4a0181e79aa71853a9a8'),('84204731b2f0406fb736f90adb284dc2','cxndy','04.00.00','2025-02-17 18:26:00.000000','Converted LODs to a variant set','e0ad0ea9aad0413e986a422732906e03'),('915ed3f387254953b9e760892429297c','geant','03.00.00','2025-02-18 03:41:03.000000','Converted LODs to a variant set','fb767db6a6b94113bf3be49b773b6e38'),('95d85095718149e8bd22bfeb87f67dd2','echou','01.00.00','2024-10-14 20:08:00.000000','Initial creation','45c318f812a540e1b8ccdd26298fc38b'),('9837ad94ca904bae940f12bc7ba1e04b','aajiang','01.00.00','2024-05-23 04:48:00.000000','Inital creation','87fe25a12e9b4a0181e79aa71853a9a8'),('994b78abfbe64193890763de68040975','chuu','02.00.00','2025-02-11 01:48:00.000000','Added LODs','f7ae1068ea2e4390aceb6dabe8bc819c'),('9eed9ec372f14ddba875e9965a86027e','willcai','02.00.00','2025-02-04 00:30:00.000000','Added LODs','ea696a191c2f40c0a724d793018883d7'),('a4a638586d084ad3a432013e527a21f0','willcai','01.00.00','2024-11-04 03:19:00.000000','Initial creation','ea696a191c2f40c0a724d793018883d7'),('a96fd957a7da43cba5d4760784df24a8','raclin','01.00.00','2025-02-04 07:02:00.000000','Initial creation','4a0abe9a503c40f0a6a20153c873d686'),('b4bf5ca0714842ff8b8f2268f94afd60','willcai','03.00.00','2025-02-18 02:20:00.000000','Converted LODs to a varient set','35404bbaf2f0459e8af4438cdbdd44d5'),('be2f5f1c8464414fbba2cd51e0ad05ab','raclin','02.00.00','2025-02-09 15:30:00.000000','Added LODs','4a0abe9a503c40f0a6a20153c873d686'),('c758be0ad7174065b6e59b400ed2459a','raclin','03.00.00','2025-02-16 07:04:00.000000','Converted LODs to a variant set','f7ae1068ea2e4390aceb6dabe8bc819c'),('cb220948bf7f481fbbac666916d4704e','chuu','03.00.00','2025-02-17 13:08:00.000000','Converted LODs to a variant set','4a0abe9a503c40f0a6a20153c873d686'),('d70d297182bd486bb1f84df9bd919ec2','liuamy05','02.00.00','2025-02-12 05:00:26.000000','Added LODs','90decb2941514ab88465212ea9dc3fda'),('da83196fc3614dc59a5bd5329894c149','chuu','01.00.00','2025-02-04 01:48:00.000000','Initial creation','f7ae1068ea2e4390aceb6dabe8bc819c'),('e5fc4b33b0a240a9802286e86fb89773','claran','03.00.00','2025-02-19 04:59:00.000000','Converted LODs to a variant set','45c318f812a540e1b8ccdd26298fc38b'),('e9dc71ea7f444afcb116562dc7eacd2b','eschou','03.00.00','2025-02-13 16:23:00.000000','Converted LODs to a variant set','13694c1fd3c348e39a95e4a6ab11b36c'),('ead537154cf941f38b6d2b911c024a90','fernc','03.00.00','2025-02-16 05:18:00.000000','Fixed scale for LOD1&2','e0ad0ea9aad0413e986a422732906e03'),('eb57e9c037ad4312926da48d54c7f3dd','soominp','01.00.00','2025-02-04 03:14:32.000000','Initial creation','fb767db6a6b94113bf3be49b773b6e38'),('f602dad0fd04438cb0036a5d2eeccbc9','cxndy','01.00.00','2025-02-04 01:00:22.000000','Initial creation','35404bbaf2f0459e8af4438cdbdd44d5'),('fa0266f3fdef4d5696735d27d8ac2032','aajiang','03.00.00','2025-02-13 05:28:00.000000','Converted LODs to a variant set','b1801a67967a4e41af88a7546feac774'),('fca0422e3a39432ab19c4e39b0540118','liuamy05','01.00.00','2024-12-03 19:55:13.000000','Initial version','90decb2941514ab88465212ea9dc3fda'),('fe29b7ca8c804bec83153ac2f9532134','fernc','01.00.00','2025-01-30 18:06:00.000000','Initial creation','e0ad0ea9aad0413e986a422732906e03');
/*!40000 ALTER TABLE `library_commit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_commit_sublayers`
--

DROP TABLE IF EXISTS `library_commit_sublayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_commit_sublayers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `commit_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assetversion_id` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `library_commit_sublayers_commit_id_d1af5701_fk` (`commit_id`),
  CONSTRAINT `library_commit_sublayers_commit_id_d1af5701_fk` FOREIGN KEY (`commit_id`) REFERENCES `library_commit` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_commit_sublayers`
--

LOCK TABLES `library_commit_sublayers` WRITE;
/*!40000 ALTER TABLE `library_commit_sublayers` DISABLE KEYS */;
/*!40000 ALTER TABLE `library_commit_sublayers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_keyword`
--

DROP TABLE IF EXISTS `library_keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_keyword` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `keyword` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `keyword` (`keyword`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_keyword`
--

LOCK TABLES `library_keyword` WRITE;
/*!40000 ALTER TABLE `library_keyword` DISABLE KEYS */;
INSERT INTO `library_keyword` VALUES (5,'animal'),(39,'barrel'),(73,'bathroom'),(34,'bench'),(57,'board'),(27,'bonfire'),(6,'book'),(7,'books'),(67,'bulb'),(16,'cafe'),(24,'camp'),(19,'campfire'),(66,'candle'),(31,'cartoon'),(38,'chair'),(49,'character'),(41,'container'),(32,'coral'),(1,'crab'),(4,'creature'),(30,'cute'),(11,'decoration'),(61,'dish'),(70,'duck'),(45,'fantasy'),(26,'firepit'),(29,'fish'),(18,'furniture'),(9,'hardcover'),(10,'household'),(62,'kitchen'),(63,'lamp'),(12,'library'),(68,'light'),(20,'logs'),(75,'machine'),(47,'moomin'),(44,'object'),(2,'ocean'),(15,'office'),(25,'outdoors'),(36,'outside'),(35,'park'),(40,'pickel'),(53,'play'),(60,'pot'),(13,'prop'),(33,'reef'),(21,'rocks'),(71,'rubber'),(37,'seat'),(3,'shell'),(50,'skateboard'),(51,'skater'),(52,'sport'),(8,'stack'),(22,'stones'),(46,'storage'),(14,'study'),(28,'survival'),(17,'table'),(59,'tea'),(58,'teapot'),(72,'toy'),(54,'transportation'),(48,'troll'),(55,'vehicle'),(64,'victorian'),(65,'vintage'),(42,'water-filled'),(56,'wheels'),(23,'wood'),(43,'wooden'),(69,'yellow'),(74,'yu-gi-oh'),(77,'yu-gi-oh!'),(76,'yugioh');
/*!40000 ALTER TABLE `library_keyword` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-07  9:50:00
