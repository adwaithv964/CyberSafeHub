
const https = require('https');
const fs = require('fs');

const emails = ['test@example.com', 'foo@bar.com'];

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}
async function run() {
    let log = '';

    // 1. Check basic check-email for safe email (expected 404 or empty)
    try {
        let safeUrl = `https://api.xposedornot.com/v1/check-email/very_likely_safe_email_999999@example.com`;
        log += `Checking SAFE: ${safeUrl}\n`;
        let res = await get(safeUrl);
        log += `Status: ${res.status}\nBody: ${res.body}\n\n`;
    } catch (e) { log += `Error safe: ${e.message}\n`; }

    // 2. Check basic check-email for breached
    for (let e of emails) {
        let url = `https://api.xposedornot.com/v1/check-email/${e}`;
        log += `Checking BASIC ${e}: ${url}\n`;
        let res = await get(url);
        log += `Status: ${res.status}\nBody: ${res.body}\n\n`;
    }

    // 3. Check analytics
    for (let e of emails) {
        let url = `https://api.xposedornot.com/v1/breach-analytics?email=${e}`;
        log += `Checking ANALYTICS ${e}: ${url}\n`;
        let res = await get(url);
        log += `Status: ${res.status}\nBody: ${res.body}\n\n`;
    }

    fs.writeFileSync('output.txt', log);
    console.log("Done writing output.txt");
}
run();
