const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const nocache = require("nocache");
const db =require('./db/mongoose')


const flash = require('connect-flash');


const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/user');

const app = express();
dotenv.config()
// mongoose.connect
app.use(nocache());

app.use(session({
  secret: "Secret key",
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 500000000
  }
}))


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);


app.use(flash());

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user', express.static(path.join(__dirname, 'public')));

// Define routes
app.use('/admin', adminRouter);
app.use('/', usersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
});