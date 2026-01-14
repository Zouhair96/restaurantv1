const fs = require('fs');
const path = require('path');

console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);

const pathsToCheck = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env'), // Assuming this script is in /scripts
    path.resolve(__dirname, '../../.env'),
    'C:\\Users\\33753\\OneDrive\\Documents\\restaurantv1\\.env' // Hardcoded absolute check
];

console.log("Checking paths:");
let foundPath = null;
for (const p of pathsToCheck) {
    const exists = fs.existsSync(p);
    console.log(` - ${p}: ${exists ? "FOUND" : "NOT FOUND"}`);
    if (exists && !foundPath) foundPath = p;
}

if (foundPath) {
    console.log("\nParsing file:", foundPath);
    const envConfig = fs.readFileSync(foundPath, 'utf8');
    console.log("Raw content length:", envConfig.length);

    envConfig.split('\n').forEach(line => {
        if (!line || line.startsWith('#')) return;
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts.shift().trim();
            const value = parts.join('=').trim().replace(/^["']|["']$/g, '');
            console.log(`Loaded Key: ${key} (Length: ${value.length})`);
            if (key === 'DATABASE_URL') {
                console.log("DATABASE_URL starts with:", value.substring(0, 10));
            }
            process.env[key] = value;
        }
    });
} else {
    console.log("❌ No .env file found via node script.");
}
