//게시글 댓글에 좋아요 눌렀을 때 - OK
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
		//로그인 되었을 때 
			if(!(req.body.bcl_boardComment_id && req.body.bcl_user_id)){
				res.status(403).send({
					message : "please input board_id and user_id"
				});
			}else{
				let postcommentlikeQuery = 'INSERT INTO myjungnami.boardCommentLike(id, bcl_boardComment_id, bcl_user_id) VALUES (null, ?, ?)';
				let data = await db.queryParamCnt_Arr(postcommentlikeQuery, [req.body.bcl_boardComment_id, req.body.bcl_user_id]);

				res.status(200).send({
					"message" : "insert boardcommentlike success",
					"data" : data
				});

				var pushmsg = (req.body.bcl_user_id = '님이 회원님의 댓글을 좋아합니다.');

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

