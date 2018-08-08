//컨텐츠 대댓글 달기
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;

router.post('/', async(req, res, next) => {
	var id; // 사용자 email

	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{
		let contentsmakerecommentQuery =
		`
		INSERT INTO
		myjungnami.contentsRecomment(id, cr_contentsComment_id, cr_user_id, content)
		VALUES (null, ?, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(contentsmakerecommentQuery, [req.body.comment_id, userid, req.body.content]);
		if(!data){
			return next("500");
		}


		res.status(201).send({
			"message" : "Success"
		});

	}catch(err){
		return next("500");
	}
})


module.exports = router;
