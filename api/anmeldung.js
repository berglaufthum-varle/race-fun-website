// =========================================
// RACE&FUN THUMERSBACH
// VERBINDUNG ZU GOOGLE APPS SCRIPT
// =========================================

// Adresse unserer Google Apps Script Web-App
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbys5sW7sWwW2j4wl-6NoErftfJLb7Bb1g2W68dC9ILt6hPTXrCkYukIrHgfnGqOvRIMIA/exec";


export default async function handler(req, res) {

  // Nur POST-Anfragen erlauben
  if (req.method !== "POST") {
    return res.status(405).json({
      erfolg: false,
      nachricht: "Diese Anfrage ist nicht erlaubt."
    });
  }

  try {

    // Anmeldung an Google weiterleiten
    const googleAntwort = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(req.body)
    });

    // Antwort von Google auslesen
    const ergebnis = await googleAntwort.json();

    // Ergebnis an die Anmeldeseite zurückgeben
    return res.status(200).json(ergebnis);

  } catch (fehler) {

    console.error("Fehler bei der Google-Übermittlung:", fehler);

    return res.status(500).json({
      erfolg: false,
      nachricht: "Die Anmeldung konnte derzeit nicht verarbeitet werden."
    });

  }
}
