//컨텐츠 댓글에 좋아요 
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.post('/', async(req, res) => {
	try{
		if(!(req.body.ccl_contentsComment_id && req.body.ccl_user_id)){
			res.status(403).send({
				message : "please input comments_id and user_id"
			});
		}else{
			let postcommentlikeQuery = 'INSERT INTO myjungnami.contentsCommentLike(id, ccl_contentsComment_id, ccl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(postcommentlikeQuery, [req.body.ccl_contentsComment_id, req.body.ccl_user_id]);

			res.status(200).send({
				"message" : "insert contents' comment like success",
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