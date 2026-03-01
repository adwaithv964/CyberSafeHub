const http = require('http');

['/api/admin/verify', '/api/admin/dashboard', '/'].forEach(path => {
    http.get(`http://localhost:3001${path}`, (res) => {
        console.log(`${path}: ${res.statusCode}`);
    }).on('error', (e) => {
        console.error(`${path} error: ${e.message}`);
    });
});
