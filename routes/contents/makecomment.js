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
		res.status(401).send({
			message : "Access Denied"
		});

		return;
	}

	var userid = chkToken.id;

	try{

		if(!(req.body.contents_id && userid && req.body.content)){
			res.status(403).send({
				message : "please input contents id & use rid & content"
			});
		}else{
			let contentsmakecommentQuery = 'INSERT INTO myjungnami.contentsComment(id, cc_contents_id, cc_user_id, content) VALUES (null, ?, ?, ?)';
			let data = await db.queryParamCnt_Arr(contentsmakecommentQuery, [req.body.contents_id, userid, req.body.content]);
			if(data == undefined){
				res.status(204).send({
					"message" : "fail insert"
				});

				return;
			}

			res.status(201).send({
				"message" : "insert contents' comment success",
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
