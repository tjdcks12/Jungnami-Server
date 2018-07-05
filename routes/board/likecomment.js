//게시글 댓글에 좋아요 눌렀을 때 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
	try{
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

