import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

// Get the current directory of the module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the package.json file
const packageJsonPath = path.join(__dirname, "..", "..", "package.json");

// Read package.json content
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Get the current version from package.json
const currentVersion = packageJson.version;

// Initialize the buildcounter field if not exists
if (!packageJson.buildcounter) {
    packageJson.buildcounter = { version: currentVersion, count: 0 };
}

// Load or initialize the counter
let buildCounter = packageJson.buildcounter;

// Reset counter if the version has changed
if (buildCounter.version !== currentVersion) {
    buildCounter.version = currentVersion;
    buildCounter.count = 1;
} else {
    buildCounter.count += 1;
}

// Save the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Output the updated build counter
console.log(`Build Counter Updated: ${buildCounter.version} - Build ${buildCounter.count}`);
