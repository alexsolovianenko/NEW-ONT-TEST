const express = require('express');
const fileRoutes = require('../dThird-Step/Backend/server'); // Adjust the path as needed

const app = express();
const port = 8000;

// Use the file routes
app.use('/api', fileRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Main server is running on http://localhost:${port}`);
});
