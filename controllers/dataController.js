const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load environment variables from .env at the project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Fetch the API URL from .env
const API_URL = process.env.API_URL;

if (!API_URL) {
    console.error('Error: API_URL is not defined in the .env file.');
    process.exit(1);
}

// Function to sanitize and validate input data
function sanitizeData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Data is not an array.');
    }

    return data.map((item) => {
        // Validate and sanitize each item
        if (typeof item !== 'object' || !item.name || typeof item.name !== 'string') {
            throw new Error('Invalid data format.');
        }

        // Split name into firstname and lastname
        const [firstname, lastname] = item.name.split(' ');

        const sanitized = {
            firstname: firstname || '',
            lastname: lastname || '',
            email: typeof item.email === 'string' ? item.email : '',
            street: typeof item.address?.street === 'string' ? item.address.street : '',
            city: typeof item.address?.city === 'string' ? item.address.city : '',
            zipcode: typeof item.address?.zipcode === 'string' ? item.address.zipcode : '',
            phone: typeof item.phone === 'string' ? item.phone : '',
            website: typeof item.website === 'string' ? item.website : '',
        };

        return sanitized;
    });
}

// Function to fetch data from the API using the Fetch API
async function fetchData() {
    try {
        const response = await fetch(API_URL); // Use the API_URL from the environment variable
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return sanitizeData(data); // Sanitize data before returning
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
}

// Function to get the current timestamp in the format yyyymmddhhMMss
function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Ensure 'data' folder exists at the root of the project
function ensureDataFolderExists() {
    const rootPath = path.resolve(__dirname, '..'); // Navigate to the project root
    const dataFolderPath = path.join(rootPath, 'data'); // By default the data is saved into 'data' folder that is created dynamically. You can manipulate these params to change the save location for the data.
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
        console.log(`Created 'data' folder at: ${dataFolderPath}`);
    }
    return dataFolderPath;
}

// Determine the output file path
function determineOutputFilePath(dataFolderPath) {
    // Check for existing files starting with 'employees_'
    const existingFile = fs.readdirSync(dataFolderPath).find((file) => file.startsWith('employees_') && file.endsWith('.xlsx'));

    // If an existing file is found, overwrite it; otherwise, create a new file
    if (existingFile) {
        return path.join(dataFolderPath, existingFile);
    } else {
        const timestamp = getCurrentTimestamp();
        return path.join(dataFolderPath, `employees_${timestamp}.xlsx`);
    }
}

// Function to write parsed data to an Excel file
function writeDataToExcel(filePath, data) {
    try {
        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Parsed Data');

        // Write the workbook to a file
        XLSX.writeFile(workbook, filePath);

        console.log(`Parsed data written to Excel file: ${filePath}`);
    } catch (error) {
        console.error('Error writing data to Excel file:', error);
    }
}

function sortUsersByNameParams(data) {
    const sortedusers = data.sort((a, b) => a.firstname.localeCompare(b.firstname)); // Sort by firstname
    return sortedusers;
}

// Main function
async function main() {
    console.log('Fetching data from API...');
    const data = await fetchData(); // Fetch and sanitize data
    const sortUsersByName = sortUsersByNameParams(data);

    // Ensure 'data' folder exists at the project root
    const dataFolderPath = ensureDataFolderExists();

    // Determine the file path and write the Excel file
    const EXCEL_FILE_PATH = determineOutputFilePath(dataFolderPath);
    writeDataToExcel(EXCEL_FILE_PATH, sortUsersByName);
}

main();