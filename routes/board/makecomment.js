//게시판 글에 댓글 달기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;

router.post('/', async(req, res) => {
	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{
		let postmakecommentQuery =
		`
		INSERT INTO
		myjungnami.boardComment(id, bc_board_id, bc_user_id, content)
		VALUES (null, ?, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(postmakecommentQuery, [req.body.board_id, userid, req.body.content]);
		if(!data){
			return next("500");
		}

		// 게시글 작성자 데이터 가져오기
		let select_find =
		`
		SELECT *
		FROM board
		WHERE id = ?
		`
		let result_find = await db.queryParamCnt_Arr(select_find, [req.body.board_id] );

		if(userid != result_find[0].b_user_id){
			// push table에 insert
			bc_id = data.insertId;

			let pushSql =
			`
			INSERT INTO
			push (p_user_id, p_boardComment_id)
			VALUES (?, ?)
			`
			let pushQuery = await db.queryParamCnt_Arr(pushSql,[result_find[0].b_user_id, bc_id]);
			if(!pushQuery){
				return next("500");
			}

			// 유저이름 가져오기
			let select_user =
			`
			SELECT *
			FROM user
			WHERE id = ?
			`
			let result_user = await db.queryParamCnt_Arr(select_user, [userid] );

			var pushmsg = (result_user[0].nickname + '님이 회원님의 글에 댓글을 남겼습니다.');
			// client fcmToken 가져오기
			let select_fcmtoken =
			`
			SELECT fcmToken
			FROM user
			WHERE id = ?
			`;
			let result_fcmtoken = await db.queryParamCnt_Arr(select_fcmtoken, [result_find[0].b_user_id]);

			if(result_fcmtoken[0].fcmToken != null){
				var push_data = await get_pushdata.get_pushdata(result_fcmtoken[0].fcmToken, pushmsg);
				var fcm = new FCM(serverKey);

				fcm.send(push_data, function(err, response) {
					//console.log(push_data);
					if (err) {
						console.error('Push메시지 발송에 실패했습니다.');
						console.error(err);
						return;
					}

					console.log('Push메시지가 발송되었습니다.');
				});
			}
			else {
				console.log("No fcmToken");
			}
			// 푸쉬알람 끝
		}

		res.status(201).send({
			"message" : "Success"
		});


	}catch(err){
		console.log(err);
		return next("500");
		// res.status(500).send({
		// 	"message" : "Server error"
		// });
	}
})
module.exports = router;
