-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Мар 08 2023 г., 19:29
-- Версия сервера: 5.6.38-log
-- Версия PHP: 5.6.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `studious-octo-waddle`
--
CREATE DATABASE IF NOT EXISTS `studious-octo-waddle` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `studious-octo-waddle`;

-- --------------------------------------------------------

--
-- Структура таблицы `Struct`
--

CREATE TABLE `Struct` (
  `sID` int(11) NOT NULL,
  `sParentID` int(11) NOT NULL DEFAULT '-1',
  `suID` int(11) NOT NULL,
  `sTitle` varchar(32) NOT NULL,
  `sDescr` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `Struct`
--

INSERT INTO `Struct` (`sID`, `sParentID`, `suID`, `sTitle`, `sDescr`) VALUES
(61, -1, 0, 'Title', 'Description'),
(62, 61, 0, '45123', 'Description'),
(63, 61, 0, '121df23f2', 'Description'),
(64, 61, 0, '125123123', 'Description'),
(65, 62, 0, '5123125123', 'Description'),
(66, 62, 0, '521521342135', 'Description'),
(67, 66, 0, '526234123523521', 'Description');

-- --------------------------------------------------------

--
-- Структура таблицы `Users`
--

CREATE TABLE `Users` (
  `uID` int(11) NOT NULL,
  `uLogin` varchar(32) NOT NULL,
  `uPass` varchar(40) NOT NULL,
  `uAccess` int(2) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `Users`
--

INSERT INTO `Users` (`uID`, `uLogin`, `uPass`, `uAccess`) VALUES
(3, 'admin', '63b33493555355d28e4b605ff7beb2888dfdd387', 1);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `Struct`
--
ALTER TABLE `Struct`
  ADD PRIMARY KEY (`sID`);

--
-- Индексы таблицы `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`uID`),
  ADD UNIQUE KEY `uLogin` (`uLogin`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `Struct`
--
ALTER TABLE `Struct`
  MODIFY `sID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT для таблицы `Users`
--
ALTER TABLE `Users`
  MODIFY `uID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
