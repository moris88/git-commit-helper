#!/usr/bin/env node
import { main } from './main.js';

main().catch((error) => {
  console.error("An unexpected error occurred:", error.message);
  process.exit(1);
});