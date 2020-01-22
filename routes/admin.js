var router = require('express').Router();
var passport = require('passport');
var ObjectId = require('mongodb').ObjectID;
var indexController = require('../src/indexController');
const mongoClient = require("mongodb").MongoClient;


function authenticationMiddleware () {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {console.log("AUTHENTIFICADO");return next()
    }res.redirect('/login')
  }
}
/* administrativo */

router.get('/logout', function(req,res){
  console.log("> LOGOUT!!")
  req.logOut();
  req.session.destroy(function (err) {
  res.redirect('/'); //Inside a callback… bulletproof!
  });
});
router.get('/login', function(req, res){
  if(req.query.fail)
    res.render('adm-login-view', { message: 'Usuário e/ou senha incorretos!' });
  else
    res.render('adm-login-view', { message: null});
});
router.post('/login',passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login?fail=true' }));

router.get("/admin/:sub?",authenticationMiddleware(),async function(req,res,next){
  
  var sub = req.params.sub;
  console.log("whaaat???",sub);
  if(sub != undefined){
    var pagina = generalConfig.pages[sub];
     try{
      if(pagina != undefined){
        res.render(pagina.admin.view,
        {
          overview: {title,url}=generalConfig.overview,
          self: pagina,
          pages: generalConfig.pages
        }); 
      }
    }catch(err){next()}
  }else{
    res.redirect(`/admin/home`)
  }
 
 });


 module.exports = router;