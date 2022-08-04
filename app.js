const express = require("express");
const mongoose = require('mongoose')
const router = require('./routes')
require('dotenv').config()

// mongodb uri
const uri = process.env.MONGO_URI;

// Port
let port = process.env.PORT || 8080

// init express
const app = express();

// accept json and body data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes init
app.use('/', router)

// connect mongo db
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
},()=>console.log('connected to db!'))

// start server
app.listen(port, function(){
  console.log(`Server started on port ${port}`);
});
