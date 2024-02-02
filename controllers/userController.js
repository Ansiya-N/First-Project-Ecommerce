const { Otp } = require("../model/otpSchema");
const { User } = require("../model/userSchema");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { Product } = require("../model/productSchema");
const { Category } = require("../model/categorySchema");
const {Address}=require("../model/addressSchema")


module.exports.profile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const category = await Category.find({ active: true });
    
    const address = await Address.findOne({userId: id});
console.log(address)
    const user = await User.findById(id);
    const selectedAddressId = req.query.selectedAddressId;
    if (!user) {
      
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    
    res.render('user/profile', { user: user, userAddresses: address,category:category,selectedAddressId });
  } catch (error) {
    console.error('Error in profile controller:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.editProfile=async(req,res)=>{
  try{
const id =req.session.user_id;
if(!id)
{
  res.status(400).send("invalid user id")
}
const user=await User.findById(id).exec()
if(!user)
{
  res.status(404).send("user not found")
}
res.render("user/editUserPage",{user:user})
}
  catch(error)
  {
    console.log(error.message)
  }
}

module.exports.updateProfile = async(req,res)=>{
  try{
const id=req.session.user_id;
if(!id)
{
  return res.status(400).send("invalid userid");
} 
const user = await User.findById(id);
if(!user){
  return res.status(404).send("user not found");
} 
const newData = await User.updateOne(
  {_id:id},
  {
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone
  }
) 
console.log(newData);
res.redirect("/profile")
}
  catch(error)
  {
    console.log(error.message);
  }
}




module.exports.editAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.id;

    console.log('UserID:', userId);
    console.log('AddressID:', addressId);

    const userAddress = await Address.findOne({ userId: userId });

    console.log('UserAddress:', userAddress);

    if (userAddress) {
      const addressToEdit = userAddress.addresses.id(addressId);

      console.log('AddressToEdit:', addressToEdit);

      if (addressToEdit) {
        return res.render('user/editAddressPage', { address: addressToEdit });
      } else {
        return res.status(400).send('Address not found');
      }
    } else {
      return res.status(400).send('User address not found');
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Internal server error');
  }
};





module.exports.changePasswordPage = async (req, res) => {
  try{
    const id =req.session.user_id;
    if(!id)
    {
      res.status(400).send("invalid user id")
    }
    const user=await User.findById(id).exec()
    if(!user)
    {
      res.status(404).send("user not found")
    }
    res.render("user/changePassword",{user:user})
    }
      catch(error)
      {
        console.log(error.message)
      }
    }
    
 

    module.exports. changePassword = async (req, res) => {
      try {
          const id = req.params.id; 
          const user = await User.findById(id);
  
          if (!user) {
              return res.status(404).send('User not found');
          }
  
          const newPassword = req.body.password;
          const confirmNewPassword = req.body.confirm_password;
  
          if (newPassword !== confirmNewPassword) {
              return res.status(400).send('New password and confirm new password do not match');
          }
  
    
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
     
          user.password = hashedNewPassword;
          await user.save();
  
          res.redirect('/profile'); 
      } catch (error) {
          console.error(error.message);
          res.status(500).send('Internal Server Error');
      }
  };
  
module.exports.signupUser = (req, res) => {try{
  let userAlertmsg;
    if(req.query.message){
userAlertmsg=req.query.message;
    }
  res.render("user/signup",{userAlertmsg});

}
catch (error) {
  console.error(error.message);
  res.status(500).send('Internal Server Error');
}
}

const generateOtp = () => {
  return otpGenerator.generate(6, { uppercase: false, specialChars: false });
};

