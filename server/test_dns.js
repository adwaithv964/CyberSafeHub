const dns = require('dns').promises;

const resolveHostname = async (ip) => {
    try {
        console.log(`Resolving ${ip}...`);
        const hostnames = await Promise.race([
            dns.reverse(ip),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        if (hostnames && hostnames.length > 0) {
            console.log(`Resolved: ${hostnames[0]}`);
        } else {
            console.log('No hostname found');
        }
    } catch (err) {
        console.log(`Error resolving ${ip}: ${err.message}`);
    }
};

// Test with localhost and maybe a known local IP if possible, or just localhost
resolveHostname('127.0.0.1');
resolveHostname('8.8.8.8'); // Should resolve to dns.google
