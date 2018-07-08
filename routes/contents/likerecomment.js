//컨텐츠 대댓글 좋아요 
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
		if(!(req.body.recomment_id && req.body.user_id)){
			res.status(403).send({
				message : "please input recomment id and user id"
			});
		}else{
			let contentsRecommentlikeQuery = 'INSERT INTO myjungnami.contentsRecommentLike(id, crl_contentsRecomment_id, crl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(contentsRecommentlikeQuery, [req.body.recomment_id, req.body.user_id]);

			res.status(201).send({
				"message" : "Successfully insert contents' comment like"
			});

			var pushmsg = (req.body.user_id = '님이 회원님의 댓글을 좋아합니다.');

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