const sendVerifyMail = async (fullname, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "anasansi275@gmail.com",
        pass: "cdno rtxa akxu qqwy",
      },
    });
    const mailOptions = {
      from: "anasansi275@gmail.com",
      to: email,
      subject: "For Verification Mail",
      html: `<p>Hi ${fullname},Your OTP:${otp}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:", info.response);
        console.log(otp);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};


module.exports.signup = async (req, res) => {
  try {
      const { name, email, phone, password } = req.body;

      const checkEmail = await User.findOne({ email: email });

      if (checkEmail) {
          res.redirect('/register?message=email already exists');
      } else {
         
          const addresses = [{
              fullName: req.body.addressFullName,
              houseAddress: req.body.addressHouse,
              locality: req.body.addressLocality,
              district: req.body.addressDistrict,
              pincode: req.body.addressPincode
          }];
          req.session.registerEmail = email;
          req.session.otp = generateOtp();
          req.session.userDetails = { name, email, phone, password, addresses };

          sendVerifyMail(name, email, req.session.otp);

         
          res.redirect(`/loadOtpPage?resend=${email}&name=${name}`);
      }
  } catch (error) {
      console.log(error.message);
  }
};



module.exports.verifyOtp = async (req, res) => {
  try {
      const userDetails = req.session.userDetails;
      const otp = req.body.otp;

      if (otp === req.session.otp) {
     
          const hashedPass = await bcrypt.hash(userDetails.password, 10);

          const user = new User({
              name: userDetails.name,
              email: userDetails.email,
              phone: userDetails.phone,
              password: hashedPass,
              addresses: userDetails.addresses,
              otp: req.session.otp
          });

        
          const userData = await user.save();

          
          res.redirect('/login');
      } else {
          res.status(400).send('Invalid OTP');
      }
  } catch (error) {
      console.log('Verify-otp try catch error:', error.message);
  }
};


module.exports.login = (req, res) => {try{
  res.render("user/login");
}
catch (error) {
  console.error(error.message);
  res.status(500).send('Internal Server Error');
}
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.find({});

    res.render("user/userForgotPass", { user: user });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.verifyLogin = async (req, res) => {
  try {
    const password = req.body.password;
     
   
    
    const user = await User.findOne({ email: req.body.email });
   
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (user.status === true) {
          req.session.destroy();
          return res.redirect("/blocked");
        }
        req.session.user_id = user._id;
        req.session.authenticated = true;

        const products = await Product.find().populate("category");
        return res.redirect("/home");
      } else {
        return res.redirect("/user/login");
      }
    } else {
      return res.redirect("/user/login");
    }
  } catch (error) {
    
    console.log(error.message);
  }
};


module.exports.home = async (req, res) => {
  try{
  const user = req.session.user_id;
  const id = req.params.id;

  const category = await Category.find({ active: true });

  
  
 
   
   const product = await Product.find().populate('category');
  
  

  res.render('user/home',  { category: category, user: user, product: product });
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }

};
module.exports.logout = (req, res) => {
  try{
  req.session.destroy();
  res.redirect("/");
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.userBlocked = (req, res) => {
  try{
  res.render("user/userBlockPage");
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.renderForgotPassword = (req, res) => {
  try{
  res.render("user/forgotPassword"); 
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.sendPasswordResetEmail = async (req, res) => {
  try {
    const emailDb = req.body.email;
    const user = await User.findOne({ email: emailDb });

    if (user) {
      
      const resetToken = generateOtp(); 
      req.session.otp = resetToken;
      console.log("New OTP:", resetToken);
      console.log("hello");
      sendVerifyMail(user.name, user.email, resetToken);

      user.otp = resetToken;
      await user.save();
     
      res.render("user/resetPassword", { user: user });
    }
  } catch (error) {
    console.log(error.message);
    
  }
};



module.exports.addNewPassword = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    if (user) {
      user.password = hashPassword;
      const saved = await user.save();
      console.log(user);

      if (saved) {
        res.redirect("/login");
      } else {
        console.log("New password not saved !");
      }
    } else {
      console.log("user not found");
    }
  } catch (error) {
    console.log(error.message);
  }
};



module.exports.handlePasswordReset = async (req, res) => {
  try {
    const id = req.params.id; 

   
    const user = await User.findOne({ _id: id });
console.log("is user her",user)
    if (user) {
      const email = req.body.email;
      const getotp = req.body.otp;
      const otp = req.session.otp;
      
      if (email && otp == getotp) {
        
        res.render("user/newPasswordAdd", { user });
      } else {
        res.status(400).send("Invalid email or OTP.");
      }
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.resendOtp2 = async (req, res) => {
  try {
    const email = req.query.email;
    const name = req.query.name;

   
    await Otp.deleteMany({ email: email });

    const generateOtp2 = () => {
      return otpGenerator.generate(6, {
        uppercase: false,
        specialChars: false,
      });
    };

   
    const otp2 = generateOtp2();

    
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      console.log("User not found with email:", email);
      return res.status(404).json({ error: "User not found with the given email." });
    }

    
    const otpDb = new Otp({
      email: email,
      otp: otp2,
    });
    await otpDb.save();

    console.log("Generated OTP:", otp2);

    // Send the verification email and wait for it to complete
    await sendVerifyMail(findUser.name, email, findUser._id, otp2);

    // Render the page after all asynchronous operations are completed
    res.render("user/otpPage", { data: { email, name } });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).json({ error: "An error occurred while resending OTP." });
  }
};
module.exports.otpPage = async(req,res)=> {
  try {
    
    const name = req.query.name,
     resend = req.query.resend;


res.render("user/otpPage", {  resend, name  });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).json({ error: "An error occurred while rendering otp page." });
  }
}

module.exports.verifyresendOtp = async(req,res)=> {
  try {
    const email = req.query.email,
    name = req.query.name,
    userDetails = req.session.userDetails

    otpForResend = generateOtp()
    req.session.otp = otpForResend

    sendVerifyMail(name,email,otpForResend);

    res.redirect(`/loadOtpPage?resend=${email}&name=${name}`)

  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).json({ error: "An error occurred while resending OTP." });
  }
}


