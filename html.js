module.exports.PaymentCheckout = async(req,res)=>{
  
    try {
      const orderId = req.body.orderId;
    
    
      const newOrder = await Orders.findById(orderId);
      console.log(newOrder + "hloo");
      var options = {
        amount: newOrder.totalprice * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "razorUser@gmail.com"
      };
      instance.orders.create(options, function(err, order) {
    
        console.log(order);
        res.send(order)
    
      });
    } catch (error) {
      console.log('Try catch error in PaymentCheckout ');
      console.log(error.message);
    }
    
    }