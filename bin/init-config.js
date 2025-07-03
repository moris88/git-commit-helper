const fs = require("fs");
const path = require("path");

const template = {
  geminiApiKey: "your-api-key-here",
  geminiModel: "gemini-2.0-flash",
  defaultCommitType: "feat",
  maxSubjectLength: 50,
};

const configPath = path.resolve(
  process.cwd(),
  ".git-commit-helper",
  "gch.config.json"
);

if (!fs.existsSync(path.dirname(configPath))) {
  fs.mkdirSync(path.dirname(configPath));
}

fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
console.log(`Config creato in ${configPath}`);
