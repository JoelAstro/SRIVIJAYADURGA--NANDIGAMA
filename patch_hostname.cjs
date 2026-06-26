const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add API_URL definition
const apiUrlDef = `
  const syncChannel = React.useMemo(() => new BroadcastChannel('svd_restaurant_sync'), []);

  // Determine API URL based on environment (Vite dev port vs unified production)
  const isDev = window.location.port === '5173' || window.location.port === '5174';
  const API_URL = isDev ? \`http://\${window.location.hostname}:3000\` : '';
`;

content = content.replace(`  const syncChannel = React.useMemo(() => new BroadcastChannel('svd_restaurant_sync'), []);`, apiUrlDef);

// 2. Replace io() initialization
content = content.replace(
  `socketRef.current = io(\`http://\${window.location.hostname}:3000\`, {`,
  `socketRef.current = io(isDev ? \`http://\${window.location.hostname}:3000\` : undefined, {`
);

// 3. Replace all fetches
content = content.replaceAll(
  `http://\${window.location.hostname}:3000/api/`,
  `\${API_URL}/api/`
);

fs.writeFileSync(file, content);
console.log('Hostname patched successfully!');
