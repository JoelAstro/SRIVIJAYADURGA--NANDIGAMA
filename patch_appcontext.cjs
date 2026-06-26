const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add import
content = content.replace(
  "import React, { createContext, useContext, useState, useEffect } from 'react';",
  "import React, { createContext, useContext, useState, useEffect } from 'react';\nimport { io } from 'socket.io-client';"
);

// 2. Remove localStorage from useState
content = content.replace(
  /const \[orders, setOrders\] = useState<Order\[\]>\(\(\) => \{\s*const stored = localStorage\.getItem\('svd_orders'\);\s*return stored \? JSON\.parse\(stored\) : \[\];\s*\}\);/g,
  "const [orders, setOrders] = useState<Order[]>([]);"
);

// 3. Add Socket hook
const socketHook = `
  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    
    fetch('http://localhost:3000/api/orders')
      .then(res => res.json())
      .then(data => {
        console.log('[Kitchen Fetch Response] Loaded initial orders from backend');
        setOrders(data);
      })
      .catch(err => console.error('Failed to fetch orders:', err));

    socketRef.current.on('new_order', (newOrder: Order) => {
      console.log('[Realtime Events] Received new_order:', newOrder.id);
      setOrders(prev => {
        if (!prev.find(o => o.id === newOrder.id)) return [...prev, newOrder];
        return prev;
      });
    });

    socketRef.current.on('order_updated', (updatedOrder: Order) => {
      console.log('[Realtime Events] Received order_updated:', updatedOrder.id);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    socketRef.current.on('orders_synced', (syncedOrders: Order[]) => {
      setOrders(syncedOrders);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);
`;
content = content.replace(
  "  useEffect(() => {\n    tablesRef.current = tables;\n  }, [tables]);",
  socketHook + "\n  useEffect(() => {\n    tablesRef.current = tables;\n  }, [tables]);"
);

// 4. Remove svd_orders localStorage effect
content = content.replace(
  /  useEffect\(\(\) => \{\s*localStorage\.setItem\('svd_orders', JSON\.stringify\(orders\)\);\s*\}, \[orders\]\);/g,
  ""
);

// 5. Recovery Sync
content = content.replace(
  "localStorage.setItem('svd_orders', JSON.stringify(parsedOrders));",
  "fetch('http://localhost:3000/api/orders/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsedOrders) });"
);

// 6. Timeout Sync
content = content.replace(
  "localStorage.setItem('svd_orders', JSON.stringify(newOrders));",
  "fetch('http://localhost:3000/api/orders/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrders) });"
);

// 7. Remove svd_orders from broadcast channel sync
content = content.replace(
  "        const storedOrders = localStorage.getItem('svd_orders');\n",
  ""
);
content = content.replace(
  "        if (storedOrders) setOrders(JSON.parse(storedOrders));\n",
  ""
);

// 8. placeOrder existing
content = content.replace(
  /          return \{\n            \.\.\.o,\n            items: updatedItems,\n            status: 'PLACED' as const, \/\/ Reset status to PLACED so Kitchen board receives the alert for cooking additional dishes\n            timestamp: Date\.now\(\),\n            specialNotes: specialNotes \|\| o\.specialNotes\n          \};\n        \}\n        return o;\n      \}\);/g,
  `          const updatedOrder = {
            ...o,
            items: updatedItems,
            status: 'PLACED' as const,
            timestamp: Date.now(),
            specialNotes: specialNotes || o.specialNotes
          };
          fetch(\`http://localhost:3000/api/orders/\${updatedOrder.id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedOrder)
          });
          return updatedOrder;
        }
        return o;
      });`
);

// 9. placeOrder new
content = content.replace(
  /      finalOrders = \[\.\.\.orders, newOrder\];\n/g,
  `      fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      finalOrders = [...orders, newOrder];\n`
);

// 10. placeOrder setItem removal
content = content.replace(
  /    localStorage\.setItem\('svd_orders', JSON\.stringify\(finalOrders\)\);\n/g,
  ""
);

// 11. updateOrderStatus
content = content.replace(
  /        return nextOrder;\n      \}\n      return o;\n    \}\);\n\n    localStorage\.setItem\('svd_orders', JSON\.stringify\(nextOrders\)\);/g,
  `        fetch(\`http://localhost:3000/api/orders/\${orderId}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextOrder)
        });
        return nextOrder;
      }
      return o;
    });\n`
);

// 12. settleBillAndReleaseTable
content = content.replace(
  /    const nextOrders = orders\.map\(o => \{\n      if \(o\.id === orderId\) return \{ \.\.\.o, status: 'PAID' as const \};\n      return o;\n    \}\);\n    setOrders\(nextOrders\);\n    localStorage\.setItem\('svd_orders', JSON\.stringify\(nextOrders\)\);/g,
  `    const nextOrders = orders.map(o => {
      if (o.id === orderId) {
        const nextOrder = { ...o, status: 'PAID' as const };
        fetch(\`http://localhost:3000/api/orders/\${orderId}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextOrder)
        });
        return nextOrder;
      }
      return o;
    });
    setOrders(nextOrders);`
);

fs.writeFileSync(filePath, content);
console.log('Successfully patched AppContext.tsx');
