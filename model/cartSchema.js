const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const cartSchema = new Schema({
    userId: {
        type: String
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product', 
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        subtotal: {
            type: Number,
            
        }
    }],
    totalprice: {
        type: Number,
        // required: true,
    },totalQuantity: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
    
});
cartSchema.virtual('formattedCreatedAt').get(function () {
    return moment(this.createdAt).format('DD-MM-YYYY HH:mm');
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
