const oui = require('oui');
const mDNS = require('multicast-dns');

// Test Vendor Lookup
console.log("Testing Vendor Lookup...");
const mac = '00:1A:11:11:11:11'; // Google
try {
    const vendor = oui(mac);
    console.log(`MAC ${mac} Vendor:`, vendor ? vendor.split('\n')[0] : 'Unknown');
} catch (e) {
    console.error("Vendor lookup failed:", e.message);
}

// Test mDNS
console.log("\nTesting mDNS Discovery (waiting 3s)...");
const mdns = mDNS();
mdns.on('response', (response) => {
    response.answers.forEach(a => {
        if (a.type === 'A') {
            console.log(`mDNS Response: ${a.name} -> ${a.data}`);
        }
    });
});
mdns.query({ questions: [{ name: '_services._dns-sd._udp.local', type: 'PTR' }] });

setTimeout(() => {
    console.log("mDNS Test Complete");
    mdns.destroy();
    process.exit(0);
}, 3000);
