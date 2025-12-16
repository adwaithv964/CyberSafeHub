const https = require('https');

const API_KEY = "AIzaSyDV2Zf4aYl2NJ_QF0x-hifZ1KIKtRjH2t";
const urlToCheck = "http://google.com";

const postData = JSON.stringify({
    client: {
        clientId: "cyber-safe-hub",
        clientVersion: "1.0.0"
    },
    threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
            { url: urlToCheck }
        ]
    }
});

const options = {
    hostname: 'safebrowsing.googleapis.com',
    port: 443,
    path: `/v4/threatMatches:find?key=${API_KEY}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY: ' + data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
