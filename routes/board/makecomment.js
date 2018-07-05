//게시판 글에 댓글 달기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
	try{
		if(!(req.body.bc_board_id && req.body.bc_user_id && req.body.content)){
			res.status(403).send({
				message : "please input bc_board_id and bc_user_id and content"
			});
		}else{
			let postmakecommentQuery = 'INSERT INTO myjungnami.boardComment(id, bc_board_id, bc_user_id, content) VALUES (null, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(postmakecommentQuery, [req.body.bc_board_id, req.body.bc_user_id, req.body.content]);

			res.status(200).send({
				"message" : "insert postmakecommentQuery success",
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