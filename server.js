const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Simple custom .env parser
const dotenvPath = path.join(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
    const envFileContent = fs.readFileSync(dotenvPath, 'utf8');
    envFileContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
        }
    });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Admin auth check middleware
function checkAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [username, password, timestamp] = decoded.split(':');
        const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
        const expectedPassword = process.env.ADMIN_PASSWORD || 'admin';
        
        if (username === expectedUsername && password === expectedPassword) {
            const tokenTime = parseInt(timestamp, 10);
            // Expire token after 24 hours
            if (isNaN(tokenTime) || Date.now() - tokenTime > 24 * 60 * 60 * 1000) {
                return res.status(401).json({ error: 'Unauthorized: Token expired' });
            }
            return next();
        }
    } catch (e) {
        // Fall through to unauthorized
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
}

// Admin login route
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin';
    
    if (username === expectedUsername && password === expectedPassword) {
        const token = Buffer.from(`${username}:${password}:${Date.now()}`).toString('base64');
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
});

// Endpoint to get portfolio data
app.get('/api/portfolio-data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ error: 'Failed to read data file' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to save portfolio data - Protected by checkAuth
app.post('/api/portfolio-data', checkAuth, (req, res) => {
    const newData = req.body;
    
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing data file:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ message: 'Data saved successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
