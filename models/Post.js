var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  title:{type:String, required:true}, //required는 데이터 생성, 변경시에 반드시 필요
  body:{type:String, required:true},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, //작성자 / ~ObjectId 는 _id 담기위해 표시 / ref는 user 컬렉션을 가리키고 있음
  createdAt:{type:Date, default:Date.now}, //생성시간
  updatedAt:Date //수정시간
});
var Post = mongoose.model('post',postSchema);

module.exports = Post;
