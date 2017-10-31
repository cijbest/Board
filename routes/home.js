var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('../config/passport.js');


//로그인
router.get('/', function(req, res){ //root route 설정, 자동으로 게시판으로 이동
  res.redirect('/posts');
});

router.get('/login', function(req, res){  //login form이 있는 view를 불러오는 route
  res.render('login/login', {email:req.flash("email")[0], loginError:req.flash('loginError')});
});                                                       //로그인 시 에러가 있으면 flash로 보냈던 에러를 가져와서 뷰로 보냄

router.post('/login',   //login form에서 받은 정보로 로그인을 실행
  function(req, res, next){
    req.flash("email");  //flash에 남아 있는 email을 지운
    if(req.body.email.length === 0 || req.body.password.length === 0){ //form을 다 작성하지 않으면 에러
      req.flash("email", req.body.email);
      req.flash("loginError", "Please enter both email and password.");
      res.redirect('/login');
    }else{
      next();
    }
  }, passport.authenticate('local-login', { //login 성공/실패 했을 때의 이동경로
    successRedirect : '/posts',
    failureRedirect : '/login',
    failureFlash : true
  })
);
router.get('/logout', function(req, res){
  req.logout();  //로그아웃 함수를 제공해 줌
  res.redirect('/');
});

module.exports = router;
