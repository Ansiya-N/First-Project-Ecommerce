const { mongoose } = require('mongoose');
const schema = mongoose.Schema


module.exports.Otp = mongoose.model('Otp', schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 30 }
    },
    /*expiresAt: {
        type: Date
    }*/
}, { timestamps: true}));