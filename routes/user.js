var express = require("express");
const {
  wishlistPage,
  removeWishlistProduct,
  wishlistToCart,
  productAddToWishlist,
} = require("../controllers/wishlistController");

const {
  signupUser,
  login,
  home,
  signup,
  verifyOtp,
  logout,
  userBlocked,
  verifyLogin,
  renderForgotPassword,
  sendPasswordResetEmail,
  renderPasswordReset,
  handlePasswordReset,
  addNewPassword,
  resendOtp,
  verifyresendOtp ,
  test,
  otpPage,
  profile,
  editProfile,
  updateProfile,
  editAddress,
  editAddressPage,
  changePasswordPage,
  changePassword,
 
  
} = require("../controllers/userController");
const {
  categoriesLoad,
  singleProductView,
  allproducts,
  searchProducts,
  productPaginate,
  productSort,
  productFilter
} = require("../controllers/productController");
const {
  blockChecker,
  UserLoginChecker,
  userLogedOrNot,
  blocked
} = require("../middlewares/middlewares");
const {  cartPage, productAddToCart,updateQuantity, removeCartItem,checkout,calculateTotal} = require('../controllers/cartController');
const { addAddressPage, addAddress,updateAddress,deleteAddress } = require("../controllers/addressController");
const {checkoutAjaxAddress, placeorder, vieworderdetails, SingleOrderDetail, orderCancel,PaymentCheckout,verifyPayment,orderPagination,allowReturn, walletPage,
  walletUsage,invoiceDownload
  } = require("../controllers/orderController");
const {useCoupon,getCoupons} = require("../controllers/couponController");
var router = express.Router();
/*router.get('/addToCart/:productId', blockChecker, addToCart);*/

router.get("/profile",userLogedOrNot,blockChecker,profile)

router.get("/register",UserLoginChecker,signupUser);

router.post("/signup",UserLoginChecker,signup);

router.post("/verify",UserLoginChecker,verifyOtp);

router.get("/login",UserLoginChecker,login);

router.get("/forgotPassword",UserLoginChecker, renderForgotPassword);

router.post("/sendPasswordReset",UserLoginChecker,blockChecker, sendPasswordResetEmail);



router.post("/resetPassword/:id",UserLoginChecker,blockChecker, handlePasswordReset);

router.post("/addNewPassword/:id",UserLoginChecker,blockChecker,addNewPassword);

router.post("/loginHome",UserLoginChecker,blockChecker,verifyLogin);

router.get("/",blockChecker,home);

router.get("/home",userLogedOrNot,blockChecker,home);

router.get("/allProducts",blockChecker, allproducts);
router.get("/search",blockChecker, searchProducts);

router.get("/category/:id",blockChecker, categoriesLoad);

router.get("/single-product/:id",blockChecker,  singleProductView);

router.get('/addToCart/:id',userLogedOrNot, productAddToCart)

router.get('/cart-remove/:id',userLogedOrNot,blockChecker, removeCartItem);

router.get('/cart',userLogedOrNot,blockChecker,cartPage)

router.get("/blocked",userBlocked);

router.get("/logout",userLogedOrNot, logout);

router.get("/resendOtp",blockChecker, verifyresendOtp );

router.get("/loadOtpPage",UserLoginChecker,blockChecker,otpPage);


router.post('/updateQuantity',userLogedOrNot,blockChecker,updateQuantity)

router.get('/place-order/:orderid',userLogedOrNot,blockChecker,placeorder)

router.get('/checkout',userLogedOrNot,blockChecker, checkout);

router.get("/address", userLogedOrNot,blockChecker,addAddressPage)

router.post('/product-search',blockChecker,searchProducts)

router.post('/add-address', userLogedOrNot,blockChecker,addAddress)

router.post('/checkout-address',userLogedOrNot,blockChecker,checkoutAjaxAddress)

router.get('/vieworderdetails',userLogedOrNot,blockChecker,vieworderdetails);

router.get('/view-order-details/:id',userLogedOrNot,blockChecker, SingleOrderDetail);

router.get('/cancel-order/:id', userLogedOrNot,blockChecker,orderCancel)

router.get('/user/edit-profile/:id',userLogedOrNot,blockChecker,editProfile)

router.post('/update-profile/:id',userLogedOrNot,blockChecker,updateProfile)

//router.get('/user/edit-address/:id',userLogedOrNot,blockChecker,editAddressPage)

router.get('/user/edit-address/:id',userLogedOrNot,blockChecker,editAddress)

router.post('/update-address/:id',userLogedOrNot,blockChecker,updateAddress)

router.get('/user/delete-address/:id',deleteAddress)

router.get('/user/change-password/:id',userLogedOrNot,blockChecker,changePasswordPage);

router.post('/change-password/:id',userLogedOrNot,blockChecker,changePassword)

router.post('/checkoutpayment',userLogedOrNot,blockChecker,PaymentCheckout)

router.post('/verifiedpayment',userLogedOrNot,blockChecker,verifyPayment)

router.post('/pagination',blockChecker,productPaginate)


router.get('/product-sort',blockChecker,productSort)

router.get('/product-filter',blockChecker,productFilter)

router.get('/return-order/:id',allowReturn)

router.get('/blocked',blocked)

router.post('/use-coupon',useCoupon)

router.get("/wallet", blockChecker,userLogedOrNot, walletPage); 

router.post("/use-wallet", blockChecker, userLogedOrNot,walletUsage);

router.post("/order-invoice", blockChecker, userLogedOrNot, invoiceDownload);

router.get('/get-coupons',blockChecker, getCoupons)

router.post('/order-pagination',orderPagination)


router.get("/wishlist", userLogedOrNot, blockChecker, wishlistPage);
router.get("/user/add-wishlist/:id", userLogedOrNot, blockChecker, productAddToWishlist); 

router.get("/delete-wishlist-item/:id", blockChecker, removeWishlistProduct); 
router.get("/whishlist-to-cart/:id", blockChecker, wishlistToCart); 

module.exports = router;

