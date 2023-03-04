const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin:admin@cluster0.x1ucn0n.mongodb.net/?retryWrites=true&w=majority")

const db = mongoose.connection;

db.on('connected' , ()=>{
    console.log('Mongo DB Connection Successfull');
})

db.on('error' , (err)=>{
    console.log('Mongo DB Connection Failed');
})

module.exports = db;