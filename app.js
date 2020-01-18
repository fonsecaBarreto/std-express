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
    ttl: 30 * 60, // = 30 minutos de sessão
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


var PageConfig = require("./src/models/PageConfig.js")
generalConfig ={
  overview:{
    title: process.env.npm_package_config_title,
    url:process.env.npm_package_config_url,
    favico:process.env.npm_package_config_favico,
    description:process.env.npm_package_config_description,
    keywords:process.env.npm_package_config_keywords,
    og:{
      image: process.env.npm_package_config_og_image,
      imageType:process.env.npm_package_config_og_imageType,
      imageWidth:process.env.npm_package_config_og_imageWidth ,
      imageHeight:process.env.npm_package_config_og_imageHeight,
    }
  },
  rootRedirect:process.env.npm_package_config_rootRedirect, // /manutence when in prod 
  pages:{
    home: new PageConfig("Home","/home","artigos-contents","home-view",{view:'admin-home-view',ico:"/images/padrao/global.png"}),
    artigos: new PageConfig("Artigos","/artigos","artigos-contents","home-view",{view:'admin-artigos-view',ico:"/images/padrao/feed.png"})
  }
};
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
