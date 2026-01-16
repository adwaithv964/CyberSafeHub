const axios = require('axios');

async function triggerScan() {
    try {
        console.log("Triggering Scan...");
        const response = await axios.get('http://localhost:3001/api/wifi-radar/scan');
        console.log("Scan Result:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error triggering scan:", error.message);
    }
}

triggerScan();
