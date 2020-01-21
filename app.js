var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var engine = require("ejs-locals");
const passport = require('passport')  
const session = require('express-session')  
const MongoStore = require('connect-mongo')(session)
const app = express();
/* view engine */
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
/* security */
require('./config/auth')(passport);
app.use(session({  
  store: new MongoStore({
    db: global.db,
    ttl: 40 * 60, // = 30 minutos de sessão
    collection:'session',
    url:process.env.MONGO_CONNECTION
  }),
  secret: '123',//configure um segredo seu aqui
  resave: false,
  saveUninitialized: false
}));
//midlewares
app.use(passport.initialize());
app.use(passport.session());
var compression = require("compression");
app.use(compression());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/export',express.static(path.resolve(__dirname,'views','partials')));
/* */
var fs = require('fs');
var pagesJson = JSON.parse(fs.readFileSync('pageManifest.json', 'utf8'));
var pcModel = require("./src/models/PageConfig.js")
generalConfig ={
  overview:{
    title: process.env.npm_package_config_title,
    url:process.env.npm_package_config_url,
    favico:process.env.npm_package_config_favico,
    description:process.env.npm_package_config_description,
    keywords:process.env.npm_package_config_keywords,
    landingPage:process.env.npm_package_config_landingPage,
    og:{
      image: "/images/teste3.jpg",
      imageType:"jpeg",
      imageWidth:"320" ,
      imageHeight:"320",
    }
  },
};
generalConfig.pages = {};
Object.keys(pagesJson).forEach(key => {
  var page = pagesJson[key];
  generalConfig.pages[page.title.toLowerCase()]=new pcModel.PageConfig(page.title,page.href,page.rootColl,page.view,{view:page.admin,ico:pcModel.icons[page.type]},page.type)
})
console.log(generalConfig.pages)
/* _routes */



var index = require('./routes/index.js');
app.use(index);
var user = require("./routes/user.js")
app.use(user)

















// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error-view');
});
module.exports = app;
