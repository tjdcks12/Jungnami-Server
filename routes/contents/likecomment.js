//컨텐츠 댓글에 좋아요
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.post('/', async(req, res) => {
	var id; // 사용자 email

	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		res.status(401).send({
			message : "Access Denied"
		});

		return;
	}

	var userid = chkToken.id;

	try{
		if(!(req.body.comment_id && userid)){
			res.status(403).send({
				message : "please input comments' id and user id"
			});
		}else{
			let contentscommentlikeQuery = 'INSERT INTO myjungnami.contentsCommentLike(id, ccl_contentsComment_id, ccl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(contentscommentlikeQuery, [req.body.comment_id, userid]);

			res.status(201).send({
				"message" : "Successfully insert contents' comment like",
				"data" : data
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
