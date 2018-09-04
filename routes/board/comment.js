/*  커뮤니티 댓글   */
/*  /board/comment  */

var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime');

var FCM = require('fcm-node');
const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;


/*  커뮤니티 댓글 리스트 보여주기  */
/*  /board/comment/:board_id/:pre  */
router.get('/:board_id/:pre', async(req, res, next) => {
	const chkToken = jwt.verify(req.headers.authorization);

	var userid;
	let pre =+ req.params.pre;  // commentid
	let number = 3;

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
		SELECT bcl_boardComment_id
		FROM boardCommentLike
		WHERE bcl_user_id = ?
		`;
		let result_islike = await db.queryParamCnt_Arr(select_islike, [userid])
		for(var i=0; i<result_islike.length; i++){
			islike[i] = result_islike[i].bcl_boardComment_id;
		}

		//유저 닉, 이미지, 시간, 컨텐츠, 좋아요, 대댓 수 출력
		let getcommentlistQuery =
		`
		select *
		from boardComment
		left join (SELECT bcl_boardComment_id, count(*) as cnt from boardCommentLike GROUP BY bcl_boardComment_id) as bcl
		on boardComment.id = bcl.bcl_boardComment_id
		where bc_board_id = ? order by bcl.cnt desc, writingtime desc
		`;
		let commenttableInfo = await db.queryParamCnt_Arr(getcommentlistQuery, [req.params.board_id]);
		//댓글 테이블에서 댓글 목록 받아와서

		let resultArry = [];

		let userinfoObj;
		let recommentCnt;
		let commentlikeCnt;

		for(var i=0; i< commenttableInfo.length; i++){

			let subresultObj = {};
			let timeset = checktime.checktime(commenttableInfo[i].writingtime);

			/* by Jiyeon */
			// console.log(commenttableInfo[i].id)
			// if(number <= 0)
			// 	break;
			// else if(commenttableInfo[i].id >= pre)
			// 	continue;
		
			// console.log(number)
			// number--;

			//유저닉네임이랑 이미지 사진
			let getuserinfoQuery =
			`
			select user.id, user.nickname, user.img_url
			from myjungnami.user
			where id = ?
			`;
			userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [commenttableInfo[i].bc_user_id]);

			//게시글 대댓글 갯수
			let getrecommentcntQuery =
			`
			select count(*) as recommentcnt
			from myjungnami.boardRecomment
			where br_boardComment_id = ?
			`;
			recommentCnt = await db.queryParamCnt_Arr(getrecommentcntQuery, [commenttableInfo[i].id] );

			//댓글 좋아요 수
			let getlikecntQuery =
			`
			select count(*) as commentcnt
			from myjungnami.boardCommentLike
			where bcl_boardComment_id = ?
			`;
			commentlikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [commenttableInfo[i].id]);

			subresultObj.commentid = commenttableInfo[i].id;
			subresultObj.timeset = timeset;
			subresultObj.content = commenttableInfo[i].content;
			subresultObj.user_id = userinfoObj[0].id;
			subresultObj.user_nick = userinfoObj[0].nickname;
			subresultObj.user_img = userinfoObj[0].img_url;
			subresultObj.recommentCnt = recommentCnt[0].recommentcnt;
			subresultObj.commentlikeCnt = commentlikeCnt[0].commentcnt;

			// 좋아요 여부 확인
			subresultObj.islike = 0;
			for(var j=0; j<islike.length; j++){
				if(commenttableInfo[i].id == islike[j]){
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


/*  커뮤니티 댓글 작성하기  */
/*  /board/comment  */
router.post('/', async(req, res, next) => {
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
			console.error(err);
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
				console.error(err);
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
		console.error(err);
		return next("500");
	}
});


/*  커뮤니티 댓글 삭제하기  */
/*  /board/comment/:boardcommentid  */
router.delete('/:boardcommentid', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);
  
	if(chkToken == -1) {
	  return next("401");
	}
  
	let userid = chkToken.id;
  
	try{
		// board comment 정보 가져오기
		let select_comment =
		`
		SELECT *
		FROM boardComment
		WHERE id = ?
		`;
		let result_comment = await db.queryParamCnt_Arr(select_comment,[req.params.boardcommentid]);

		// id 비교
		if(userid == result_comment[0].bc_user_id){
			let delete_comment =
			`
			DELETE
			FROM boardComment
			WHERE id = ?
			`;
			let result_delete = await db.queryParamCnt_Arr(delete_comment,[req.params.boardcommentid]);
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
