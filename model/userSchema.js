const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { Address } = require('./addressSchema');


const userSchema =  schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    phone:{
       type: String,
    //    required: true
    },
    password:{
        type: String,
        required: true
    },
    
    status: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        
        
    }
    
})


module.exports.User = mongoose.model("User", userSchema);

