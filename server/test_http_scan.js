const axios = require('axios');

const targets = ['192.168.1.1', '192.168.1.2', '192.168.1.7', '192.168.1.9'];

async function scanHttp() {
    for (const ip of targets) {
        console.log(`Checking HTTP for ${ip}...`);
        try {
            const res = await axios.get(`http://${ip}`, { timeout: 2000 });
            const html = res.data.toString();
            // Extract <title>
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
                console.log(`[HTTP] ${ip} Title: ${titleMatch[1].trim()}`);
            } else {
                console.log(`[HTTP] ${ip} responded but no title found.`);
            }
        } catch (e) {
            console.log(`[HTTP] ${ip} failed: ${e.message}`);
        }
    }
}

scanHttp();
