const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load environment variables from .env at the project root
require('dotenv').config();

// Fetch the API URL from environment variables
const API_URL = process.env.API_URL;

if (!API_URL) {
    console.error('Error: API_URL is not defined in the .env file.');
    process.exit(1);
}

// Function to sanitize and validate input data
// This is to tackle a high security vulnerability risk of xlsx library, that has not been updated or maintained in few years
// For more information see documentations: https://nvd.nist.gov/vuln/detail/CVE-2023-30533 & https://nvd.nist.gov/vuln/detail/CVE-2024-22363
function sanitizeData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Data is not an array.');
    }

    return data.map((item) => {
        if (typeof item !== 'object' || !item.name || typeof item.name !== 'string') {
            throw new Error('Invalid data format.');
        }

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

// Function to fetch data from the API
async function fetchData() {
    const rootPath = path.resolve(__dirname);
    const usersFilePath = path.join(rootPath, 'users.json');

    // Check if 'users.json' exists
    if (fs.existsSync(usersFilePath)) {
        console.log('Found existing users.json file. Reading data...');
        const fileData = fs.readFileSync(usersFilePath, 'utf-8');
        if (fileData) {
            const parsedData = JSON.parse(fileData);
            return sanitizeData(parsedData);
        }
    }

    try {
        console.log('Fetching data from API...');
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const sanitizedData = sanitizeData(data);

        // Write fetched data to 'users.json'
        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
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
    const rootPath = path.resolve(__dirname);
    const dataFolderPath = path.join(rootPath, 'data');
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
        console.log(`Created 'data' folder at: ${dataFolderPath}`);
    }
    return dataFolderPath;
}

// Determine the output file path
function determineOutputFilePath(dataFolderPath) {
    const existingFile = fs.readdirSync(dataFolderPath).find((file) => file.startsWith('employees_') && file.endsWith('.xlsx'));
    if (existingFile) {
        return path.join(dataFolderPath, existingFile);
    } else {
        const timestamp = getCurrentTimestamp();
        return path.join(dataFolderPath, `employees_${timestamp}.xlsx`);
    }
}

// Function to sort data by lastname and firstname in ascending order
function sortData(data) {
    return data.sort((a, b) => {
        if (a.lastname.toLowerCase() === b.lastname.toLowerCase()) {
            return a.firstname.toLowerCase().localeCompare(b.firstname.toLowerCase());
        }
        return a.lastname.toLowerCase().localeCompare(b.lastname.toLowerCase());
    });
}

// Function to write data to an Excel file
function writeDataToExcel(filePath, data) {
    const rootPath = path.resolve(__dirname, '..');
    const usersFilePath = path.join(rootPath, 'users.json');

    try {
        // Check if 'users.json' exists and is not empty
        if (fs.existsSync(usersFilePath)) {
            const fileData = fs.readFileSync(usersFilePath, 'utf-8');
            if (fileData) {
                console.log('Using data from users.json to write to Excel...');
                const parsedData = sanitizeData(JSON.parse(fileData));
                const sortedData = sortData(parsedData);

                // Write sorted data from users.json to Excel
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(sortedData);
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Parsed Data');
                XLSX.writeFile(workbook, filePath);

                console.log(`Parsed and sorted data from users.json written to Excel file: ${filePath}`);
                return;
            }
        }

        // Default behavior: write the provided data to Excel
        console.log('Writing provided data to Excel...');
        const sortedData = sortData(data);
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
        const data = await fetchData();

        // Ensure 'data' folder exists at the project root
        const dataFolderPath = ensureDataFolderExists();

        // Determine the file path and write the Excel file
        const EXCEL_FILE_PATH = determineOutputFilePath(dataFolderPath);
        writeDataToExcel(EXCEL_FILE_PATH, data);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();