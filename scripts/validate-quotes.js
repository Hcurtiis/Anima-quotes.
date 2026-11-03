"use strict";
const fs = require("node:fs");
const file = process.argv[2] || "quotes.json";
let quotes;
try {
  quotes = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`${file}: cannot read valid JSON: ${error.message}`);
  process.exit(1);
}
if (!Array.isArray(quotes)) {
  console.error(`${file}: root must be an array.`);
  process.exit(1);
}
let errors = 0;
const seen = new Map();
function fail(index, message) {
  console.error(`${file}[${index}]: ${message}`);
  errors++;
}
if (!quotes.length) {
  console.error(`${file}: array must contain at least one quote.`);
  errors++;
}
quotes.forEach((quote, index) => {
  if (!quote || typeof quote !== "object" || Array.isArray(quote)) {
    fail(index, "must be an object.");
    return;
  }
  for (const key of ["text", "who"]) {
    if (typeof quote[key] !== "string" || !quote[key].trim()) {
      fail(index, `${key} must be a non-empty string.`);
    }
  }
  if (Object.hasOwn(quote, "accent") &&
      (typeof quote.accent !== "string" || !/^[0-9a-f]{6}$/i.test(quote.accent))) {
    fail(index, "accent must be exactly 6 hexadecimal characters, without #.");
  }
  if (typeof quote.text === "string" && quote.text.trim()) {
    const text = quote.text.trim();
    if (seen.has(text)) fail(index, `duplicate text, first seen at index ${seen.get(text)}.`);
    else seen.set(text, index);
    const length = Array.from(quote.text).length;
    if (length > 120) console.warn(`${file}[${index}]: WARNING: text is ${length} characters (limit 120).`);
  }
});
if (errors) {
  console.error(`Validation failed: ${errors} error(s). Indices are zero-based.`);
  process.exit(1);
}
console.log(`Validated ${quotes.length} quotes. No errors.`);
