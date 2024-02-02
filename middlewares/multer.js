const path = require('path');

const multer=require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + Date.now() + ext);
    },
  });
  
  const upload = multer({
    storage: storage,
  });

module.exports={upload};
