require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

// test connection to MongoDB
// app.get("/message", (req, res) => {
//     res.json({ message: "Hello from server!" });
//   });

// Define a simple route
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js server using dotenv, express, and express-async-errors!');
});

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve book catalog files
app.use('/', require('./routes/root'));
app.use('/data', require('./routes/dataController'));

// An example route that throws an error
app.get('/error', async (req, res) => {
    throw new Error('This is an intentional error for testing.');
});

// If no files are found, return a default view.
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// app.listen(PORT, (req, res, err) => {
//     if (res.status(200)) {
//         console.log(`Server running on port ${PORT}`);
//     }

//     if (res.status(`${50}*`)) {
//         console.log(err);
//         logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'serverErrorLog.log');
//     }
// })