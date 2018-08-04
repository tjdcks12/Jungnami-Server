//컨텐츠 좋아요 -ok
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.post('/', async(req, res) => {
	var id; // 사용자 email

	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{ ////로그인 시 좋아요 처리

		let postcontentslikeQuery =
		`
		INSERT INTO
		myjungnami.contentsLike(id, cl_contents_id, cl_user_id)
		VALUES (null, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(postcontentslikeQuery, [req.body.contents_id, userid]);
		if(!data){
			return next("500");
		}

		res.status(201).send({
			"message" : "Success"
		});



	}catch(err){
		console.log(err);
		return next("500");
	}
})

module.exports = router;
