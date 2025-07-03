import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const template = {
  geminiApiKey: "your-api-key-here",
  geminiModel: "gemini-2.0-flash",
  defaultCommitType: "feat",
  maxSubjectLength: 50,
};

try {
  console.log("Inizializzazione della configurazione...");
  const configPath = resolve(process.cwd(), "gch.config.json");

  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(
      `File di configurazione 'gch.config.json' creato in ${process.cwd()}`
    );
  } else {
    console.log(
      `Il file di configurazione 'gch.config.json' esiste già in ${process.cwd()}`
    );
  }
  process.exit(0);
} catch (error) {
  console.error(
    "Errore durante la creazione del file di configurazione:",
    error.message
  );
  process.exit(1);
}
