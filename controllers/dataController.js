const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config();

// Example data (replace with your actual dataset or source)
const data = [
    {
        id: 1,
        name: "Leanne Graham",
        username: "Bret",
        email: "Sincere@april.biz",
        address: {
            street: "Kulas Light",
            suite: "Apt. 556",
            city: "Gwenborough",
            zipcode: "92998-3874",
            geo: {
                lat: "-37.3159",
                lng: "81.1496",
            },
        },
        phone: "1-770-736-8031 x56442",
        website: "hildegard.org",
        company: {
            name: "Romaguera-Crona",
            catchPhrase: "Multi-layered client-server neural-net",
            bs: "harness real-time e-markets",
        },
    },
    // Add the remaining objects from your dataset here
];


let firstname = data[0].name.split(' ')[0];
console.log(firstname, "\n");
let lastname = data[0].name.split(' ')[1];
console.log(lastname, "\n");

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

// Get the file path from command-line arguments or default to the current directory
const outputPath = process.argv[2] || __dirname; // Default to current directory if no argument is passed
const timestamp = getCurrentTimestamp();
const EXCEL_FILE_PATH = path.join(outputPath, `employees_${timestamp}.xlsx`);

// Function to parse the required fields and split names
function parseData(data) {
    return data
        .map((item) => {
            const [firstname, lastname] = item.name.split(' '); // Split the name into firstname and lastname
            return {
                firstname,
                lastname,
                email: item.email,
                street: item.address.street,
                city: item.address.city,
                zipcode: item.address.zipcode,
                phone: item.phone,
                website: item.website,
            };
        })
        .sort((a, b) => a.firstname.localeCompare(b.firstname)); // Sort by firstname
}

// Function to write parsed data to an Excel file
function writeDataToExcel(filePath, data) {
    try {
        console.log("data before being written into .csv: ", data);
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

// Main function
async function main() {
    try {
        const parsedData = parseData(data);
        writeDataToExcel(EXCEL_FILE_PATH, parsedData);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();