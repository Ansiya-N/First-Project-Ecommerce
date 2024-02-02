const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Reference the User model
    required: true,
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
  totalAmount: {
    type: Number,
    required: true,
  },
  totalPrice: {
 type: Number
  },
  address:  {
    address: String,
    streetAddress:  String,
    apartment:  String,
    city:  String,
    postcode:  Number,
    phone:  Number,
    email: String,
  },


  paymentMethod: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  canceled: {
    type: Boolean,
    default: false
  },
  returned:{
    type:Boolean,
    default:false
  },
  returnApprovel:{
   type:Boolean,
   default: false
  },
  
  dateOrdered:{
    type: Date,
    default: Date.now,
    validate: {
      validator: (value) => moment(value).isValid(),
      message: 'Invalid date for dateOrdered field',
    },
  }
});
orderSchema.virtual('formattedDateOrdered').get(function () {
  return moment(this.dateOrdered).format('DD-MM-YYYY HH:mm');
});
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;