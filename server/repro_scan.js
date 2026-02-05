const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Mock response object
const res = {
    json: (data) => console.log("\n--- Final Result ---\n", JSON.stringify(data, null, 2)),
    status: (code) => ({
        json: (data) => console.log(`\n--- Error ${code} ---\n`, data)
    })
};

async function runScan() {
    console.log("Starting Scan Debug...");

    try {
        // Helper: Get local IP to determine subnet
        const getLocalIP = () => {
            const interfaces = os.networkInterfaces();
            let preferredIP = null;

            console.log("Network Interfaces found:", Object.keys(interfaces));

            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    // Skip internal (localhost) and non-IPv4 addresses
                    if (!iface.internal && iface.family === 'IPv4') {
                        console.log(`Interface ${name}: ${iface.address}`);
                        // Check for standard private ranges (192.168.x.x, 10.x.x.x, 172.16.x.x)
                        if (iface.address.startsWith('192.168.') ||
                            iface.address.startsWith('10.') ||
                            (iface.address.startsWith('172.') && parseInt(iface.address.split('.')[1]) >= 16 && parseInt(iface.address.split('.')[1]) <= 31)) {
                            return iface.address; // Return immediately if a common private IP is found
                        }
                        // Store other candidates (like 169.254 or public IPs) just in case
                        if (!preferredIP) preferredIP = iface.address;
                    }
                }
            }
            return preferredIP || '192.168.1.1'; // Fallback
        };

        // Helper: Ping Sweep to populate ARP table
        const pingSweep = (subnetBase) => {
            console.log(`Starting ping sweep on ${subnetBase}.*`);
            return new Promise((resolve) => {
                const isWin = process.platform === 'win32';
                // Scan full subnet (1-254) to ensure we catch all devices (DHCP often starts at .100)
                let completed = 0;
                const totalToPing = 20; // REDUCED FOR DEBUGGING SPEED (was 254)
                const BATCH_SIZE = 10; // Batch pings to avoid overwhelming the system

                const pingBatch = async (start, end) => {
                    const promises = [];
                    for (let i = start; i <= end; i++) {
                        if (i > totalToPing) break;
                        const target = `${subnetBase}.${i}`;
                        // Shorter timeout (150ms) to speed up full scan
                        const cmd = isWin ? `ping -n 1 -w 150 ${target}` : `ping -c 1 -W 0.15 ${target}`;
                        promises.push(new Promise(r => exec(cmd, r)));
                    }
                    await Promise.all(promises);
                };

                // Run in batches
                const run = async () => {
                    for (let i = 1; i <= totalToPing; i += BATCH_SIZE) {
                        await pingBatch(i, i + BATCH_SIZE - 1);
                    }
                    console.log("Ping sweep finished");
                    resolve();
                };

                run();
            });
        };

        const localIP = getLocalIP();
        console.log("Selected Local IP:", localIP);

        const subnetParts = localIP.split('.');
        subnetParts.pop();
        const subnetBase = subnetParts.join('.');
        console.log("Subnet Base:", subnetBase);

        // Run ping sweep (Wait up to 5s max, though it should be faster with async batches)
        await Promise.race([pingSweep(subnetBase), new Promise(r => setTimeout(r, 7000))]);


        // Helper: Local Vendor Lookup
        const getVendorLocal = (mac) => {
            if (!mac) return 'Unknown Vendor';
            try {
                // Remove colons/dashes and take first 6 chars
                const cleanMac = mac.replace(/[:-\s]/g, '').toUpperCase();
                const prefix = cleanMac.substring(0, 6);

                const formattedPrefix = `${prefix.substring(0, 2)}:${prefix.substring(2, 4)}:${prefix.substring(4, 6)}`;


                // Load vendors - ADJUST PATH FOR REPRO SCRIPT
                const vendorsPath = path.join(__dirname, 'vendors.json');
                if (!fs.existsSync(vendorsPath)) {
                    console.warn("vendors.json not found at", vendorsPath);
                    // return 'Unknown Vendor'; // Don't return, allow continue
                }
                const vendors = fs.existsSync(vendorsPath) ? require(vendorsPath) : {};

                // Try Exact Match
                if (vendors[formattedPrefix]) {
                    return vendors[formattedPrefix];
                }

                // Try case-insensitive keys just in case
                const key = Object.keys(vendors).find(k => k.toUpperCase() === formattedPrefix);
                if (key) return vendors[key];


                return 'Unknown Vendor';
            } catch (err) {
                console.error("Vendor lookup error:", err.message);
                return 'Unknown Vendor';
            }
        };

        // Helper: mDNS Discovery
        const scanMdns = () => {
            console.log("Starting mDNS scan...");
            return new Promise((resolve) => {
                try {
                    const mDNS = require('multicast-dns');
                    const mdns = mDNS();
                    const devices = {};

                    mdns.on('response', (response) => {
                        response.answers.forEach(a => {
                            if (a.type === 'A' && a.data) {
                                devices[a.data] = a.name; // Map IP to Name
                            }
                        });
                        response.additionals.forEach(a => {
                            if (a.type === 'A' && a.data) {
                                devices[a.data] = a.name;
                            }
                        });
                    });

                    // Query for all services
                    mdns.query({ questions: [{ name: '_services._dns-sd._udp.local', type: 'PTR' }] });

                    // Use a short timeout to gather responses
                    setTimeout(() => {
                        mdns.destroy();
                        console.log("mDNS scan finished. Found:", Object.keys(devices).length, "devices");
                        resolve(devices);
                    }, 2500);
                } catch (e) {
                    console.error("mDNS Error:", e.message);
                    resolve({});
                }
            });
        };

        // Custom ARP scan function
        const scanNetwork = () => new Promise((resolve) => {
            console.log("Running arp -a...");
            exec('arp -a', (error, stdout, stderr) => {
                if (error) {
                    console.error("Error executing arp -a:", error);
                    return resolve([]);
                }

                console.log("RAW ARP OUTPUT START");
                console.log(stdout);
                console.log("RAW ARP OUTPUT END");

                const lines = stdout.split('\n');
                const devices = [];

                lines.forEach(line => {
                    // Improved Regex: Handle potential leading spaces, varying whitespace, and different MAC separators
                    const match = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([a-fA-F0-9]{2}[:-][a-fA-F0-9]{2}[:-][a-fA-F0-9]{2}[:-][a-fA-F0-9]{2}[:-][a-fA-F0-9]{2}[:-][a-fA-F0-9]{2})/);

                    if (match) {
                        const ip = match[1];
                        const mac = match[2].replace(/-/g, ':').toUpperCase();

                        if (!ip.endsWith('.255') && !ip.startsWith('224.') && !ip.startsWith('239.') && !ip.startsWith('255.')) {
                            if (ip.startsWith(subnetBase)) {
                                devices.push({
                                    ip,
                                    mac,
                                    name: 'Unknown Device',
                                    vendor: 'Unknown'
                                });
                            }
                        }
                    }
                });
                console.log(`Parsed ${devices.length} devices from ARP`);
                resolve(devices);
            });
        });

        // Start ping sweep and mDNS in parallel
        const [_, mdnsDevices] = await Promise.all([
            Promise.race([pingSweep(subnetBase), new Promise(r => setTimeout(r, 7000))]),
            scanMdns()
        ]);

        const devices = await scanNetwork();

        // Fallback to local-devices if needed
        if (devices.length === 0) {
            console.log("ARP returned 0 devices. Trying local-devices lib...");
            try {
                const find = require('local-devices');
                const libDevices = await find();
                console.log("local-devices found:", libDevices);
                devices.push(...libDevices);
            } catch (e) {
                console.error("local-devices lib failed:", e.message);
            }
        }

        // Deduplicate
        const uniqueDevices = Array.from(new Map(devices.map(item => [item.ip, item])).values());


        // Helper: Resolve Hostname (Reverse DNS + NetBIOS)
        const resolveHostname = (ip) => {
            const dns = require('dns').promises;
            return new Promise(async (resolve) => {
                let resolvedName = null;

                // 1. Try Standard DNS Reverse Lookup
                try {
                    const hostnames = await Promise.race([
                        dns.reverse(ip),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500))
                    ]);
                    if (hostnames && hostnames.length > 0) {
                        resolvedName = hostnames[0];
                    }
                } catch (err) {
                    // Ignore DNS error
                }

                if (resolvedName) return resolve(resolvedName);

                // 2. Try 'ping -a' (Windows/Linux)
                try {
                    const isWin = process.platform === 'win32';
                    const cmd = isWin ? `ping -a ${ip} -n 1` : `getent hosts ${ip}`;

                    if (isWin) {
                        const stdout = await new Promise((r) => exec(cmd, { timeout: 2000 }, (err, out) => r(out || '')));
                        const match = stdout.match(/Pinging\s+([^\s]+)\s+\[/);
                        if (match && match[1] !== ip) {
                            resolvedName = match[1];
                        }
                    }
                } catch (e) { }

                if (resolvedName) return resolve(resolvedName);

                // 3. Try NetBIOS (nbtstat -A IP) - Windows Only
                try {
                    if (process.platform === 'win32') {
                        const stdout = await new Promise((r) => exec(`nbtstat -A ${ip}`, { timeout: 2000 }, (err, out) => r(out || '')));
                        const lines = stdout.split('\n');
                        for (const line of lines) {
                            if (line.includes('<00>') && line.includes('UNIQUE')) {
                                const parts = line.trim().split(/\s+/);
                                if (parts.length > 0) {
                                    resolvedName = parts[0];
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) { }

                resolve(resolvedName);
            });
        };


        // Resolve Vendors and Hostnames (Async, parallel)
        const enrichedDevices = await Promise.all(uniqueDevices.map(async device => {
            let vendor = device.vendor;
            let hostname = null;



            // Parallel lookup for Vendor and Hostname
            const [vendorResult, hostnameResult] = await Promise.all([
                Promise.resolve(getVendorLocal(device.mac)),
                resolveHostname(device.ip)
            ]);



            vendor = vendorResult;
            hostname = hostnameResult;
            let mdnsName = mdnsDevices[device.ip];

            if (mdnsName) {

                // Clean up mDNS name (remove .local)
                if (mdnsName.endsWith('.local')) {
                    mdnsName = mdnsName.replace('.local', '');
                }
            }

            let displayName = device.name;
            if (displayName === 'Unknown Device') {
                if (mdnsName) {
                    displayName = mdnsName;
                } else if (hostname) {
                    displayName = hostname;
                } else {
                    displayName = `Device (${device.ip})`;
                }
            }

            return {
                ...device,
                name: displayName,
                hostname: hostname,
                mdnsName: mdnsName,
                vendor: vendor,
                isSuspicious: false,
                ports: []
            };
        }));

        console.log(`Found ${enrichedDevices.length} devices.`);
        res.json(enrichedDevices);

    } catch (err) {
        console.error("WiFi Scan Error:", err);
        res.status(500).json({ error: "Failed to scan network." });
    }
}

runScan();
