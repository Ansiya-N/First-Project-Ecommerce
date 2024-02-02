const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const productSchema = Schema({
    name:{
        type: String,
        required: true
    },
    category:{
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true,
    },
    price:{
         type: Number,
         required: true
    },
    description:{
         type: String,
         required: true
    },
    image1:{
        type: String,
        required: true
    },
    image2: {
        type: String
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    stock: {
        type: Number,
        required: true
    },
   

});
productSchema.virtual('formattedDateCreated').get(function () {
    return moment(this.dateCreated).format('DD-MM-YYYY HH:mm');
});

module.exports.Product = mongoose.model('Product', productSchema);