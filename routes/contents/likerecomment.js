//컨텐츠 대댓글 좋아요
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
		// res.status(401).send({
		// 	message : "Access Denied"
		// });
		//
		// return;
	}

	var userid = chkToken.id;

	try{
		if(req.body.recomment_id == undefined){
			return next("1403");
			// res.status(403).send({
			// 	message : "please input recomment id and user id"
			// });
		}else{
			let contentsRecommentlikeQuery =
			`
			INSERT INTO
			myjungnami.contentsRecommentLike(id, crl_contentsRecomment_id, crl_user_id)
			VALUES (null, ?, ?)
			`;
			let data = await db.queryParamCnt_Arr(contentsRecommentlikeQuery, [req.body.recomment_id, userid]);

			// 작성자 데이터 가져오기
			let select_find =
			`
			SELECT *
			FROM contentsRecomment
			WHERE id = ?
			`
			let result_find = await db.queryParamCnt_Arr(select_find, [req.body.recomment_id] );

			// 유저이름 가져오기
			let select_user =
			`
			SELECT *
			ROM user
			WHERE id = ?
			`
			let result_user = await db.queryParamCnt_Arr(select_user, [userid] );

			var pushmsg = (result_user[0].nickname += '님이 회원님의 댓글을 좋아합니다.');

			// client fcmToken 가져오기
			let select_fcmtoken =
			`
			SELECT fcmToken
			FROM user
			WHERE id = ?
			`;
			let result_fcmtoken = await db.queryParamCnt_Arr(select_fcmtoken, [result_find[0].cr_user_id]);


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
					console.log(response);
				});
			}
			else {
				console.log("No fcmToken");
			}
			// 푸쉬알람 끝

			res.status(201).send({
				"message" : "Success"
			});

			var pushmsg = (userid = '님이 회원님의 댓글을 좋아합니다.');
		}

	}catch(err){
		return next("500");
		// console.log(err);
		// res.status(500).send({
		// 	"message" : "Server error"
		// });
	}
})


module.exports = router;
