/* =========================================
   RACE&FUN THUMERSBACH
   ANMELDUNG – RONACHKOPF-CHALLENGE 2027
   ========================================= */


/* 1. GRUNDEINSTELLUNGEN */

// Adresse unserer Google Apps Script Web-App
const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbys5sW7sWwW2j4wl-6NoErftfJLb7Bb1g2W68dC9ILt6hPTXrCkYukIrHgfnGqOvRIMIA/exec";

// Veranstaltungsdaten
const EVENT_DATUM = "2027-02-13";

// Maximale Teilnehmerzahl
const MAX_TEILNEHMER = 180;


/* 2. ELEMENTE AUS DEM HTML-FORMULAR */

// Das gesamte Anmeldeformular
const formular = document.getElementById("anmeldeformular");

// Geburtsdatum
const geburtsdatumFeld = document.getElementById("geburtsdatum");

// Bereich für die Zustimmung der Eltern
const elternbereich = document.getElementById("elternbereich");

// Checkbox für die Zustimmung der Eltern
const elternCheckbox = document.getElementById("erziehungsberechtigte");

// Absenden-Schaltfläche
const anmeldebutton = document.getElementById("anmeldebutton");

// Rückmeldung an den Teilnehmer
const rueckmeldung = document.getElementById("rueckmeldung");


/* 3. ALTER BERECHNEN */

// Berechnet das Alter am Veranstaltungstag
function berechneAlter(geburtsdatum) {

    const geburtstag = new Date(geburtsdatum + "T12:00:00");
    const veranstaltung = new Date(EVENT_DATUM + "T12:00:00");

    let alter = veranstaltung.getFullYear() - geburtstag.getFullYear();

    const geburtstagNochNichtGehabt =
        veranstaltung.getMonth() < geburtstag.getMonth() ||
        (
            veranstaltung.getMonth() === geburtstag.getMonth() &&
            veranstaltung.getDate() < geburtstag.getDate()
        );

    if (geburtstagNochNichtGehabt) {
        alter--;
    }

    return alter;
}


/* 4. ELTERN-ZUSTIMMUNG EINBLENDEN */

// Prüft, ob der Teilnehmer minderjährig ist
function pruefeMinderjaehrigkeit() {

    const datum = geburtsdatumFeld.value;

    if (!datum) {
        elternbereich.hidden = true;
        elternCheckbox.required = false;
        return;
    }

    const alter = berechneAlter(datum);

    // Bei Teilnehmern unter 18 Jahren wird die Zustimmung benötigt
    if (alter >= 12 && alter < 18) {

        elternbereich.hidden = false;
        elternCheckbox.required = true;

    } else {

        elternbereich.hidden = true;
        elternCheckbox.required = false;
        elternCheckbox.checked = false;
    }
}

// Sobald das Geburtsdatum geändert wird, wird die Prüfung ausgeführt
geburtsdatumFeld.addEventListener("change", pruefeMinderjaehrigkeit);


/* 5. DATUM UND MINDESTALTER PRÜFEN */

// Frühestes erlaubtes Geburtsdatum festlegen
// Für die Teilnahme am 13.02.2027 muss man mindestens 12 Jahre alt sein.
const spaetestesGeburtsdatum = "2015-02-13";

geburtsdatumFeld.max = spaetestesGeburtsdatum;


/* 6. RÜCKMELDUNGEN ANZEIGEN */

function zeigeRueckmeldung(text, erfolgreich) {

    rueckmeldung.textContent = text;

    rueckmeldung.classList.remove("erfolg", "fehler");

    if (erfolgreich) {
        rueckmeldung.classList.add("erfolg");
    } else {
        rueckmeldung.classList.add("fehler");
    }
}


/* 7. ANMELDUNG ABSENDEN */

// Diese Funktion wird beim Klick auf "Verbindlich anmelden" ausgeführt
formular.addEventListener("submit", async function(event) {

    // Verhindert das normale Neuladen der Seite
    event.preventDefault();

    // Alte Rückmeldung entfernen
    zeigeRueckmeldung("", true);

    // Daten aus dem Formular lesen
    const daten = {

        vorname: document.getElementById("vorname").value.trim(),

        nachname: document.getElementById("nachname").value.trim(),

        geburtsdatum: geburtsdatumFeld.value,

        geschlecht: document.getElementById("geschlecht").value,

        email: document.getElementById("email").value.trim(),

        verein: document.getElementById("verein").value.trim(),

        wertung: document.getElementById("wertung").value,

        teilnahmebedingungen:
            document.getElementById("teilnahmebedingungen").checked,

        fotoInfo:
            document.getElementById("fotoInfo").checked,

        fotoEinwilligung:
            document.getElementById("fotoEinwilligung").checked,

        erziehungsberechtigte:
            elternCheckbox.checked
    };


    /* 7.1. EINFACHE ZUSÄTZLICHE PRÜFUNGEN */

    const alter = berechneAlter(daten.geburtsdatum);

    if (alter < 12) {
        zeigeRueckmeldung(
            "Eine Teilnahme ist erst ab 12 Jahren möglich.",
            false
        );
        return;
    }

    if (alter < 18 && !daten.erziehungsberechtigte) {
        zeigeRueckmeldung(
            "Bitte die Zustimmung eines Erziehungsberechtigten bestätigen.",
            false
        );
        return;
    }


    /* 7.2. BUTTON WÄHREND DER ÜBERMITTLUNG SPERREN */

    anmeldebutton.disabled = true;
    anmeldebutton.textContent = "Anmeldung wird übermittelt ...";


    /* 7.3. DATEN AN GOOGLE SENDEN */

    try {

        await fetch(GOOGLE_SCRIPT_URL, {

            method: "POST",

            // Verhindert eine zusätzliche CORS-Prüfanfrage
            mode: "no-cors",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(daten)
        });

        /*
         WICHTIG:
         Bei no-cors können wir die Antwort von Google nicht lesen.
         Daher dürfen wir hier noch keine erfolgreiche Anmeldung anzeigen.
         Die zuverlässige Bestätigung bauen wir im nächsten Schritt ein.
        */

        zeigeRueckmeldung(
            "Die Übermittlung wurde gestartet. Bitte noch auf die endgültige Bestätigung warten.",
            true
        );

    } catch (fehler) {

        console.error("Fehler bei der Anmeldung:", fehler);

        zeigeRueckmeldung(
            "Die Anmeldung konnte nicht übermittelt werden. Bitte versuche es erneut.",
            false
        );

    } finally {

        // Button wieder freigeben
        anmeldebutton.disabled = false;
        anmeldebutton.textContent = "Verbindlich anmelden";
    }

});
