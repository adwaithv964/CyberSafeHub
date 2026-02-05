const { exec } = require('child_process');

const targetIP = '192.168.1.6'; // Adjust if needed, this seems to be the user's IP based on logs

async function debugResolution() {
    console.log(`Debug Resolution for IP: ${targetIP}`);

    // Test 1: ping -a
    console.log("\n--- TEST 1: ping -a ---");
    exec(`ping -a ${targetIP} -n 1`, (err, stdout, stderr) => {
        if (err) console.log("Exec Error:", err.message);
        console.log("RAW STDOUT START");
        console.log(JSON.stringify(stdout)); // JSON stringify to see hidden chars/newlines
        console.log("RAW STDOUT END");

        // Test Regex
        const match = stdout.match(/Pinging\s+([^\s]+)\s+\[/);
        console.log("Regex Match Result:", match ? match[1] : "NO MATCH");
    });

    // Test 2: nbtstat -A
    console.log("\n--- TEST 2: nbtstat -A ---");
    exec(`nbtstat -A ${targetIP}`, (err, stdout, stderr) => {
        if (err) console.log("Exec Error:", err.message);
        console.log("RAW STDOUT START");
        console.log(JSON.stringify(stdout));
        console.log("RAW STDOUT END");

        // Test Logic
        let resolvedName = null;
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
        console.log("Logic Parse Result:", resolvedName || "NO MATCH");
    });
}

debugResolution();
