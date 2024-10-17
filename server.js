const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS for templating
app.set('view engine', 'ejs');

// Serve static files (like CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Load the ships data from the JSON file
function loadShips() {
    const data = fs.readFileSync('ships.json', 'utf-8');
    return JSON.parse(data);
}

// Load the quantum drive purchase locations from the JSON file
function loadQuantumDrives() {
    const data = fs.readFileSync('quantum_drives.json', 'utf-8');
    return JSON.parse(data);
}

// Save the ships data to the JSON file
function saveShips(data) {
    fs.writeFileSync('ships.json', JSON.stringify(data, null, 2));
}

// Route to display the ships and quantum drive locations
app.get('/', (req, res) => {
    const ships = loadShips();
    const quantumDrives = loadQuantumDrives();  // Load the quantum drives
    res.render('index', { ships: ships, quantumDrives: quantumDrives });
});

// Route to update quantum_installed via POST request
app.post('/update-quantum', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.body.id));
    if (ship) {
        ship.quantum_installed = ship.quantum_installed ? 0 : 1; // Toggle the status
        saveShips(ships);
        res.redirect('/');
    } else {
        res.status(404).send('Ship not found');
    }
});

// Route to update paint status via POST request
app.post('/update-paint', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.body.id));
    if (ship) {
        ship.paint = ship.paint ? 0 : 1; // Toggle the status
        saveShips(ships);
        res.redirect('/');
    } else {
        res.status(404).send('Ship not found');
    }
});

// Route to update owned status via POST request
app.post('/update-owned', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.body.id));
    if (ship) {
        ship.owned = ship.owned ? 0 : 1; // Toggle the status
        saveShips(ships);
        res.redirect('/');
    } else {
        res.status(404).send('Ship not found');
    }
});

// Route to update pledge status via POST request
app.post('/update-pledge', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.body.id));
    if (ship) {
        ship.pledge = ship.pledge === 3 ? 1 : ship.pledge + 1; // Cycle between 1 (aUEC), 2 (Pledge), 3 (Loaner)
        saveShips(ships);
        res.redirect('/');
    } else {
        res.status(404).send('Ship not found');
    }
});

// Route to update insurance status via POST request
app.post('/update-insurance', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.body.id));
    if (ship) {
        ship.insurance = ship.insurance === 3 ? 1 : ship.insurance + 1; // Cycle between 1 (n/a), 2 (LTI), 3 (10 year)
        saveShips(ships);
        res.redirect('/');
    } else {
        res.status(404).send('Ship not found');
    }
});

// Route to handle the addition of a new ship
app.post('/add-ship', (req, res) => {
    const ships = loadShips();
    const newShip = {
        id: ships.length ? ships[ships.length - 1].id + 1 : 1, // Increment the ID
        name: req.body.name,
        focus: req.body.focus,
        quantum: req.body.quantum,
        guns: req.body.guns,
        paint: 0, // Default values for new ships
        owned: 0,
        pledge: 1,
        insurance: 1
    };
    ships.push(newShip);
    saveShips(ships);
    res.redirect('/');
});

// Route to delete a ship
app.post('/delete-ship', (req, res) => {
    let ships = loadShips();
    ships = ships.filter(s => s.id !== parseInt(req.body.id)); // Remove the ship by ID
    saveShips(ships);
    res.redirect('/');
});

// Route to render the edit page
app.get('/edit-ship', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.query.id));
    if (ship) {
        res.render('edit', { ship: ship });
    } else {
        res.status(404).send('Ship not found');
    }
});

// Route to handle the editing of a ship
app.post('/edit-ship', (req, res) => {
    const ships = loadShips();
    const ship = ships.find(s => s.id === parseInt(req.body.id));
    if (ship) {
        ship.name = req.body.name;
        ship.focus = req.body.focus;
        ship.quantum = req.body.quantum;
        ship.guns = req.body.guns;
        saveShips(ships);
        res.redirect('/');
    } else {
        res.status(404).send('Ship not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
