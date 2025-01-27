//const mongoose = require('mongoose');
const net = require('node:net');

const connectDB = async () => {
    try {
        // console.log(process.env.DATABASE_URL);
        // await net.connect(`${process.env.DATABASE_URL}`);
        net.connect("https://jsonplaceholder.typicode.com/users");
    } catch (err) {
        console.log(err);
    }
};

module.exports = connectDB;