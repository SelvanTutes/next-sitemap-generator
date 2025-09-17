#!/usr/bin/env node
"use strict";
// checkPages.ts
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
const args = process.argv.slice(2);
const ROOT = args[0] ? path.resolve(args[0]) : path.join(process.cwd(), "src");
const HASH_STORE = path.join(process.cwd(), ".page-hashes.json");
// 1️⃣ Load previous hash data (or empty)
const oldHashes = fs.existsSync(HASH_STORE)
    ? await fs.readJson(HASH_STORE)
    : {};
// 2️⃣ Recursively find all page.tsx files
async function findPages(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory())
            files.push(...(await findPages(full)));
        else if (e.name === "page.tsx")
            files.push(full);
    }
    return files;
}
// 3️⃣ Compute hash for a file
async function hashFile(file) {
    const buf = await fs.readFile(file);
    return crypto.createHash("sha256").update(buf).digest("hex");
}
const pages = await findPages(ROOT);
const newHashes = {};
// 4️⃣ Compare and record timestamps
for (const file of pages) {
    const hash = await hashFile(file);
    const rel = path.relative(process.cwd(), file);
    const prev = oldHashes[rel];
    if (!prev || prev.hash !== hash) {
        // content changed → set current timestamp
        newHashes[rel] = {
            hash,
            lastChanged: new Date().toISOString(),
        };
        console.log(`🔄 Updated: ${rel}`);
    }
    else {
        // unchanged → keep previous timestamp
        newHashes[rel] = prev;
    }
}
// 5️⃣ Save updated hash data
await fs.writeJson(HASH_STORE, newHashes, { spaces: 2 });
console.log("✅ Hash check complete.");
