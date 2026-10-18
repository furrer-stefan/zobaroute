# ZoBaRoute – Webapplikation zur Routenplanung
Diplomarbeit von Stefan Furrer  
TEKO Zürich  
Dipl. Informatiker/in HF Fachrichtung Applikation  
2026

---

## 1. Überblick

ZoBaRoute berechnet die Verteilrouten für die jährliche Zopfbackaktion des Cevi Seuzach.
Dabei kann in der Applikation eine Bestellliste als Excel-Datei hochgeladen werden. Anschliessend werden zu jeder Adresse die Koordinaten ermittelt, die Stopps werden auf die verfügbaren Verteil-Teams aufgeteilt und es wird die Reihenfolge der Stopps innerhalb jeder Route optimiert. Das Ergebnis steht als PDF-Liste oder als GPX-Datei für die Navigation zur Verfügung.

Die Berechnung läuft in vier Phasen:

| Phase | Verfahren | Zweck |
|---|---|---|
| 1 | k-Means-Clustering | Stopps werden geografisch gruppiert, es gibt ein Cluster pro Verteil-Team. |
| 2 | Balancing | Die Stopps der Cluster werden umverteilt, sodass die Cluster eine ähnliche Grösse haben. Die Toleranz beträgt 10 %. |
| 3 | Nearest Neighbor | Es wird eine erste Reihenfolge innerhalb einer Route gebildet. |
| 4 | 2-opt | Die Reihenfolge wird durch Umkehren von Teilstücken weiter optimiert und verkürzt. |

Die Applikation besteht aus einem React-Frontend, einer Node.js-REST-API und einer PostgreSQL-Datenbank. Eine Benutzerverwaltung gibt es bewusst nicht, die Applikation ist ohne Anmeldung über eine einzige Adresse erreichbar.

---

## 2. Technologie-Stack

| Komponente | Version / Detail |
|---|---|
| Laufzeitumgebung | Node.js 24 LTS |
| Paketmanager | npm 11 |
| Backend | Express 5 |
| Frontend | React 19 mit Vite |
| Datenbank | PostgreSQL 17 |
| Geokodierung | geo.admin.ch SearchServer (EPSG:4326) |
| Distanzmatrix | OpenRouteService Matrix API |
| Excel-Verarbeitung | ExcelJS |
| PDF-Erstellung | pdfkit |
| Hosting Applikation | Render |
| Hosting Datenbank | Neon |

---

## 3. Voraussetzungen

Auf dem Zielgerät müssen vorhanden sein:

- **Node.js 24 LTS** oder neuer, inklusive npm
- **Git**
- **PostgreSQL 17** lokal installiert, oder ein erreichbarer PostgreSQL-Server
- Ein **API-Schlüssel für OpenRouteService**, kostenlos erhältlich unter
  <https://openrouteservice.org/dev/#/signup>

Für die API von geo.admin.ch ist kein Schlüssel nötig.

---

## 4. Installation und Start

### Schritt 1: Repository klonen

```bash
git clone https://github.com/furrer-stefan/zobaroute.git
cd zobaroute
```

### Schritt 2: Datenbank anlegen

Eine leere Datenbank mit dem Namen `zobaroute` erstellen und anschliessend das Schema einlesen. Das Schema liegt unter `backend/src/db/schema.sql` und erzeugt die vier Tabellen `routes`, `orders`, `order_items` und `stops`.

```bash
createdb -U postgres zobaroute
psql -U postgres -d zobaroute -f backend/src/db/schema.sql
```

Unter Windows lässt sich die Datenbank auch in pgAdmin anlegen und das Skript dort über das Query-Fenster ausführen.

### Schritt 3: Backend einrichten

```bash
cd backend
npm install
```

Anschliessend die Datei `.env` anlegen. Die Werte sind in Kapitel 5 beschrieben.

### Schritt 4: Frontend einrichten

```bash
cd ../frontend
npm install
```

### Schritt 5: Applikation starten

Es werden zwei Terminals benötigt, da Frontend und Backend in der Entwicklungsumgebung auf getrennten Ports laufen.

```bash
# Terminal 1, im Ordner backend
npm run dev

# Terminal 2, im Ordner frontend
npm run dev
```

