/*  커뮤니티 대댓글 좋아요   */
/*  /board/recomment/like  */

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;


/*  커뮤니티 대댓글 좋아요 하기  */
/*  /board/recomment/like  */
router.post('/', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{
		let postrecommentlikeQuery =
		`
		INSERT INTO
		myjungnami.boardRecommentLike(id, brl_boardRecomment_id, brl_user_id)
		VALUES (null, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(postrecommentlikeQuery, [req.body.recomment_id, userid]);
		if(!data){
			console.log(err);
			return next("500");
		}

		// 게시글 작성자 데이터 가져오기
		let select_find =
		`
		SELECT *
		FROM boardRecomment
		WHERE id = ?
		`
		let result_find = await db.queryParamCnt_Arr(select_find, [req.body.recomment_id] );

		if(userid != result_find[0].br_user_id){
			// push table에 insert
			brl_id = data.insertId;

			let pushSql =
			`
			INSERT INTO
			push (p_user_id, p_boardRecommentLike_id)
			VALUES (?, ?);
			`
			let pushQuery = await db.queryParamCnt_Arr(pushSql,[result_find[0].br_user_id, brl_id]);
			if(!pushQuery){
				console.log(err);
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
			var pushmsg = (result_user[0].nickname += '님이 회원님의 댓글을 좋아합니다.');

			// client fcmToken 가져오기
			let select_fcmtoken =
			`
			SELECT fcmToken
			FROM user
			WHERE id = ?
			`;
			let result_fcmtoken = await db.queryParamCnt_Arr(select_fcmtoken, [result_find[0].br_user_id]);

			if(result_fcmtoken[0].fcmToken != null){
				var push_data = await get_pushdata.get_pushdata(result_fcmtoken[0].fcmToken, pushmsg);
				var fcm = new FCM(serverKey);

				fcm.send(push_data, function(err, response) {
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
	}
});


/*  커뮤니티 대댓글 좋아요 취소하기  */
/*  /board/recomment/like/:boardrecommentid  */
router.delete('/:boardrecommentid', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);
  
	if(chkToken == -1) {
	  return next("401");
	}
  
	let userid = chkToken.id;
  
	try{
		let delete_like =
		`
		DELETE
		FROM boardRecommentLike
		WHERE brl_boardRecomment_id = ? AND brl_user_id = ?
		`;
		let result_delete = await db.queryParamCnt_Arr(delete_like,[req.params.boardrecommentid, userid]);
		if(!result_delete){
			console.log(err);
			return next("500");
		}

		res.status(200).send({
			"message" : "Success"
		});
  
	}catch(err){
		console.log(err);
	  	return next("500");
	}
  
  });

module.exports = router;
