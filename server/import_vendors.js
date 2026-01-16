const fs = require('fs');
const readline = require('readline');

async function importVendors() {
    const vendorsFile = './vendors.json';
    const importFile = './MAC-by-Vendor.txt';

    fs.writeFileSync('trace.log', 'Script started\n');

    console.log("Starting vendor import...");
    fs.appendFileSync('trace.log', 'Loaded files vars\n');

    // 1. Load existing vendors
    let currentVendors = {};
    if (fs.existsSync(vendorsFile)) {
        currentVendors = require(vendorsFile);
    }
    fs.appendFileSync('trace.log', `Loaded ${Object.keys(currentVendors).length} vendors\n`);
    console.log(`Loaded ${Object.keys(currentVendors).length} existing vendors.`);

    // 2. Read huge text file
    const fileStream = fs.createReadStream(importFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;

    // Regex to parse: "0016 - 00:00:10 - SYTEK INC."
    // It seems to be fixed width or " - " separated.
    // Let's split by " - "

    for await (const line of rl) {
        if (!line || line.trim().startsWith('Misc') || line.trim().startsWith('Num')) continue;

        const parts = line.split(' - ');
        if (parts.length >= 3) {
            // parts[0] is index, parts[1] is MAC, parts[2] is Vendor
            const mac = parts[1].trim().toUpperCase();
            const vendor = parts[2].trim();

            if (mac.length === 8 && mac.includes(':')) {
                // Formatting is "XX:XX:XX"
                // Check if already exists (Case Insensitive check to be safe)
                const exists = Object.keys(currentVendors).some(k => k.toUpperCase() === mac);

                if (!exists) {
                    currentVendors[mac] = vendor;
                    count++;
                }
            }
        }
    }

    console.log(`Imported ${count} new vendors.`);
    fs.appendFileSync('trace.log', `Imported ${count}\n`);

    // 3. Write back sorted keys
    const sortedVendors = {};
    Object.keys(currentVendors).sort().forEach(key => {
        sortedVendors[key] = currentVendors[key];
    });

    fs.writeFileSync(vendorsFile, JSON.stringify(sortedVendors, null, 4));
    console.log(`Successfully saved ${Object.keys(sortedVendors).length} total vendors to ${vendorsFile}`);
    fs.appendFileSync('trace.log', 'Finished writing\n');
}

importVendors().catch(console.error);
