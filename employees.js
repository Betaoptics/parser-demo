const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load environment variables from .env at the project root
require('dotenv').config();

const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const API_URL = process.env.API_URL;


if (!API_URL) {
    console.error('Error: API_URL is not defined in the .env file.');
    process.exit(1);
}

if (!ENV) {
    console.error('Error: ENV is not defined in the .env file.');
    process.exit(1);
}

if (!PORT) {
    console.error('Error: PORT is not defined in the .env file.');
    process.exit(1);
}

// Uncomment lines 30, 33-36 and 79 if you want to test fetch is only called once based on params.
// Initialize an in-memory counter                                                              
// let counter = 0;

// Function to update and log the fetch counter
// function updateFetchCount() {
//     counter += 1;
//     console.log(`Fetch count: ${counter}`);
// }

// Function to sanitize and validate input data
function sanitizeData(user) {
    if (!Array.isArray(user)) {
        throw new Error('Data is not an array.');
    }

    return user.map((item) => {
        if (typeof item !== 'object' || !item.name || typeof item.name !== 'string') {
            throw new Error('Invalid data format.');
        }

        const [firstname, lastname] = item.name.split(' ');
        return {
            firstname: firstname || '',
            lastname: lastname || '',
            email: typeof item.email === 'string' ? item.email : '',
            street: typeof item.address?.street === 'string' ? item.address.street : '',
            city: typeof item.address?.city === 'string' ? item.address.city : '',
            zipcode: typeof item.address?.zipcode === 'string' ? item.address.zipcode : '',
            phone: typeof item.phone === 'string' ? item.phone : '',
            website: typeof item.website === 'string' ? item.website : '',
        };
    });
}

// Function to fetch data from the API
async function fetchData() {
    const rootPath = path.resolve(__dirname);
    const usersFilePath = path.join(rootPath, 'users.json');

    if (fs.existsSync(usersFilePath)) {
        console.log('Found existing users.json file. Reading data...');
        const fileData = fs.readFileSync(usersFilePath, 'utf-8');
        if (fileData) {
            return sanitizeData(JSON.parse(fileData));
        }
    }

    try {
        console.log('Fetching data from API...');
        // Uncomment below and lines 30 & 33-36 to test that fetch is only called once.
        // updateFetchCount(); // Increment counter when fetch is made

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const user = await response.json();
        const sanitizedData = sanitizeData(user);

        fs.writeFileSync(usersFilePath, JSON.stringify(user, null, 2));
        console.log(`Fetched data written to: ${usersFilePath}`);

        return sanitizedData;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
}

// Function to get the current timestamp in the format yyyymmddhhMMss
function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Ensure 'data' folder exists at the root of the project
function ensureDataFolderExists() {
    const dataFolderPath = path.join(__dirname, 'data');
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
        console.log(`Created 'data' folder at: ${dataFolderPath}`);
    }
    return dataFolderPath;
}

// Determine the output file path
function determineOutputFilePath(dataFolderPath) {
    const timestamp = getCurrentTimestamp();
    return path.join(dataFolderPath, `employees_${timestamp}.xlsx`);
}

// Function to sort data by lastname and firstname in ascending order
function sortData(user) {
    return user.sort((a, b) => {
        if (a.lastname.toLowerCase() === b.lastname.toLowerCase()) {
            return a.firstname.toLowerCase().localeCompare(b.firstname.toLowerCase());
        }
        return a.lastname.toLowerCase().localeCompare(b.lastname.toLowerCase());
    });
}

// Function to write data to an Excel file
function writeDataToExcel(filePath, user) {
    try {
        console.log('Writing provided data to Excel...');
        const sortedData = sortData(user);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(sortedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Parsed Data');
        XLSX.writeFile(workbook, filePath);
        console.log(`Parsed and sorted data written to Excel file: ${filePath}`);
    } catch (error) {
        console.error('Error writing data to Excel file:', error);
    }
}

// Main function
async function main() {
    try {
        const user = await fetchData();

        // Ensure 'data' folder exists at the project root
        const dataFolderPath = ensureDataFolderExists();

        // Determine the file path and write the Excel file
        const EXCEL_FILE_PATH = determineOutputFilePath(dataFolderPath);
        writeDataToExcel(EXCEL_FILE_PATH, user);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();