| Dienst | Adresse |
|---|---|
| Frontend | <http://localhost:5173> |
| Backend | <http://localhost:3000> |

Alle Anfragen des Frontends an Pfade, die mit `/api` beginnen, werden über die Vite-Konfiguration an das Backend weitergeleitet. Deshalb ist im Frontend keine Basis-Adresse hinterlegt und der Code funktioniert ohne Anpassung auch im Betrieb, wo beide Teile unter derselben Adresse laufen.

Ob das Backend korrekt läuft und die Datenbank erreichbar ist, zeigt der Aufruf von <http://localhost:3000/api/health>.

---

## 5. Umgebungsvariablen

Die Secrets und die Konfiguration liegen in einer `.env`-Datei im Ordner `backend`. Diese Datei ist über `.gitignore` von der Versionierung ausgeschlossen und muss auf jedem Gerät neu angelegt werden.

| Variable | Bedeutung |
|---|---|
| `DATABASE_URL` | Vollständige Verbindungsangabe zur PostgreSQL-Datenbank |
| `ORS_API_KEY` | Schlüssel für OpenRouteService |
| `LOG_LEVEL` | Protokollstufe `error`, `warn`, `info` oder `debug`, Standardwert `info` |

Als Vorlage dient die Datei `.env.example`, die im Repository mitgeliefert wird:

```env
DATABASE_URL=
ORS_API_KEY=
LOG_LEVEL=info
```

Die Datei wird kopiert und ausgefüllt:

```bash
cp .env.example .env
```

### Aufbau von `DATABASE_URL`

```
postgresql://Benutzer:Passwort@Host:Port/Datenbank
```

Lokal mit der Standardinstallation von PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:Passwort@localhost:5432/zobaroute
```

Im Betrieb wird die Zeichenkette unverändert aus dem Neon-Dashboard übernommen. Neon liefert sie vollständig inklusive Hostname und des Parameters für die verschlüsselte Verbindung, sie muss also nur noch in der `.env`-Datei eingefügt werden. Dadurch unterscheidet sich die lokale Umgebung vom Betrieb nur im Wert dieser einen Variable.

Der Port des Backends wird nicht in der `.env` gesetzt. Lokal gilt der Standardwert 3000, im Betrieb gibt Render den Port über die Umgebungsvariable `PORT` selbst vor.

Fehlt `ORS_API_KEY`, startet die Applikation trotzdem. Die Distanzmatrix wird dann nicht abgefragt und die Berechnung greift auf die Luftliniendistanzen zurück.

---

## 6. Projektstruktur

```
zobaroute/
├── backend/
│   └── src/
│       ├── adapters/        Zugriff auf externe Dienste, Warteschlange für Anfragen
│       ├── controllers/     Nehmen Anfragen an, geben Antworten zurück
│       ├── db/              Verbindungspool und schema.sql
│       ├── exporters/       Erzeugen PDF- und GPX-Dateien
│       ├── repositories/    Datenbankzugriffe
│       ├── routes/          Zuordnung von Pfaden zu Controllern
│       ├── services/        Fachlogik, Algorithmus, Validierung
│       ├── utils/           Protokollierung
│       └── app.js           Einstiegspunkt des Servers
├── frontend/
│   └── src/
│       ├── hooks/           Zustand des Wizards
│       ├── pages/           Die fünf Schritte der Oberfläche
│       ├── services/        Anbindung an das Backend
│       └── App.jsx          Einstiegspunkt der Oberfläche
└── README.md
```

Der Aufbau des Backends folgt einem Vier-Schichten-Modell. Die Controller nehmen Anfragen an, die Services enthalten die Fachlogik, die Adapter sprechen externe Dienste an und die Repositories greifen auf die Datenbank zu.

Im Frontend ist die Backend-Anbindung zweistufig. Die untere Ebene setzt die HTTP-Anfragen ab und behandelt Fehler, die obere bildet die Endpunkte als Funktionen ab. Die Seiten selbst enthalten keine HTTP-Aufrufe.

---

## 7. API-Endpunkte

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/orders/validate` | Excel-Datei validieren |
| `POST` | `/api/orders` | Nach Validierung die Bestellungen in Datenbank schreiben |
| `GET` | `/api/orders` | Alle Bestellungen auslesen |
| `POST` | `/api/geocode` | Startet Geokodierung aller Adressen in Koordinaten |
| `GET` | `/api/geocode/progress` | Gibt den aktuellen Status der Geokodierung zurück |
| `POST` | `/api/geocode/address` | Eine einzelne Adresse kann geokodiert werden |
| `POST` | `/api/routes/calculate` | Berechnung starten |
| `GET` | `/api/routes` | Berechnete Routen mit Stopps auslesen |
| `GET` | `/api/routes/:id/gpx` | GPX-Datei einer Route erhalten |
| `GET` | `/api/routes/:id/pdf` | PDF-Datei einer Route erhalten |
| `DELETE` | `/api/session` | Alle Daten löschen |
| `GET` | `/api/health` | Für Health-Check der Datenbank |

