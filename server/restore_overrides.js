const fs = require('fs');

const overrides = {
    "BC:62:D2": "Genexis International B.V.",
    "6C:24:A6": "Vivo Mobile Communication",
    "4C:50:F1": "Guangdong Oppo Mobile",
    "3A:B8:9F": "Unknown Smart Device",
    "E6:C0:12": "Sichuan AI-Link Technology",
    "FF:FF:FF": "Broadcast Address"
};

try {
    const vendors = require('./vendors.json');
    let added = 0;
    for (const [mac, vendor] of Object.entries(overrides)) {
        vendors[mac] = vendor;
        added++;
    }
    fs.writeFileSync('./vendors.json', JSON.stringify(vendors, null, 4));
    console.log(`Restored ${added} manual overrides.`);
} catch (e) {
    console.error("Error restoring overrides:", e);
}
