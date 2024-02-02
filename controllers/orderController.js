const Order= require('../model/orderSchema'); 
const User = require('../model/userSchema');
const Cart = require('../model/cartSchema');
const { Address } = require('../model/addressSchema');
const { Category } = require("../model/categorySchema");
const { Wallet } = require("../model/walletSchema");
const { Transaction } = require("../model/walletTransactionSchema");
const Razorpay = require('razorpay');
var easyinvoice = require('easyinvoice');

const dotenv = require('dotenv');

dotenv.config();

const keyId = process.env.KEY_ID;
const secretRazo = process.env.SECRET_RAZO;

var instance = new Razorpay({
  key_id: keyId,
  key_secret: secretRazo,
});

const mongoose=require('mongoose')

module.exports.checkoutAjaxAddress = async (req, res) => {
  try {
   const addressId = req.body.addressId;
   const paymentMethod = req.body.paymentMethod;
   const orderTotal = Number(req.body.orderTotal);
   const orderTotalPrice = Number(req.body.orderTotalPrice);
   const id = req.session.user_id;


console.log(orderTotal)

   const cart = await Cart.findOne({userId: id});
   const address = await Address.findOne({userId: id});

   const addressDb = address.addresses[addressId];

   const newOrder = new Order({
     
     userId: id,
     items: cart.items,
     totalAmount: orderTotal,
     totalPrice: orderTotalPrice,
     address: {
       address: addressDb.address,
       streetAddress: addressDb.streetAddress,
       apartment: addressDb.apartment,
       city: addressDb.city,
       postcode: addressDb.postcode,
       phone: addressDb.phone,
       email: addressDb.email
     },
     paymentMethod: paymentMethod,
   })
   
   const saved = await newOrder.save();
const orderId = newOrder._id;
   if(saved){
     res.send(orderId);
   }else{
     console.log('error saving the order');
   }
   
   
   console.log(addressId)
  } catch (error) {
   console.log(error.message)
  }
    };

  
   
   module.exports.PaymentCheckout = async (req, res) => {
     try {
      
       const orderId = req.body.orderId;
       const total = req.body.orderTotal;
      
    
   
       const newOrder = await Order.findById(orderId);
       newOrder.totalAmount = total;
       await newOrder.save();
   
       if (!newOrder) {
         console.log('Order not found');
         return res.status(404).send('Order not found');
       }
   
       const options = {
         amount: newOrder.totalAmount * 100, 
         currency: 'INR',
         receipt: 'razorUser@gmail.com',
       };
   
       instance.orders.create(options, function(err, order) {
 
         console.log(order);
         res.send(order)
   
   });
     } catch (error) {
       console.log('Try catch error in PaymentCheckout:', error.message);
       res.status(500).send('Internal Server Error');
     }
   };

     module.exports.placeorder = async(req,res)=>{
      try {
          
        const order = await Order.findById(req.params.orderid).populate('items.product');
        console.log(order);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        const id = req.session.user_id

        const deleteCart = await Cart.deleteOne({userId: id});
        if(deleteCart){
          console.log("cart deleted ")
        }else{
          console.log("cart deletediton failed ")

        }

        res.render('user/success', { order });
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
      }
     };
     
    
