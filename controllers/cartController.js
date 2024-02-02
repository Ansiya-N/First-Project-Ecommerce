const { Product } = require("../model/productSchema");
const Cart = require('../model/cartSchema');
const { Category } = require("../model/categorySchema");
const { User } = require('../model/userSchema');
const { Address } = require('../model/addressSchema');
const { Wallet } = require("../model/walletSchema");
const { Transaction } = require("../model/walletTransactionSchema");
const { Coupon } = require("../model/couponSchema");

const commonResponseHandler = (res, data, errorMessage = 'Internal Server Error') => {
  if (data instanceof Error) {
    console.error(data.message);
    return res.status(500).send(errorMessage);
  }
  return res;
};

module.exports.productAddToCart = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user_id;

    console.log(userId + "hlooo" + id);

    const cart = await Cart.findOne({ userId: userId }).populate("items.product");

    if (!cart) {
      const newCart = new Cart({
        userId: userId,
        items: [{ product: id, quantity: 1 }],
        totalprice: 0,
        totalQuantity: 1,
      });

      await newCart.save();
      return res.redirect('/single-product/' + id);
    }

    const existingCartItem = cart.items.find((item) => item.product.equals(id));

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      cart.items.push({ product: id, quantity: 1 });
    }

    const total = cart.items.reduce((acc, item) => {
      const subtotal = item.product.price * item.quantity;
      return isNaN(subtotal) ? acc : acc + subtotal;
    }, 0);

    console.log(total);

    cart.totalprice = total;
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    await cart.save();

  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.cartPage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const category = await Category.find({ active: true });
    const cart = await Cart.findOne({ userId }).populate('items.product');
    
    commonResponseHandler(res, cart);
    res.render('user/cart', { cart: cart, category: category, user: userId });

  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.updateQuantity = async (req, res) => {
  try {
    console.log(req.body, 'productId')
    const userId = req.session.user_id;
    const { productId, quantity, totalPrice } = req.body;

    console.log(userId + productId);

    const cart = await Cart.findOneAndUpdate(
      { userId: userId, "items.product": productId },
      {
        $set: { "items.$.quantity": quantity, totalprice: totalPrice },
      },
      { new: true }
    );

    const prodId = await Product.findOne({ _id: productId });
    const stock = prodId.stock;

    await prodId.save();

    const product = await Cart.findOne({ userId: userId }).populate(
      "items.product"
    );

    const subtotals = product.items.map((item) => {
      return {
        productId: item.product._id,
        subtotal: item.product.price * item.quantity,
      };
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    const quantityrsp = parseInt(quantity);

    res.json({
      success: true,
      message: "Cart updated successfully",
      subtotal: subtotals,
      stock: stock,
      quantity: quantityrsp,
      prodId: productId,
    });
  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.removeCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user_id;
    const cart = await Cart.findOne({ userId: userId }).populate('items.product');
    let productIndex = -1;

    if (cart) {
      productIndex = cart.items.findIndex((item) => item.product._id.toString() === id);
    }

    if (productIndex !== -1) {
      cart.items.splice(productIndex, 1);
      await cart.save();
      return res.redirect('/cart');
    } else {
      console.log("Product not found in the cart.");
      return res.send("Product not found in the cart.");
    }
  } catch (error) {
    commonResponseHandler(res, error);
  }
};

module.exports.checkout = async (req, res) => {
  try {
    const id = req.session.user_id;
    const wallet = await Wallet.findOne({ userId: id });
    const user = req.session.user_id;
    const addresses = await Address.findOne({ userId: user });
    const category = await Category.find({ active: true });
    const trans = await Transaction.findOne({ userId: id }).sort({ _id: -1 });
    console.log(trans)
    const cart = await Cart.findOne({ userId: user }).populate('items.product');
    const availableCoupons = await Coupon.find({ active: true, expirationDate: { $gt: new Date() } });

    res.render('user/checkout', { availableCoupons, cart: cart, wallet: wallet, addresses: addresses, category: category, user, transactions: trans });

  } catch (error) {
    commonResponseHandler(res, error);
  }
};
