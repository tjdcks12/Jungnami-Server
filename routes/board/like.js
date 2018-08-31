/*  커뮤니티 글 좋아요  */
/*  /board/like  */

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;


/*  커뮤니티 글 좋아요 하기  */
/*  /board/like  */
router.post('/', async(req, res, next) => {
	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{
		let postboardlikeQuery =
		`
		INSERT INTO
		myjungnami.boardLike(id, bl_board_id, bl_user_id)
		VALUES (null, ?, ?)`;
		let data = await db.queryParamCnt_Arr(postboardlikeQuery, [req.body.board_id, userid]);
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
			bl_id = data.insertId;

			let pushSql =
			`
			INSERT INTO
			push (p_user_id, p_boardLike_id)
			VALUES (?, ?)
			`
			let pushQuery = await db.queryParamCnt_Arr(pushSql,[result_find[0].b_user_id, bl_id]);
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
			var pushmsg = (result_user[0].nickname += '님이 회원님의 글을 좋아합니다.');

			// client fcmToken 가져오기
			let select_fcmtoken =
			`
			SELECT fcmToken
			FROM user
			WHERE id = ?
			`
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
		return next("500");
	}
});


/*  커뮤니티 글 좋아요 취소하기  */
/*  /board/like  */
router.delete('/:boardid', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);
  
	if(chkToken == -1) {
	  return next("401");
	}
  
	let userid = chkToken.id;
  
	try{
	  let delete_like =
	  `
	  DELETE
	  FROM boardLike
	  WHERE bl_board_id = ? AND bl_user_id = ?
	  `;
	  let result_delete = await db.queryParamCnt_Arr(delete_like,[req.params.boardid, userid]);
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