module.exports.vieworderdetails = async (req, res) => {
  try {
    const category = await Category.find({ active: true });
    const userId = req.session.user_id;
    const ITEMS_PER_PAGE = 1; // Set the number of items to display per page

    // Get the page number from the request query parameter, default to 1 if not provided
    const page = parseInt(req.query.page) || 4;

    // Calculate the number of items to skip based on the page number
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Fetch orders for the specified page with pagination
    const orders = await Order.find()
      .populate('items.product')
      .sort({ _id: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

      const totalOrders = await Order.countDocuments();

    // Calculate the total number of pages based on the total number of orders and items per page
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

    res.render('user/vieworders', {totalPages, orders, user: userId, category, currentPage: page, totalPages: Math.ceil(orders.length / ITEMS_PER_PAGE) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

     

     module.exports.SingleOrderDetail = async(req,res)=>{
      try {
        const orderId = req.params.id;
        const orderDb = await Order.findOne({_id: orderId})
        const userId = req.session.user_id;
        const category = await Category.find({ active: true });
        const order= await Order.findOne({_id: orderId}).populate('items.product');

        res.render("user/viewOrderDetail", {order: order,category:category,user:userId})
      } catch (error) {
        console.log(error.message);
      }
     }


      // Adjust as needed

module.exports. orderManagement= async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 5
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Fetch orders with pagination
    const orders = await Order.find()
      .sort({ _id: -1 }) // Sort by order ID, adjust as needed
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    const totalCount = await Order.countDocuments();

    res.render("admin/orderManagement", {
      order: orders,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

     
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const orderStatus = req.body.orderStatus;

    // Find the order by its ID
    const order = await Order.findById(orderId);

    // Check if the order is already delivered
    if (order.status === 'Delivered') {
      console.log('Order is already delivered. Cannot update status.');
      res.status(400).send('Order is already delivered. Cannot update status.');
      return;
    }

    // Update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: orderStatus } },
      { new: true }
    );

    // If the new status is 'Delivered', update the dateDelivered field
    if (orderStatus === 'Delivered') {
      updatedOrder.dateDelivered = Date.now();
    }

    // Save the updated order
    const savedOrder = await updatedOrder.save();

    console.log('Order status updated successfully:', savedOrder);
    res.send(orderStatus);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Internal Server Error');
  }
};



   module.exports.viewdetails=async (req, res) => {
      const orderId = req.params.orderId;
    
      
      const order = await Order.findById(orderId).populate('items.product') .populate('userId');
  console.log(order)
      if (!order) {
        
        return res.status(404).send('Order not found');
      }
    
      
      res.render('admin/orderDetails', { order});
    };
    

    module.exports.orderCancel = async(req,res)=>{
      try {
        const userId = req.session.user_id;
        const id = req.params.id;
        const cancelOrder = await Order.findOneAndUpdate({_id: id},{
          $set: {
            canceled: true,
            status: 'Canceled'
          }
        });
        if (!cancelOrder) {
          console.log('Error in cancelling the order or unauthorized access');
          return res.status(400).send('Error in cancelling the order or unauthorized access');
      }
  
      
      if (cancelOrder.paymentMethod === 'Razorpay') {
          let wallet = await Wallet.findOne({ userId: userId });
          let transaction = await Transaction.findOne({ userId: userId });
  
          if (!wallet) {
          var  newWallet = new Wallet({
                  userId: userId,
                  walletBalance: cancelOrder.totalAmount,
              });
   await newWallet.save();
              console.log("hloo" + 'new wallet created')
  
          }else{
            wallet.walletBalance += cancelOrder.totalAmount;
            await wallet.save();
          }
  
      
  
          if (!transaction) {
              transaction = new Transaction({
                  userId: userId,
                  transaction: [{ mode: 'Credit', amount: cancelOrder.totalAmount }],
              });
              console.log("hloo" + 'new  transaction created')
  
          } else {
              transaction.transaction.push({ mode: 'Credit', amount: cancelOrder.totalAmount });
          }
  
          await transaction.save();
      }
     
  
  
if(cancelOrder){
  res.redirect('/view-order-details/'+id);
}
      } catch (error) {
        console.log(error.message)
      }
    }

    
    
    module.exports.verifyPayment = async (req, res) => {
      try {
        console.log(req.body, "Success of order ");
        const orderId = req.body.orderId;
        const details = req.body;
    
        const secretKey = "BPmoAFMZFXLcJ7Xpm9R2nkkE"; 
    const crypto = require("crypto"); 
    
    
        const hmac = crypto.createHmac("sha256", secretKey);
        hmac.update(
          details['payment[razorpay_order_id]'] +
            "|" +
            details['payment[razorpay_payment_id]']
        );
        const calculatedHmac = hmac.digest("hex");
    
        console.log(calculatedHmac, "HMAC calculated");
    
        if (calculatedHmac === details['payment[razorpay_signature]']) {
          await Order.updateOne(
            { _id: orderId },
            {
              $set: {
                paymentstatus: "placed",
              },
            }
          );
    
          console.log("Payment is successful");
          res.json({ status: true });
        } else {
          await Order.updateOne(
            { _id: orderId },
            {
              $set: {
                paymentstatus: "failed",
              },
            }
          );
    
          console.log("Payment is failed");
          res.json({ status: false, errMsg: "Payment verification failed" });
        }
      } catch (error) {
        console.log('Try catch error in verifyPayment  ');
        console.log(error.message);
      }
    };

  


  module.exports.allowReturn = async (req, res) => {
    try {
      const id = req.params.id;
  
      const order = await Order.findOne({ _id: id });
      if (!order) {
        return res.status(404).send('Order not found');
      }
  
      order.returned = true;
      await order.save();
  
      console.log(order + "hloo");
res.redirect('/view-order-details/' + id);
  
     }
   catch (error) {
      console.error(error.message);
      res.status(500).send('Internal ServerError');
   }
  };


  module.exports.walletPage = async(req,res)=>{
    try {
      const id =  req.session.user_id
    
      const userWallet = await Wallet.findOne({userId: id})
      const category = await Category.find({ active: true });
      console.log(userWallet)
      
      const user = req.session.user_id;
  
      const trans = await Transaction.findOne({userId: id}).sort({_id: -1});
      console.log(trans)
  
      res.render('user/wallet', {balance: userWallet,category:category , user: user, transactions: trans});
    } catch (error) {
      console.log('Try catch error in walletPage ');
      console.log(error.message);
    }
  };
  
  // <-------------------------------------------------------| RENDERING WALLET PAGE ----------------------------------------------------|>
  module.exports.walletUsage = async (req, res) => {
    try {
      const userId = req.session.user_id;
  
      const userWallet = await Wallet.findOne({ userId: userId });
      const userCart = await Cart.findOne({ userId: userId });
      const TransactionDb = await Transaction.findOne({userId: userId})
  
  
  
      if (!userCart) {
        return res.status(400).send("No cart available.");
      }
  
      if (!userWallet) {
        return res.status(400).send("No wallet available.");
      }
  
      const total = parseFloat(req.body.data);
      const walletBalance = userWallet.walletBalance
  
      let orderTotal = 0;
      let wallet = 0;
      let totalSave = 0;
  
      if (total < walletBalance) {
        wallet =  walletBalance -  total;
        totalSave = total
        userWallet.walletBalance = wallet;
        await userWallet.save();
        const pushTrans = {
            mode: "Debit",
            amount: totalSave
          }
  
          TransactionDb.transaction.push(pushTrans)
      
        await TransactionDb.save();
  
      } else{
        totalSave = walletBalance
        orderTotal = total - walletBalance;
        wallet = 0;
        userWallet.walletBalance = wallet;
        await userWallet.save();
        const pushTrans = {
          mode: "Debit",
          amount: totalSave
        }
  
        TransactionDb.transaction.push(pushTrans)
    
      await TransactionDb.save();
  
      } 
  
      res.send({ totalBalance: orderTotal, walletBalance: wallet, saved: totalSave});
    } catch (error) {
      console.log('Try catch error in walletUsage ');
      console.log(error.message);
    }
  };
  
















  //--ADMIN SIDE--//
  
module.exports.returnApprovel = async (req, res) => {
      try {
          const id = req.params.id;
  
          const returnApprovel = await Order.findOneAndUpdate(
              { _id: id },
              {
                  $set: {
                    
                      returnApprovel: true,
                      
                  },
              },
              { new: true }           );
              const user = returnApprovel.userId;
              const walletAvailable = await Wallet.findOne({userId: user});
              const transactionDb  = await Transaction.findOne({userId: user});
          
          
              if(returnApprovel){
          
                if(walletAvailable){
                  await Wallet.findOneAndUpdate({userId: user},{
                    $set: {
                      walletBalance: returnApprovel.totalAmount + walletAvailable.walletBalance
                    }
                  })
          
                  const trans = {
                    mode: 'Credit',
                    amount: returnApprovel.totalAmount
                  }
                  transactionDb.transaction.push(trans);
          
                 const pushTans =  await transactionDb.save();
          
                 if(pushTans){
                  console.log('transaction details pushed');
                 }else{
                  console.log('error pushing transactioh details');
                 }
          
                }else{
                  const OrderReturnMoney = new Wallet({
                    userId: returnApprovel.userId,
                    walletBalance: returnApprovel.totalAmount
                  
                  }) 
                  
                  const saved = await OrderReturnMoney.save();
          
                  
                  const newTrans = new Transaction({
                    userId: user,
                    transaction: [{
                      mode: 'Credit',
                     amount: returnApprovel.totalAmount,
          
                   }]
                  })
          
                  const SaveNewTrans = await newTrans.save();
          
                  if(SaveNewTrans){
                    console.log('New transaction has been saved ');
                  }else{
                    console.log("Error saving new TRansaction ");
                  }
          
          if(saved){
            console.log('money Added to the wallet ');
          }else{
            console.log("Money adding to walle failed ! ");
          }
                  
                }
          
                
          
    
              res.redirect('/admin/view-order-details-admin/' + id);
          }else{
            console.log("return approval failed ");
          }
      } catch (error) {
          console.log(error.message);
      }
  };


  module.exports.invoiceDownload= async (req, res) => {
    try {
    
      const id = req.body.orderId;
      console.log(id)

      
        
      const order = await Order.findById(id).populate('items.product')
      res.send(order)
      console.log(order.items + "hloo");
      
  
    } catch (error) {
      console.log('Try catch error in invoiceDownload ');
      console.log(error.message);
    }
  };


  module.exports.orderPagination =  async (req, res) => {
    try {
      const { page, pageSize } = req.body;
      const skip = (page - 1) * pageSize;
      const orders = await Order.find().populate('items.product').sort({ _id: -1 })
        .skip(skip)
        .limit(pageSize);
  
      res.json({ orders });
    } catch (error) {
      console.error('Error fetching paginated data:', error);
      res.status(500).json({ error: 'Internal Server Error'});
  }
  };
   
  