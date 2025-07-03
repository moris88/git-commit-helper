#!/usr/bin/env node
import("../src/index.js")
  .catch((error) => {
    console.error("Errore:", error.message);
    process.exit(1);
  })
