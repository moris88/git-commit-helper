const fs = require("fs");
const path = require("path");
const os = require("os");

// Crea il file di configurazione se non esiste
const configDir = path.join(os.homedir(), ".git-commit-helper");
const configFile = path.join(configDir, "gch.config.json");

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

if (!fs.existsSync(configFile)) {
  fs.writeFileSync(
    configFile,
    JSON.stringify(
      {
        geminiApiKey: "",
        geminiModel: "gemini-2.0-flash",
        defaultCommitType: "feat",
        maxSubjectLength: 50,
      },
      null,
      2
    )
  );
}

console.log(
  "Configurazione iniziale completata. Modifica il file:",
  configFile
);
