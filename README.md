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
### Projekt starten
* in das Verzeichnis wechseln
* npm install
* MongoDB starten
* mySQL starten
* npm run start

Die Lernplattform ist nun unter http://localhost:3000 erreichbar

## Bedinung
Damit der Lehrbeauftragte Themen anlegen kann, muss zuerst ein Kurs angelegt werden. Für den Kurs müssen danach Themen angelegt werden. Danach kann man für die Themen der Kurse Tests anlegen und Dateien hochladen.

Die Registrierung bzw. Anmeldung für Benutzer ist unter folgender URL möglich:
```
http://localhost:3000/login
http://localhost:3000/index
http://localhost:3000/ 
```

# Setup Chat
