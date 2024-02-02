const Cart = require("../model/cartSchema");
const { Category } = require("../model/categorySchema");
const { Wishlist } = require("../model/wishlistSchema");

// Common response handler
const handleResponse = (res, status, message) => {
  res.status(status).send(message);
};

// USER SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$

module.exports.productAddToWishlist = async (req, res) => {
  try {
    const prodId = req.params.id;
    const userId = req.session.user_id;

    const wishlist = await Wishlist.findOne({ userId: userId });

    if (!wishlist) {
      const newWishlist = new Wishlist({
        userId: userId,
        items: [{ product: prodId }],
      });

      await newWishlist.save();
      return res.redirect('/single-product/' + prodId);
    }

    const existingProduct = wishlist.items.find((item) => item.product.equals(prodId));

    if (existingProduct) {
      console.log("Product already exists in the wishlist");
    } else {
      wishlist.items.push({ product: prodId });
      await wishlist.save();
      console.log("Product saved to wishlist");
    }

    res.redirect('/single-product/' + prodId);
  } catch (error) {
    console.log("Try catch error in productAddToWishlist");
    console.log(error.message);
    handleResponse(res, 500, "Internal Server Error");
  }
};

// RENDERING WISHLIST PAGE
module.exports.wishlistPage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const wishlist = await Wishlist.findOne({ userId }).populate("items.product");
    const category = await Category.find({ active: true });

    res.render("user/wishlist", { product: wishlist, category, user: userId });
  } catch (error) {
    console.log("Try catch error in wishlistPage");
    console.log(error.message);
    handleResponse(res, 500, "Internal Server Error");
  }
};

// REMOVING WISHLIST PRODUCTS
module.exports.removeWishlistProduct = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const wishlist = await Wishlist.findOne({ userId: userId }).populate("items.product");

    if (wishlist) {
      const productIndex = wishlist.items.findIndex((item) => item.product._id);
      wishlist.items.splice(productIndex, 1);
      await wishlist.save();
      res.redirect("/wishlist");
    }
  } catch (error) {
    console.log("Try catch error in removeWishlistProduct");
    console.log(error.message);
    handleResponse(res, 500, "Internal Server Error");
  }
};

// WISHLIST TO CART
module.exports.wishlistToCart = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user_id;

    const [cart, wishlist] = await Promise.all([
      Cart.findOne({ userId: userId }).populate("items.product"),
      Wishlist.findOne({ userId: userId }),
    ]);

    if (!cart) {
      const newCart = new Cart({
        userId: userId,
        items: [{ product: id, quantity: 1 }],
        totalprice: 0,
        totalQuantity: 1,
      });

      await newCart.save();
      return res.redirect('/wishlist');
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

    cart.totalprice = total;
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    await cart.save();
  } catch (error) {
    console.log(error.message);
    handleResponse(res, 500, "Internal Server Error");
  }
};
