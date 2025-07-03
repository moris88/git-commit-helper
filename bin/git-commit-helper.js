#!/usr/bin/env node
try {
  require("../src/index.js");
} catch (error) {
  console.error("Errore:", error.message);
  process.exit(1);
}