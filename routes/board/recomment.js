/*  커뮤니티 대댓글   */
/*  /board/recomment  */

var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;


/*  커뮤니티 대댓글 리스트 보여주기  */
/*  /board/recomment/:comment_id  */
router.get('/:comment_id', async(req, res, next) => {
	const chkToken = jwt.verify(req.headers.authorization);

	var userid;
	if(chkToken == -1){
		userid = "";
	}
	else{
		userid = chkToken.id;
	}

	try{
		// 유저 대댓글 좋아요 여부
		var islike = [];
		let select_islike =
		`
		SELECT brl_boardRecomment_id
		FROM boardRecommentLike
		WHERE brl_user_id = ?
		`;
		let result_islike = await db.queryParamCnt_Arr(select_islike, [userid])
		for(var i=0; i<result_islike.length; i++){
			islike[i] = result_islike[i].brl_boardRecomment_id;
		}

		let getrecommentlistQuery =
		`
		select *
		from boardRecomment
		left join (SELECT brl_boardRecomment_id, count(*) as cnt
		from boardRecommentLike GROUP BY brl_boardRecomment_id) as brl
		on boardRecomment.id = brl.brl_boardRecomment_id
		where br_boardComment_id = ?
		order by brl.cnt desc, writingtime desc
		`;
		let recommenttableInfo = await db.queryParamCnt_Arr(getrecommentlistQuery, [req.params.comment_id]);

		let resultArry = [];


		let userinfoObj;
		let recommentlikeCnt;

		for(var i=0; i< recommenttableInfo.length ; i++){
			let subresultObj = {};
			let timeset = checktime.checktime(recommenttableInfo[i].writingtime);

			//유저닉네임이랑 이미지 사진
			let getuserinfoQuery =
			`
			select nickname, img_url
			from myjungnami.user
			where id = ?
			`;
			userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [recommenttableInfo[i].br_user_id]);

			//좋아요 수
			let getlikecntQuery =
			`
			select count(*) as recommentlikeCnt
			from myjungnami.boardRecommentLike
			where brl_boardRecomment_id = ?
			`;
			recommentlikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [recommenttableInfo[i].id]);

			subresultObj.content = recommenttableInfo[i].content;
			subresultObj.timeset = timeset;
			subresultObj.user_nick = userinfoObj[0].nickname;
			subresultObj.user_img = userinfoObj[0].img_url;
			subresultObj.recommentlikeCnt = recommentlikeCnt[0].recommentlikeCnt;

			// 좋아요 여부 확인
			subresultObj.islike = 0;
			for(var j=0; j<islike.length; j++){
				if(recommenttableInfo[i].id == islike[j]){
					subresultObj.islike = 1;
				}
			}

			resultArry.push(subresultObj);
		}

		res.status(200).send({
			"message" : "Success",
			"data" : resultArry
		});

	}catch(err){
		return next("500");
	}
});


/*  커뮤니티 대댓글 작성하기  */
/*  /board/recomment  */
router.post('/', async(req, res, next) => {
	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{

		let postmakerecommentQuery =
		`
		INSERT INTO
		myjungnami.boardRecomment(id, br_boardComment_id, br_user_id, content)
		VALUES (null, ?, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(postmakerecommentQuery, [req.body.comment_id, userid, req.body.content]);
		if(!data){
			console.log(err);
			return next("500");
		}

		// 게시글 작성자 데이터 가져오기
		let select_find =
		`
		SELECT *
		FROM boardComment
		WHERE id = ?
		`
		let result_find = await db.queryParamCnt_Arr(select_find, [req.body.comment_id] );

		// 유저이름 가져오기
		let select_user =
		`
		SELECT *
		FROM user
		WHERE id = ?
		`
		let result_user = await db.queryParamCnt_Arr(select_user, [userid] );

		var pushmsg = (result_user[0].nickname  + '님이 회원님의 댓글에 답글을 남겼습니다.');
		// client fcmToken 가져오기
		let select_fcmtoken =
		`
		SELECT fcmToken
		FROM user
		WHERE id = ?
		`;
		let result_fcmtoken = await db.queryParamCnt_Arr(select_fcmtoken, [result_find[0].bc_user_id]);

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

		res.status(201).send({
			"message" : "Success"
		});

	}catch(err){
		console.log(err);
		return next("500");
	}
});


/*  커뮤니티 대댓글 삭제하기  */
/*  /board/recomment/:boardrecommentid  */
router.delete('/:boardrecommentid', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);
  
	if(chkToken == -1) {
	  return next("401");
	}
  
	let userid = chkToken.id;
  
	try{
		// board recomment 정보 가져오기
		let select_comment =
		`
		SELECT *
		FROM boardRecomment
		WHERE id = ?
		`;
		let result_comment = await db.queryParamCnt_Arr(select_comment,[req.params.boardrecommentid]);

		// id 비교
		if(userid == result_comment[0].br_user_id){
			let delete_comment =
			`
			DELETE
			FROM boardRecomment
			WHERE id = ?
			`;
			let result_delete = await db.queryParamCnt_Arr(delete_comment,[req.params.boardrecommentid]);
			if(!result_delete){
				console.log(err);
				return next("500");
			}

			res.status(200).send({
				"message" : "Success"
			});
		}
		else{
			return next("401");
		}
	}catch(err){
		console.log(err);
	  	return next("500");
	}
  
  });


module.exports = router;
