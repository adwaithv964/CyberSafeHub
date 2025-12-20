const os = require('os');
const { exec } = require('child_process');

console.log("--- Network Interfaces ---");
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
    console.log(`Interface: ${name}`);
    for (const iface of interfaces[name]) {
        console.log(`  Family: ${iface.family}, Internal: ${iface.internal}, Address: ${iface.address}, Netmask: ${iface.netmask}`);
    }
}

console.log("\n--- ARP Table ---");
exec('arp -a', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    console.log(stdout);
});
