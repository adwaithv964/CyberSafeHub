const https = require('https');

const API_KEY = 'AIzaSyDV2Zf4aYl2NJ_QF0x-hifZ1KIKtRjH2t'; // The key from .env
const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

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
    console.log('Status Code:', res.statusCode);
    res.on('data', d => process.stdout.write(d));
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(postData);
req.end();
