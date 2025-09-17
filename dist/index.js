#!/usr/bin/env node
import fs from "fs-extra";
import * as path from "path";
import { samplePageTemplate } from "./templates/samplePage.js";
// Get arguments from CLI
const args = process.argv.slice(2);
const componentName = args[0];
const outputDir = args[1] || process.cwd(); // default: current folder
if (!componentName) {
    console.error("❌ Please provide a component name: generate-page <ComponentName> [outputDir]");
    process.exit(1);
}
// Replace placeholder with actual component name
const content = samplePageTemplate.replace(/__COMPONENT_NAME__/g, componentName);
// Ensure folder exists
fs.ensureDirSync(outputDir);
// Write page.tsx
const filePath = path.join(outputDir, "page.tsx");
fs.writeFileSync(filePath, content.trim());
console.log(`✅ Page '${componentName}' created at ${filePath}`);
