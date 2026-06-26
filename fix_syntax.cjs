const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Fix the syntax error: `http://${window.location.hostname}:3000' -> `http://${window.location.hostname}:3000`
content = content.replace(/`http:\/\/\$\{window\.location\.hostname\}:3000'/g, "`http://${window.location.hostname}:3000`");

fs.writeFileSync(filePath, content);
console.log('Fixed syntax error in AppContext.tsx');
