var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = require('../models/Post');

//게시판
router.get('/', function(req, res){ //get-> 브라우저 주소창으로 접속
  Post.find({}).populate("author").sort('-createdAt').exec(function(err, posts){
                //sort : 늦게 작성된 데이터가 위쪽으로 오게 함
                // -를 붙인 이유 : 역방향
                //populate : ref인 user object를 찾아서 author를 치환 (반드시 reference가 있어야 하는 이유)
    if(err) return res.json({success:false, message:err});
    res.render("posts/index", {posts:posts, user:req.user});  //req.user : 로그인이 되어있는지 확인하기 위해 정보 보냄
  });
}); // index

router.get('/new', isLoggedIn, function(req,res){
  res.render("posts/new", {user:req.user});
});//new

router.post('/', isLoggedIn, function(req,res){
  req.body.post.author = req.user._id;
  Post.create(req.body.post, function(err,post){  //new.ejs에서 class=post의 데이터를 생성한 후 게시판으로 돌아감
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');  //데이터 생성 후 다시 게시판으로 돌아오게 하는 것
  });
}); //create
router.put('/:id',isLoggedIn, function(req, res){
  req.body.post.updatedAt = Date.now();
  Post.findOneAndUpdate({_id:req.params.id, author:req.user._id}, req.body.post, function(err, post){  //게시글을 찾되, 검색 조건에 _id와 작성자를 동시에 검색
    if(err) return res.json({success:false, message:err});                                             //일치하면 수정 이루어 지고 일치하지 않으면 에러(DB를 한번한 접근)
    if(!post) return res.json({success:false,message:"No data found to update"});
    res.redirect('/posts/'+req.params.id);
  });
});// update

router.delete('/:id', isLoggedIn,function(req, res){
  Post.findOneAndRemove({_id:req.params.id, author:req.user._id}, function(err,post){  //게시글을 찾되, 검색 조건에 _id와 작성자를 동시에 검색
    if(err) return res.json({success:false, message:err});                             //일치하면 삭제가 이루어 지고 일치하지 않으면 에러(DB를 한번한 접근)
    if(!post) return res.json({success:false, message:"No data found to delete"});
    res.redirect('/posts');
  });
}); //destroy

router.get('/:id', function(req, res){
  Post.findById(req.params.id).populate("author").exec(function(err, post){ //populate -> 로그인된 user가 일치하는 경우에만 수정, 삭제 버튼 보여줌
    if(err) return res.json({success:false, message:err});
    res.render("posts/show", {post:post, user:req.user});
  });
});//show

router.get('/:id/edit', isLoggedIn, function(req,res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    if(!req.user._id.equals(post.author)) return res.json({success:false, message:"Unauthorized Attempt"});  //_id는 오브젝트라서 equals로 비교 해주어야 함
    res.render("posts/edit", {post:post, user:req.user}); // render : 템플릿 컴파일
  });
});  //edit

//function(현재 로그인이 되어 있는 상태인지 아닌지르 알려주는 함수)
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next(); //로그인이 되어있으면 다음 화면으로
  }
  res.redirect('/');  //로그인이 안 되어 있으면 시작화면으로
}

module.exports = router;
