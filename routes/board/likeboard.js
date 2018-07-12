//커뮤니티 글에 좋아요 눌렀을 때  -> 로그인 처리까지  OK
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
		res.status(401).send({
			message : "Access Denied"
		});
	}

	var userid = chkToken.id;

	try{
		if(!req.body.board_id){
			res.status(403).send({
				message : "please input board_id and user_id"
			});

		}else{
			let postboardlikeQuery = 'INSERT INTO myjungnami.boardLike(id, bl_board_id, bl_user_id) VALUES (null, ?, ?)';
			let data = await db.queryParamCnt_Arr(postboardlikeQuery, [req.body.board_id, userid]);
			if(data == undefined){
				res.status(204).send({
					"message" : "fail insert"
				});

				return;
			}

			// 게시글 작성자 데이터 가져오기
			let select_find = 'SELECT * FROM board WHERE id = ?'
			let result_find = await db.queryParamCnt_Arr(select_find, [req.body.board_id] );
			if(result_find.length == 0){
				res.status(300).send({
							message: "No Data"
				});
				return;

			}
			// 유저이름 가져오기
			let select_user = 'SELECT * FROM user WHERE id = ?'
			let result_user = await db.queryParamCnt_Arr(select_user, [userid] );
			if(result_user.length == 0){
				res.status(300).send({
							message: "No Data"
				});
				return;
			}
			var pushmsg = (result_user[0].nickname += '님이 회원님의 글을 좋아합니다.');

			console.log(result_find[0].b_user_id);
			// client fcmToken 가져오기
			let select_fcmtoken = 'SELECT fcmToken FROM user WHERE id = ?';
			let result_fcmtoken = await db.queryParamCnt_Arr(select_fcmtoken, [result_find[0].b_user_id]);
			if(result_fcmtoken.length == 0){
				res.status(300).send({
							message: "No Data"
				});
				return;
			}

			if(result_fcmtoken[0].fcmToken != null){
				var push_data = await get_pushdata.get_pushdata(result_fcmtoken[0].fcmToken, pushmsg);
				console.log(result_fcmtoken[0].fcmToken);
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
				"message" : "Successfully insert boardlike "
			});

		}

	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "syntax error"
		});
	}
});

module.exports = router;
