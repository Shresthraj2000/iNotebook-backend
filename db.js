const mongoose = require('mongoose');
const mongoURL = "mongodb+srv://shresth:shresth123@cluster0.jkhbkly.mongodb.net/test";

const connectToMongo = ()=>{
    mongoose.connect(mongoURL,()=>{
    console.log("Connected Successfully");
})
}
module.exports = connectToMongo;