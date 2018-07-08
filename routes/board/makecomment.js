//게시판 글에 댓글 달기 - OK
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

	try{
		
		if(!(req.body.board_id && req.body.user_id && req.body.content)){
			res.status(403).send({
				message : "please input board id & user id & content"
			});
		}else{
			let postmakecommentQuery = 'INSERT INTO myjungnami.boardComment(id, bc_board_id, bc_user_id, content) VALUES (null, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(postmakecommentQuery, [req.body.board_id, req.body.user_id, req.body.content]);

			res.status(201).send({
				"message" : "Successfully insert postmakecommentQuery"
			});

			var pushmsg = (req.body.user_id + '님이 회원님의 글에 댓글을 남겼습니다.');

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