const mongoose = require('mongoose');
const schema = mongoose.Schema;


const adminSchema = schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports.Admin = mongoose.model("Admin", adminSchema);
