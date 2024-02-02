const Sales = require('../model/salesSchema');
const { Category } = require("../model/categorySchema");
const Order= require('../model/orderSchema'); 
const Product = require('../model/productSchema');

module.exports.salesReportPage = async (req, res) => {
  try {
    const category = await Category.find({ active: true });
    const orders = await Order.find().populate('items.product');
    console.log(orders);
    res.render('admin/sales-report', { category, order: orders });
  } catch (error) {
    console.log(error.message);
    console.log('try catch error in salesreportpage');
  }
};

module.exports.salesReport = async (req, res) => {
  try {
    const startDateString = req.body.startDate;
    const endDateString = req.body.endDate;

    if (!startDateString || !endDateString) {
      return res.status(400).send('Start date and end date are required.');
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999); // Set the end time to 23:59:59.999

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      req.flash('error', 'Invalid date format. Please provide valid dates.');
      return res.render('admin/sales-report', { success: 'Invalid date format. Please provide valid dates.' });
    }

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    // Use Promise.all to parallelize multiple asynchronous operations
    const [allOrders] = await Promise.all([
      Order.find({
        dateOrdered: { $gte: startDate, $lte: endDate },
        returned: false,
      }).populate('items.product'), // Populate the 'items.product' field
    ]);

    console.log('Filtered Orders:', allOrders);

    let totalSales = 0;
    let totalOrders = 0;
    let totalAmount = 0;

    allOrders.forEach((order) => {
      totalSales += order.totalAmount;
      totalOrders++;
      totalAmount += order.totalAmount;
    });

    const averageOrderValue = totalOrders > 0 ? Math.ceil(totalAmount / totalOrders) : 0;

    const salesReport = {
      totalSales,
      totalOrders,
      averageOrderValue,
      orders: allOrders.map((order) => ({
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        formattedDateOrdered: order.formattedDateOrdered,
        userAddress: order.address,
        products: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      })),
    };

    console.log('Average Order Value:', averageOrderValue); // Print average order value to the terminal

    res.send(salesReport);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};
