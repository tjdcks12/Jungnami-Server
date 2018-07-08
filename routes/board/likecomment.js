//게시글 댓글에 좋아요 눌렀을 때 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


router.post('/', async(req, res) => {
	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		res.status(401).send({
			message : "Access Denied"
		});

		return;
	}

	var userid = chkToken.id;

	try{
		//로그인 되었을 때
		if(!(req.body.comment_id && req.body.user_id)){
			res.status(403).send({
				message : "please input comment id and user id"
			});
		}else{
			let postcommentlikeQuery = 'INSERT INTO myjungnami.boardCommentLike(id, bcl_boardComment_id, bcl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(postcommentlikeQuery, [req.body.comment_id, user_id]);

			res.status(201).send({
				"message" : "Successfully insert boardcommentlike"
			});

			var pushmsg = (userid = '님이 회원님의 댓글을 좋아합니다.');

			console.log(data);
		}

	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "Server error"
		});
	}
})

module.exports = router;
