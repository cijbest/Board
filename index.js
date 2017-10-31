var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var bodyParser = require('body-parser');  //POST 요청 데이터를 추출, form으로 전송된 data를 사용하기 위해서
var methodOverride = require('method-override');
var session = require('express-session');
var flash = require('connect-flash');

//connect database
mongoose.connect("mongodb://cijbest:123456789@ds145178.mlab.com:45178/cijbest");
var db = mongoose.connection;
db.once("open", function(){
  console.log('DB connected!');
});
db.on("error", function(err){
  console.log("DB ERROR : ", err);
});



//view setting
app.set("view engine", 'ejs');

//set middlewqres
app.use(express.static(path.join(__dirname,'public')));  //html 파일 있던거

app.use(bodyParser.json()); //모든 서버에 도착하는 신호들의 body를 JSON으로 분석
                            //미들웨어(라우터 들어가기 전에 수행하는 명령어) : app.use
app.use(bodyParser.urlencoded({extended:true})); //웹사이트가 JSON으로 데이터를 전송 할 경우 받는 bodyParser

app.use(methodOverride("_method"));

app.use(flash());

app.use(session({secret:'MySecret'})); //session : 로그인을 유지시키기 위해 사용 / secret : session을 암호화 할 때 사용되는 비밀 hash키 값

//passport
var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// router
app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));

//start server
app.listen(3000, function(){
  console.log('Server On!');
});









/*
app.get('/posts', function(req, res){ //get-> 브라우저 주소창으로 접속
  Post.find({}, function(err, posts){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:posts});
  });
}); // index
app.post('/posts', function(req,res){
  Post.create(req.body.post, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
}); //create
app.get('/posts/:id', function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, data:post});
  });
});  //show
app.put('/posts/:id', function(req, res){
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id+" updated"});
  });
});// update

app.delete('/posts/:id', function(req, res){
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndRemove(req.params.id, function(err,post){
    if(err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id+" updated"});
  });
});   //destroy
*/
