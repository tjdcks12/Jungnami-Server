//게시판 글에 대댓글 달기 - OK
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
		
		if(!(req.body.br_boardComment_id && req.body.br_user_id && req.body.content)){
			res.status(403).send({
				message : "please input br_boardComment_id and br_user_id and content"
			});
		}else{
			let postmakerecommentQuery = 'INSERT INTO myjungnami.boardRecomment(id, br_boardComment_id, br_user_id, content) VALUES (null, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(postmakerecommentQuery, [req.body.br_boardComment_id, req.body.br_user_id, req.body.content]);

			res.status(200).send({
				"message" : "insert boardRecomment success",
				"data" : data
			});

			var pushmsg = (req.body.br_user_id + '님이 회원님의 글에 댓글을 남겼습니다.');
			
			console.log(data);
		}

		
	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "syntax error"
		});
	}
})

module.exports = router;