//게시글 대댓글에 좋아요 눌었을 때 -> OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
	try{
		if(!(req.body.brl_boardRecomment_id && req.body.brl_user_id)){
			res.status(403).send({
				message : "please input brl_boardRecomment_id and brl_user_id"
			});
		}else{
			let postrecommentlikeQuery = 'INSERT INTO myjungnami.boardRecommentLike(id, brl_boardRecomment_id, brl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(postrecommentlikeQuery, [req.body.brl_boardRecomment_id, req.body.brl_user_id]);

			res.status(200).send({
				"message" : "insert boardRecommentlike success",
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

