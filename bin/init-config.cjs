import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { t } from '../src/i18n.js';

const template = {
  geminiApiKey: "your-api-key-here",
  geminiModel: "gemini-2.0-flash",
  defaultCommitType: "feat",
  maxSubjectLength: 50,
};

try {
  console.log(t('initialization'));
  const configPath = resolve(process.cwd(), "gch.config.json");

  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(
      t('configCreated', { path: process.cwd() })
    );
  } else {
    console.log(
      t('configExists', { path: process.cwd() })
    );
  }
  process.exit(0);
} catch (error) {
  console.error(
    t('configCreationError'),
    error.message
  );
  process.exit(1);
}
