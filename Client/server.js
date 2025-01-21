// Import the express library
const express = require("express");
const app = express();
const PORT = 5000;

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
