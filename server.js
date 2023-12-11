const mongoose = require('mongoose');
require('dotenv').config();
const atlasConnectionUri = process.env.MONGO;

mongoose.connect(atlasConnectionUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(error => {
        console.error("Error connecting to MongoDB:", error);
    });
