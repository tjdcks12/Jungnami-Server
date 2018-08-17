/*  커뮤니티 댓글 리스트  */
/*  /board/commentlist  */

//커뮤니티 글에 달린 댓글 리스트 보여주기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime');

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
})

module.exports = router;
