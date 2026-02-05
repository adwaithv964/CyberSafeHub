const dgram = require('dgram');

const SSDP_ADDRESS = '239.255.255.250';
const SSDP_PORT = 1900;
const SEARCH_TARGET = 'ssdp:all';

const message = Buffer.from(
    'M-SEARCH * HTTP/1.1\r\n' +
    'HOST: ' + SSDP_ADDRESS + ':' + SSDP_PORT + '\r\n' +
    'MAN: "ssdp:discover"\r\n' +
    'MX: 1\r\n' +
    'ST: ' + SEARCH_TARGET + '\r\n' +
    '\r\n'
);

const client = dgram.createSocket('udp4');

client.on('message', (msg, rinfo) => {
    // console.log(`[SSDP] Response from ${rinfo.address}:`);
    const response = msg.toString();
    // Extract SERVER or FN (Friendly Name) or USN

    // Look for LOCATION (URL to xml)
    const locationMatch = response.match(/LOCATION: (.*)\r\n/i);
    // Look for SERVER line
    const serverMatch = response.match(/SERVER: (.*)\r\n/i);

    console.log(`[SSDP HIT] IP: ${rinfo.address}`);
    if (serverMatch) console.log(`  - Server: ${serverMatch[1]}`);
    if (locationMatch) console.log(`  - Location: ${locationMatch[1]}`);
});

client.bind(() => {
    client.setBroadcast(true);
    client.addMembership(SSDP_ADDRESS);
    console.log('[SSDP] Sending M-SEARCH...');
    client.send(message, 0, message.length, SSDP_PORT, SSDP_ADDRESS);
});

// Close after 5 seconds
setTimeout(() => {
    console.log('[SSDP] Timeout. Closing.');
    client.close();
}, 5000);
