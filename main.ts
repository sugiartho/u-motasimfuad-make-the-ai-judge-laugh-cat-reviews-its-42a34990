// main.ts — Cat Reviews Its Human entry.
// Reads the one-star review from LINE.txt, validates it against the
// competition gate (UTF-8, 1-200 chars, one line, not whitespace-only),
// writes it to /output/entry.txt, then reads it back and compares bytes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function loadReview(): string {
  let raw: string;
  try {
    raw = readFileSync(join(botDir, "LINE.txt"), "utf-8");
  } catch {
    fail("cannot read LINE.txt");
  }
  // Tolerate a single trailing newline in the source file.
  const review = raw!.endsWith("\n") ? raw!.slice(0, -1) : raw!;
  if (review.length < 1 || review.length > 200) {
    fail(`review must be 1-200 characters, got ${review.length}`);
  }
  if (review.trim().length === 0) {
    fail("review must not be whitespace only");
  }
  if (review.includes("\n") || review.includes("\r")) {
    fail("review must be a single line");
  }
  for (const ch of review) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      fail("review must not contain control characters");
    }
  }
  return review;
}

function emitReview(review: string): void {
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, review, "utf-8");
  const back = readFileSync(target, "utf-8");
  if (back !== review) {
    fail("read-back mismatch: output differs from review");
  }
  console.log(`wrote ${target} (${review.length} characters)`);
}

emitReview(loadReview());
