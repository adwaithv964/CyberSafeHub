const fs = require('fs');
const http = require('http');

http.get('http://localhost:3001/api/admin/dashboard', (res) => {
    fs.writeFileSync('result.txt', `dashboard: ${res.statusCode}`);
}).on('error', (e) => {
    fs.writeFileSync('result.txt', `error: ${e.message}`);
});
