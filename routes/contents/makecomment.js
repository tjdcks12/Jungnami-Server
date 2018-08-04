//컨텐츠에 댓글 달기
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

	try{
		let contentsmakecommentQuery =
		`
		INSERT INTO
		myjungnami.contentsComment(id, cc_contents_id, cc_user_id, content)
		VALUES (null, ?, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(contentsmakecommentQuery, [req.body.contents_id, userid, req.body.content]);
		if(!data){
			return next("500");
		}

		res.status(201).send({
			message : "Success"
		});

	}catch(err){
		return next("500");
	}
})

module.exports = router;
