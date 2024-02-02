const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    userId: {
       type: String
    },
    addresses: [
        {
            address: {
                type: String,
                required: true
            },
            streetAddress: {
                type: String,
                required: true
            },
            apartment: {
                type: String
            },
            city: {
                type: String,
                required: true
            },
            postcode: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            }
        }
    ]
});

module.exports.Address = mongoose.model('Address', addressSchema);
