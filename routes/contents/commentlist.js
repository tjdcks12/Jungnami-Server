//컨텐츠에 달린 댓글 보여주기
var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

router.get('/:contents_id', async(req, res, next) => {
	const chkToken = jwt.verify(req.headers.authorization);

	var userid;
	if(chkToken == -1){
		userid = "";
	}
	else{
		userid = chkToken.id;
	}

	try{
		// 유저 댓글 좋아요 여부
		var islike = [];
		let select_islike =
		`
		SELECT ccl_contentsComment_id
		FROM contentsCommentLike
		WHERE ccl_user_id = ?
		`;
		let result_islike = await db.queryParamCnt_Arr(select_islike, [userid])
		for(var i=0; i<result_islike.length; i++){
			islike[i] = result_islike[i].ccl_contentsComment_id;
		}

		//유저 닉, 이미지, 시간, 컨텐츠, 좋아요, 대댓 수 출력
		let getcommentlistQuery =
		`
		select *
		from contentsComment
		left join
		(SELECT ccl_contentsComment_id, count(*) as cnt from contentsCommentLike GROUP BY ccl_contentsComment_id) as ccl
		on contentsComment.id = ccl.ccl_contentsComment_id
		where cc_contents_id = ?
		order by ccl.cnt desc, writingtime desc
		`;
		let commenttableInfo = await db.queryParamCnt_Arr(getcommentlistQuery, [req.params.contents_id]);
		//댓글 테이블에서 댓글 목록 받아와서
		if(commenttableInfo.length == 0){
			return next("1204");
		}

		let resultArry = [];

		let userinfoObj;
		let recommentCnt;
		let commentlikeCnt;

		for(var i=0; i<commenttableInfo.length; i++){
			let subresultObj = {}
			let timeset = checktime.checktime(commenttableInfo[i].writingtime);

			//유저닉네임이랑 이미지 사진
			let getuserinfoQuery =
			`
			select user.id, user.nickname, user.img_url
			from myjungnami.user
			where id = ?
			`;
			userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [commenttableInfo[i].cc_user_id]);

			//게시글 대댓글 갯수
			let getrecommentcntQuery =
			`
			select count(*) as recommentCnt
			from myjungnami.contentsRecomment
			where cr_contentsComment_id = ?
			`;
			recommentCnt = await db.queryParamCnt_Arr(getrecommentcntQuery, [commenttableInfo[i].id] );

			//댓글 좋아요 수
			let getlikecntQuery =
			`
			select count(*) as commentlikeCnt
			from myjungnami.contentsCommentLike
			where ccl_contentsComment_id = ?
			`;
			commentlikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [commenttableInfo[i].id]);

			subresultObj.commentid = commenttableInfo[i].id;
			subresultObj.timeset = timeset;
			subresultObj.content = commenttableInfo[i].content;
			subresultObj.user_id = userinfoObj[0].id;
			subresultObj.user_nick = userinfoObj[0].nickname;
			subresultObj.user_img = userinfoObj[0].img_url;
			subresultObj.recommentCnt = recommentCnt[0].recommentCnt;
			subresultObj.commentlikeCnt = commentlikeCnt[0].commentlikeCnt;

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
		console.log(err);
		return next("500");
	}
})

module.exports = router;
