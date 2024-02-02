const { Category } = require("../model/categorySchema");
const { Product } = require("../model/productSchema");
const mongoose = require('mongoose');




module.exports.productPage = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 2; // Adjust as needed

    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const products = await Product.find().skip(skip).limit(ITEMS_PER_PAGE);
    const totalCount = await Product.countDocuments();

    res.render("admin/product-mg", {
      items: products,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
      currentPage: page,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};


module.exports.categoryPage = async (req, res) => {
  try {
     const category = await Category.find({})
     res.render("admin/category-mg", { category: category });
  } catch (error) {
     console.error(error.message);
     res.status(500).send('Internal Server Error');
  }
 };

module.exports.addCategory = async (req, res) => {
  try {
    
    const categoryNew = req.body.category.trim();
    const category = await Category.find({});
    console.log("Received category:", categoryNew);
    req.flash('success', 'New Category Added.');
    if (categoryNew==="") {
      req.flash('error', 'Category name is required');
      return res.render('admin/category-mg',{category: category,success:'category name required'});
    }
    const existingCategory = await Category.findOne({
      categoryName: categoryNew,
    });
    
    if (existingCategory) {
      console.log("Category already exists.");
      return res.render('admin/category-mg', {category: category, success: "Duplicate category found" });
    }
   
    const categorySave = new Category({
      categoryName: categoryNew,
      
    });
    const saved = await categorySave.save();
   
    if (saved) {
      console.log("New Category Added.");
      return res.redirect("/admin/category-mg");
    } else {
      console.log("Error saving category.");
      return res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.log("Category-add try-catch error!");
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports.categoriesLoad = async (req, res) => {
  try{
  const id = req.params.id;
  const user = req.session.user_id;
  
    const category = await Category.find({ active: true });
    const product = await Product.find({ category: id }).populate("category");
    res.render("user/categoriesCollection", {
      product: product,
      category: category,
      user: user
    })
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.editCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await Category.findOne({ _id: id }).populate('offer');

    if (category) {
      res.render("admin/editCategoryPage", { category: category,success:req.flash() });
    } else {
      console.log("category not found !");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.updateCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    const newCategoryName = req.body.categoryName;
    
    const existingCategory = await Category.findOne({ categoryName: newCategoryName });

    if (existingCategory) {
      req.flash('success', 'Duplicate category name.');
      return res.redirect("/admin/category-mg");
    }

    const editCategory = await Category.findOneAndUpdate(
      { _id: catId },
      {
        $set: {
          categoryName: req.body.categoryName,
        },
      }
    );

    if (editCategory) {
      req.flash('success', 'Category updated successfully.');
      console.log(editCategory);
      res.redirect("/admin/category-mg");
    } else {
      req.flash('success', 'Category not found.');
      res.redirect("/admin/category-mg");
    }
  } catch (error) {
    console.log(error.message);
    req.flash('success', 'Internal Server Error.');
    res.redirect("/admin/category-mg");
  }
};

module.exports.singleProductView = async (req, res) => {
  try {
    var id = req.params.id;
    
    if (req.session.user_id) {
      const category = await Category.find({ active: true });
      const product = await Product.findById(id);
      res.render("user/singleProduct", {
        product: product,
        category: category,
        user: true,
      });
    } else {
      const category = await Category.find({ active: true });
      const product = await Product.findOne({ _id: id });
      res.render("user/singleProduct", {
        product: product,
        category: category,
        user: false,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.AddProductPage = async (req, res) => {
  try{
  const category = await Category.find({});
  res.render("admin/addProductPage", { category: category });
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.addProduct = async (req, res) => {
  try {
    const productData = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      description: req.body.description,
      image1:
        req.files[0] && req.files[0].filename ? req.files[0].filename : "",
      image2:
        req.files[1] && req.files[1].filename ? req.files[1].filename : "",
      stock: req.body.stock,
    });

    await productData.save();
    msg = "New Product Added";
    console.log("hlooo", { msg: msg });

    return res.redirect("/admin/addproducts");
  } catch (error) {
   
    console.log(error.message);
  }
};

module.exports.EditProductPage = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send("Invalid product ID");
    }
    const category = await Category.find({});
    const product = await Product.findById(id).exec();
    if (!product) {
      res.status(404).send("Product not found");
    }

    

    res.render("admin/editProductPage", {
      title: "Edit User",
      product: product,
      admin: true,
      category,
    });
  } catch (error) {
    
    console.log(error.message);
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send("Invalid product ID");
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      req.flash('success', 'Product not found.');
      return res.status(404).send("Product not found");
    }

    let new_image1 = existingProduct.image1;
    let new_image2 = existingProduct.image2;

    if (req.files[0] || req.files[1]) {
      new_image1 =
        req.files[0] && req.files[0].filename ? req.files[0].filename : "";
      new_image2 =
        req.files[1] && req.files[1].filename ? req.files[1].filename : "";
      try {
        await fs.unlink(path.join("./uploads", existingProduct.image1));
        await fs.unlink(path.join("./uploads", existingProduct.image2));
      } catch (err) {
        
        console.error(err);
      }
    }

    const newData = await Product.updateOne(
      { _id: id },
      {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        image1: new_image1,
        image2: new_image2,
        stock: req.body.stock,
      }
    );

    console.log(newData);
    req.flash('success', 'Product updated successfully.');

    res.redirect("/admin/product-mg");
  } catch (error) {
    
    console.log(error.message);
  }
};

module.exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await Product.findByIdAndDelete(id).exec();

    if (product && product.image1 && product.image2) {
      try {
        fs.unlinkSync("./uploads/" + product.image1);
        fs.unlinkSync("./uploads/" + product.image2);
      } catch (err) {
        console.error(err);
      }
    }
    req.flash('success', 'Product deleted successfully.');

    res.redirect("/admin/product-mg");
  } catch (error) {
    
    console.log(error.message);
  }
};

module.exports.allproducts = async (req, res) => {
  try {
    const user = req.session.user_id;
    const products = await Product.find({});
    const category = await Category.find({ active: true });
   res.render('user/allproducts', { products,category ,user});
} catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.searchProducts = async (req, res) => {
  try {
    console.log('Search request received');
    console.log('Request body:', req.body);
    let payload = req.body.payload.trim();
    console.log('Search Query:', payload);
    
    let search = await Product.find({
      name: { $regex: new RegExp(payload, "i") },
    }).exec();

    search = search.slice(0, 10);

    console.log('Search Results:', search);

    res.send({ payload: search });
  } catch (error) {
    console.log("Try catch error in productSearch ");
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.productPaginate =  async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const skip = (page - 1) * pageSize;
    const products = await Product.find()
      .skip(skip)
      .limit(pageSize);

    res.json({ products });
  } catch (error) {
    console.error('Error fetching paginated data:', error);
    res.status(500).json({ error: 'Internal Server Error'});
}
};
 

module.exports.productSort= async (req, res) => {
  try {
    const sortOption = req.query.sort || 'name'; 

    let products = await Product.find().sort(sortOption).exec();

    products = products.slice(0, 10);

    res.send({ payload: products });
  } catch (error) {
    console.log("Error in productSort route");
    console.log(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};



module.exports.productFilter = async (req, res) => {
  try {
    const filterCategory = req.query.category || '';
    const filterPriceRange = req.query.priceRange || ''; // New parameter

    let products;

    if (filterCategory === '' && filterPriceRange === '') {
      products = await Product.find().exec();
    } else {
      const filterConditions = {};

      if (filterCategory !== '') {
        const regex = new RegExp(filterCategory, 'i');
        filterConditions.category = { $in: await Category.find({ categoryName: regex }).distinct('_id') };
      }

      if (filterPriceRange !== '') {
        const [minPrice, maxPrice] = filterPriceRange.split('-').map(Number);
        filterConditions.price = { $gte: minPrice, $lte: maxPrice };
      }

      products = await Product.find(filterConditions).exec();
    }

    products = products.slice(0, 10);

    res.send({ payload: products });
  } catch (error) {
    console.log('Error in productFilter route');
    console.log(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};


// In your controller file (e.g., productsController.js)

// Adjust as needed

// In your controller file (e.g., productsController.js)


module.exports.paginatedProducts = async (req, res) => {
    try {
      const ITEMS_PER_PAGE = 5; // Adjust as needed

        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const products = await Product.find().skip(skip).limit(ITEMS_PER_PAGE);
        const totalCount = await Product.countDocuments();

        res.render('productmg', {
            items: products,
            totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching paginated products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

