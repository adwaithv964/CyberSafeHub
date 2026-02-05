const mDNS = require('multicast-dns')();

console.log('Searching for mDNS devices...');

mDNS.on('response', (packet) => {
    // console.log('Response:', JSON.stringify(packet.answers));
    packet.answers.forEach((answer) => {
        if (answer.type === 'A') {
            console.log(`[mDNS A Record] IP: ${answer.data}, Name: ${answer.name}`);
        }
        if (answer.type === 'SRV') {
            console.log(`[mDNS SRV Record] Name: ${answer.name}`);
        }
    });
});

mDNS.query({
    questions: [{
        name: '_services._dns-sd._udp.local',
        type: 'PTR'
    }]
});

// Also just query specifically for standard browsing
mDNS.query({
    questions: [{
        name: '_http._tcp.local',
        type: 'PTR'
    }]
});
