var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');  //i파일 위치 명

passport.serializeUser(function(user, done){  //serializeUser : session 생성 시에 어떠한 정보를 저장할지를 설정하는 것
  done(null,user.id);  //user 개체를 넘겨 받아 user.id를 session에 저장
});
passport.deserializeUser(function(id, done){ //deserializeUser : session으로 부터 개체를 어떻게 가져올 지 설정
  User.findById(id, function(err, user){ //현재 id를 넘겨받아 DB에서 user를 찾고 use을 가져옴
    done(err,user);
  });
});

//local strategy를 package로부터 가져옴
passport.use('local-login',  //strategy에 이름을 지어줌 -> 'local-login'
  new LocalStrategy({  //user 개체에서 username과 password를 찾아 읽음
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done){
    User.findOne({'email' : email}, function(err,user){  // user를 찾음
      if(err) return done(err);

      if(!user){
        req.flash("email", req.body.email);
        return done(null, false, req.flash('loginError', 'No user fuond.'));
      }
      if(!user.authenticate(password)){  //비밀번호 매치되는지 확인
        req.flash("email", req.body.email);
        return done(null, false, req.flash('loginError', 'Password does not Match'));
      }                                       //에러가 나면 flash로 보냄
      return done(null, user);
    });
  }
)
);
module.exports = passport;
