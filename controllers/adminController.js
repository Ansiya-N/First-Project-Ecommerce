const { Admin } = require("../model/adminSchema");
const { Category } = require("../model/categorySchema");
const { User } = require("../model/userSchema");
const Coupon = require('../model/couponSchema');
const Order = require('../model/orderSchema');
const { Product } = require('../model/productSchema');
const { Address } = require('../model/addressSchema');
const Cart = require('../model/cartSchema');

const Chart = require('chart.js');

const commonResponseHandler = (res, data, errorMessage = 'Internal Server Error') => {
  if (data instanceof Error) {
    console.error(data.message);
    return res.status(500).send(errorMessage);
  }
  return res.render('admin/login');
};

module.exports.login = (req, res) => {
  try {
    res.render('admin/login');
  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.dash = (req,res)=>{
  res.render('admin/dash');

}

module.exports.verifyAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email, password });

    if (existingAdmin) {
      req.session.admin = email;
      req.session.name = true;
      console.log(req.session);
      res.redirect('/admin/product-mg');
    } else {
      res.render('admin/login', { errorMessage: 'Username or password incorrect' });
    }
  } catch (err) {
    commonResponseHandler(res, err, 'Internal Server Error');
  }
};


module.exports.userManagment = async (req, res) => {
  try {
    const users = await User.find({}); 
    res.render("admin/userManagment", { users: users }); 
  } catch (error) {
    console.log("userManagment try-catch error:", error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.activateUser = async(req,res)=>{
  try {
    const id = req.params.id;

    const user = await User.findOneAndUpdate({_id: id}, {
      $set: 
      {status: true}
    })

    console.log('activated');
    res.redirect('/admin/user-mg');
  } catch (error) {
    console.log(error.message)
  }
}

module.exports.deactivateUser = async(req,res)=>{
  try {
    const id = req.params.id;

    const user = await User.findOneAndUpdate({_id: id}, {
      $set: 
      {status: false}
    })
    console.log('deactivated');
  res.redirect('/admin/user-mg');
  } catch (error) {
    console.log(error.message)
  }
}


module.exports.deactivateCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const deactivated = await Category.findByIdAndUpdate(id, {
      $set: { active: false }
    });

    if (deactivated) {
      req.flash('success', 'Deactivated Category Successfully.');
      res.redirect("/admin/category-mg");
    } else {
      req.flash('success', 'Error deactivating category.');
      console.log('Error deactivating category');
    }
  } catch (error) {
    console.log(error.message);
  }
};


module.exports.activateCategory = async (req, res) => {
  try {
    const id = req.params.id
   console.log(id + 'hloo')
    const activated = await Category.findOneAndUpdate({_id: id}, {
      $set: {active: true}
    })

   if(activated){
    req.flash('success', 'Category Activated Successfully.');
    res.redirect("/admin/category-mg");
   }else{
    req.flash('success', 'Error in activate category.');
    console.log('error deactivating category');
   }
  } catch (error) {
   
    console.log(error.message);
  }
};


module.exports.logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect('/admin');
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports.chartData = async (req, res) => {
  try {
    const orderData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$dateOrdered' },
            month: { $month: '$dateOrdered' }
          },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          orderCount: 1
        }
      },
      {
        $sort: {
          year: 1,
          month: 1
        }
      }
    ]);

    const canceledOrderData = await Order.aggregate([
      {
        $match: {
          canceled: true,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateOrdered' },
          },
          canceledOrderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          canceledOrderCount: 1,
        },
      },
      {
        $sort: {
          year: 1,
        },
      },
    ]);

    const weeklyOrderData = await Order.aggregate([
      {
        $group: {
          _id: {
            week: { $week: '$dateOrdered' },
          },
          weeklyOrderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          week: '$_id.week',
          weeklyOrderCount: 1,
        },
      },
      {
        $sort: {
          week: 1,
        },
      },
    ]);

    res.json({
      orderData,
      canceledOrderData,
      weeklyOrderData,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports.userPagination = async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const skip = (page - 1) * pageSize;
    const users = await User.find().sort({ _id: -1 }).skip(skip).limit(pageSize);

    res.json({ users });
  } catch (error) {
    commonResponseHandler(res, error, 'Internal Server Error');
  }
};