Der Datei-Upload nimmt ausschliesslich `.xlsx`-Dateien bis 5 MB an. Die Datei wird im Arbeitsspeicher verarbeitet und nicht auf dem Server abgelegt.

---

## 8. Bedienung

Die Oberfläche führt in fünf Schritten durch den Vorgang. Ein Schritt vorwärts ist erst möglich, wenn der vorherige abgeschlossen ist.

1. **Import** — Die Bestellliste wird als Excel-Datei ausgewählt und geprüft. Bei einem Formatfehler bleibt man auf dieser Seite und erhält eine Meldung.
2. **Validierung** — Die erkannten Adressen werden geokodiert. Adressen ohne Treffer lassen sich direkt in einem Bearbeitungsmodus korrigieren und einzeln erneut prüfen.
3. **Konfiguration** — Die Anzahl der Verteil-Teams und die Adresse der Verteil-Zentrale werden festgelegt.
4. **Berechnung** — Die vier Phasen des Algorithmus laufen durch, der Fortschritt wird angezeigt.
5. **Export** — Für jedes Verteil-Team stehen eine PDF-Liste und eine GPX-Datei zum Herunterladen bereit.

Der gesamte Zustand liegt im Arbeitsspeicher des Browsers. Wird die Seite neu geladen, beginnt der Vorgang von vorne. Das ist beabsichtigt, damit keine personenbezogenen Daten auf dem Gerät des Benutzers zurückbleiben.

---

## 9. Betrieb

Die Applikation läuft auf **Render**, die Datenbank auf **Neon**, beide in der Region Frankfurt. Render ist mit dem GitHub-Repository verknüpft und baut bei jeder Änderung am Branch `main` automatisch neu. Frontend und Backend laufen in derselben Instanz.

| Einstellung | Wert |
|---|---|
| Build-Befehl | `cd frontend && npm install && npm run build && cd ../backend && npm install` |
| Start-Befehl | `cd backend && npm start` |
| Öffentliche Adresse | <https://zobaroute.onrender.com/> |

Die Umgebungsvariablen aus Kapitel 5 werden in den Einstellungen von Render hinterlegt. `DATABASE_URL` enthält dabei die Verbindungsangabe aus dem Neon-Dashboard. Die Verbindung zur Datenbank ist TLS-verschlüsselt mit Zertifikatsprüfung.

Der Betrieb ist in den kostenlosen Tarifen von Neon und Render sowie den freien Kontingenten der beiden APIs möglich.

---

## 10. Konventionen und Dokumentation

- **Sprache:** Quellcode, Bezeichner und Kommentare sind englisch, die Benutzeroberfläche und alle Meldungen an den Benutzer deutsch.
- **Datenschutz:** Im Repository liegen keine echten Bestelldaten. Für Tests dient die Datei `backend/zobaroute_testfile.xlsx`, die ausschliesslich erfundene Namen und Adressen enthält.
- **Datenbankschema:** Der vollständige Aufbau der Datenbank steht in `backend/src/db/schema.sql`.
- **Ausführliche Dokumentation:** Entscheidungen, Anforderungen, Architektur, der Algorithmus und die Testprotokolle sind in der Diplomarbeit beschrieben: `DA_2026_Furrer_Stefan_ZoBaRoute_Webapplikation.pdf`.
