# nosql_squarepants_ws17_18

# Lernplattform

## Setup
Die Lernplattform benötigt eine SQL Datenbank für die Session und die Benutzer. Die Daten werden in einer MongoDB gespeichert.

### MariaDB
```
CREATE DATABASE userdb;
```
Die Datenbank muss folgende Tabelle enthalten
```
CREATE TABLE users( username VARCHAR(255) NOT NULL PRIMARY KEY, lastname VARCHAR(255),
	surname VARCHAR(255),	email VARCHAR(255), password VARCHAR(255) , role BigInt NOT NULL);
```
Es wird versucht mit user "root" und passwort "root" auf die sql datenbank zu connecten.
Dies muss falls anders im server.js und api/dbconnection/mariasql.js angepasst werden.

### Projekt starten
* in das Verzeichnis wechseln
* npm install
* MongoDB starten
* MariaDB starten
* npm run start

Die Lernplattform ist nun unter http://localhost:3000 erreichbar
