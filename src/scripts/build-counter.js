import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the counter file
const counterFile = path.join(__dirname, "../../build-counter.json");
// Read package.json version
const packageJsonPath = path.join(__dirname, "..", "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const currentVersion = packageJson.version;

// Load or initialize the counter file
let data = { version: currentVersion, count: 0 };
if (fs.existsSync(counterFile)) {
    try {
        data = JSON.parse(fs.readFileSync(counterFile, "utf8"));
    } catch (err) {
        console.error("Failed to read build-counter.json:", err);
    }
}

// Reset counter if version has changed
if (data.version !== currentVersion) {
    data.version = currentVersion;
    data.count = 1;
} else {
    data.count += 1;
}

// Save updated counter
fs.writeFileSync(counterFile, JSON.stringify(data, null, 2));
console.log(`Build Counter Updated: ${data.version} - Build ${data.count}`);
