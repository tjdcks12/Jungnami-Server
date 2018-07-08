//컨텐츠 대댓글 달기 
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
		if(!(req.body.comment_id && req.body.user_id && req.body.content)){
			res.status(403).send({
				message : "please input contents' comment id & user id & content"
			});
		}else{
			let contentsmakerecommentQuery = 'INSERT INTO myjungnami.contentsRecomment(id, cr_contentsComment_id, cr_user_id, content) VALUES (null, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(contentsmakerecommentQuery, [req.body.comment_id, req.body.user_id, req.body.content]);

			res.status(201).send({
				"message" : "Successfully insert contents' recomment",
				"data" : data
			});

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