const https = require('https');
const fs = require('fs');

const keysToTest = [
    'AIzaSyDV2Zf4aYl2NJ_QF0x-hifZ1KIKtRjH2t',
    'AIzaSyDV2Zf4aYl2NJ_QF0x-hifZ1KIKtRjH2tU'
];

function testKey(key) {
    return new Promise((resolve) => {
        const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`;
        const postData = JSON.stringify({
            client: { clientId: "test", clientVersion: "1.0.0" },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: "http://google.com" }]
            }
        });

        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        }, (res) => {
            const result = `Key ending in ...${key.slice(-5)}: Status ${res.statusCode}\n`;
            fs.appendFileSync('verification_result.txt', result);

            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                // If 200, we found it.
                if (res.statusCode !== 200) {
                    fs.appendFileSync('verification_result.txt', `Body: ${data.substring(0, 100)}\n`);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            fs.appendFileSync('verification_result.txt', `Error with key ...${key.slice(-5)}: ${e.message}\n`);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

(async () => {
    console.log("Starting key verification...");
    for (const key of keysToTest) {
        await testKey(key);
    }
    console.log("Done.");
})();
