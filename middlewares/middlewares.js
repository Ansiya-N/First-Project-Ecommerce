const { User } = require("../model/userSchema");

module.exports.blockChecker = async (req, res, next) => {
  try {
    const user = req.session.user_id;

    if (user) {
      const userDb = await User.findOne({ _id: user });

      if (userDb.status === true) {
        console.log('User is blocked'); 
        return res.render('user/blocked', { errorMessage: 'You are blocked.' });
      }
    }

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports.UserLoginChecker = (req, res, next) => {
  if (req.session.user_id && req.session.authenticated) {
    return res.redirect("/home");
  } else {
    next();
  }
};

/*
// Example admin check middleware
module.exports. adminCheckMiddleware = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    // User is an admin, allow access to the admin dashboard
    next();
  } else {
    // User is not an admin, redirect or take other actions
    res.redirect('/login'); // Redirect to login page, for example
  }
};*/


module.exports.userLogedOrNot = async(req,res,next)=>{
  try {
    if(req.session.user_id){
      next()
    }else{
      res.redirect('/register');
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports.adminSessionCheck = (req,res,next)=>{
  try {
    if(req.session.Admin){
      res.redirect('/admin/dashboard');
     
    }else{
      next();
    }
  } catch (error) {
    
  }
}

module.exports.blocked = async(req,res)=>{
  try{
res.render('user/blocked');
  }
  catch (error) {
    console.error("Error in blocking user:", error);
      }
}