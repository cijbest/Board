var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var async = require('async');

//set user routes
router.get('/users/new', function(req,res){
  res.render('users/new', {
    formData: req.flash('forData')[0],
    emailError: req.flash('emailError')[0],
    nicknameError: req.flash('nicknameError')[0],
    passwordError: req.flash('passwordError')[0]
  }
);
}); //new

router.post('/users', checkUserRegValidation, function(req, res, next){ //checkUserRegValidation : email과 nickname이 겹치는지를 알려줌
  User.create(req.body.user, function(err, user){
    if(err) return res.json({success:false, message:err});
    res.redirect('/login');
  });
});  //create

router.get('/users/:id', isLoggedIn, function(req, res){  //user의 프로필을 보여주기 위한 라우터 / isLoggedIn : 로그인 된 유저만 사용 가능하도록 설정
  User.findById(req.params.id, function(err, user){
    if(err) return res.json({success:false, message:err});
    res.render("users/show", {user:user});
  });
}); //show

//정보 수정
router.get('/users/:id/edit', isLoggedIn, function(req, res){
  if(req.user._id != req.params.id) return res.json({success:false, message:"Unauthrized Attempt"});  //남의 정보를 읽을 수는 있으나 수정을 못 하도록 설정
  User.findById(req.params.id, function(err, user){
    if(err) return res.json({success:false, message:err});
    res.render("users/edit", {
            user : user,
            formData : req.flash('formData')[0],
            emailError : req.flash('emailError')[0],
            nicknameError : req.flash('nicknameError')[0],
            passwordError : req.flash('passwordError')[0]
            }
    );
  });
});//edit

router.put('/users/:id', isLoggedIn, checkUserRegValidation, function(req, res){
  if(req.user._id != req.params.id) return res.json({success:false, message:"Unauthrized Attempt"});
  User.findById(req.params.id, req.body.user, function(err, user){
    if(err) return res.json({success:"false", message:err});
    if(user.authenticate(req.body.user.password)){
      if(req.body.user.newPassword){
        req.body.user.password = user.hash(req.body.user.newPassword);
      } else{
        delete req.body.user.password;
      }
      User.findByIdAndUpdate(req.params.id, req.body.user, function(err,user){
        if(err) return res.json({success:"false", message:err});
        res.redirect('/users/'+req.params.id);
      });
    } else{
      req.flash("formData", req.body.user);
      req.flash("passwordError", "-Invalid password");
      res.redirect('/users/'+req.params.id+"/edit");
    }
  });
});   //update

//function(email는 같으나 id이 다른 경우)
function checkUserRegValidation(req,res,next){
  var isValid = true;

  async.waterfall(
    [function(callback){
      User.findOne({email:req.body.user.email, _id:{$ne: mongoose.Types.ObjectId(req.params.id)}},
        function(err, user){
          if(user){
            isValid = false;
            req.flash("emailError","- This email is already resistered.");
          }
          callback(null, isValid);
        }
      );
    }, function(isValid, callback){
      User.findOne({nickname: req.body.user.nickname, _id:{$ne: mongoose.Types.ObjectId(req.params.id)}},
        function(err, user){
          if(user){
            isValid = false;
            req.flash("nicknameError", " -This nickname is already resistered.");
          }
          callback(null, isValid);
        }
      );
    }], function(err, isValid){
      if(err) return res.json({success:"false", message:err});
      if(isValid){
        return next();
      } else {
        req.flash("formData", req.body.user);
        res.redirect("back");
      }
    }
  );
}
