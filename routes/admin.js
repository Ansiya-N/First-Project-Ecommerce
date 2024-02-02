var express = require('express');
const { login, verifyAdmin, userManagment, activateUser, deactivateUser, deactivateCategory, activateCategory, logout ,chartData,dash,userPagination } = require('../controllers/adminController');
const { productPage, categoryPage, addCategory, AddProductPage, addProduct, EditProductPage, updateProduct, deleteProduct, editCategory, updateCategory,productPaginate,paginatedProducts} = require('../controllers/productController');

const {orderManagement, updateOrderStatus, viewdetails,returnApprovel,orderPagination}= require('../controllers/orderController');
var router = express.Router();
const multer = require("multer");
const path = require("path");

const{salesReportPage,salesReport} = require('../controllers/salesController')

const {addCouponPage,addCoupon,deleteCoupon,generateCoupon,couponMg,editCoupon,updateCoupon} = require("../controllers/couponController");

const store=require('../middlewares/multer');
const { adminSessionCheck } = require('../middlewares/middlewares');


router.get('/dashboard',dash)

router.get('/',adminSessionCheck,login);

router.post('/verify', adminSessionCheck,verifyAdmin);

router.get('/product-mg', adminSessionCheck,productPage);

router.get('/user-mg',adminSessionCheck, userManagment);

router.get('/category-mg',adminSessionCheck, categoryPage);

router.post("/addCategory",adminSessionCheck, addCategory)


router.get("/addproducts",adminSessionCheck, AddProductPage)

router.post("/add-product",store.upload.any(), adminSessionCheck,addProduct);

router.get('/edit-product/:id',adminSessionCheck,EditProductPage )

router.post('/update-product/:id',store.upload.any(),adminSessionCheck,updateProduct)

router.get('/delete-product/:id', adminSessionCheck,deleteProduct);

router.get("/unblock/:id", adminSessionCheck,activateUser);

router.get("/block/:id",  adminSessionCheck,deactivateUser);

router.get("/deactivate/:id", adminSessionCheck, deactivateCategory);

router.get('/activate/:id',adminSessionCheck, activateCategory)

router.get('/edit-category/:id',adminSessionCheck, editCategory)

router.post('/update-category/:id',adminSessionCheck, updateCategory);

router.get('/orderManagement',adminSessionCheck,orderManagement);

router.post('/view-order-details-admin',adminSessionCheck,updateOrderStatus)

router.get("/logout",adminSessionCheck, logout)

router.get('/view-order-details-admin/:orderId',adminSessionCheck,viewdetails)

router.post('/updateOrderStatus',adminSessionCheck,updateOrderStatus)

router.get('/sales-report',adminSessionCheck,salesReportPage)

//router.get('/get-report',adminSessionCheck,generateSalesReportPage)

router.post('/report-download',adminSessionCheck,salesReport);


router.get('/approve-return/:id',adminSessionCheck,returnApprovel)

router.get('/add-couponPage',adminSessionCheck,addCouponPage)

router.post('/add-coupon',adminSessionCheck,addCoupon)



router.get('/coupons',adminSessionCheck,couponMg)

router.post('/generate-coupon',adminSessionCheck,generateCoupon)

router.get("/delete-coupon/:id", adminSessionCheck,deleteCoupon)


router.get('/edit-coupon/:id',adminSessionCheck,editCoupon)

router.post('/update-coupon/:id',adminSessionCheck,updateCoupon)

router.get('/getChartData',adminSessionCheck,chartData)

router.post('/user-pagination',userPagination)

router.get('/admin/products',paginatedProducts);

module.exports = router;
