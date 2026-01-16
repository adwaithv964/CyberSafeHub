const fs = require('fs');
const logFile = 'debug_log.txt';

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

log("Starting diagnostic...");
try {
    require('oui');
    log("oui: LOADED OK");
} catch (e) {
    log(`oui: FAILED - ${e.message}`);
}

try {
    require('multicast-dns');
    log("multicast-dns: LOADED OK");
} catch (e) {
    log(`multicast-dns: FAILED - ${e.message}`);
}
log("Done.");
