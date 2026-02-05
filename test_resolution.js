const { exec } = require('child_process');
const ip = '192.168.1.6'; // The user's machine
const gateway = '192.168.1.1';

console.log("Testing resolution for IP:", ip);

// Test NBTSTAT
exec(`nbtstat -A ${ip}`, (err, stdout, stderr) => {
    console.log("\n--- NBTSTAT Output ---");
    if (err) console.log("Error:", err.message);
    console.log(stdout);
    console.log("--- End NBTSTAT ---\n");
});

// Test PING -a
exec(`ping -a ${ip} -n 1`, (err, stdout, stderr) => {
    console.log("\n--- PING Output ---");
    if (err) console.log("Error:", err.message);
    console.log(stdout);
    console.log("--- End PING ---\n");
});

// Test NSLOOKUP
exec(`nslookup ${ip}`, (err, stdout, stderr) => {
    console.log("\n--- NSLOOKUP Output ---");
    if (err) console.log("Error:", err.message);
    console.log(stdout);
    console.log("--- End NSLOOKUP ---\n");
});
