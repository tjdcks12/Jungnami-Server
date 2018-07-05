//게시판 글에 대댓글 달기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
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