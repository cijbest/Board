var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");  //비밀번호 암호화

var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  nickname: {type:String, required:true, unique:true}, //unique : data 생성, 수정시에 이 스키마의 다른 자료들을 비교하여 동일한 값의 자료가 있으면 생성, 수정을 하지 않고 에러를 보냄
  password: {type:String, required:true},
  createdAt: {type:Date, default:Date.now}
});
userSchema.pre("save", function(next){  //User모델이 save되기 전(pre)에 모델에 대해 할 일을 schema에 저장(데이터베이스에 저장되기 전에 해야할 일들)
  var user = this;
  if(!user.isModified("password")){  //isModified : ()안의 속성이 db상의 값과 차이가 있는지를 보는 함수
    return next();
  } else{
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

//model setting
/*userSchema.methods.hash = function(password){
  return bcrypt.hashSync(password);
};*/
userSchema.methods.authenticate = function(password){
  var user = this;
  return bcrypt.compareSync(password, user.password); //현재 password와 입력받은 password와 비교한 후  true 또는 false 반환
};   //db에 hash가 저장되므로 이젠 user.authenticate()를 사용해야 함
var User = mongoose.model('user', userSchema);

module.exports = User;
