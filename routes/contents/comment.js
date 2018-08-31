/*  컨텐츠 댓글   */
/*  /contents/comment  */

var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');


/*  컨텐츠 댓글 리스트 보여주기  */
/*  /contents/comment/:contents_id  */
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
		SELECT *
		FROM contentsComment
		LEFT JOIN
			(SELECT ccl_contentsComment_id, count(*) as cnt from contentsCommentLike GROUP BY ccl_contentsComment_id) as ccl
			ON contentsComment.id = ccl.ccl_contentsComment_id
		WHERE cc_contents_id = ?
		ORDER BY ccl.cnt desc, writingtime DESC
		`;						
		let commenttableInfo = await db.queryParamCnt_Arr(getcommentlistQuery, [req.params.contents_id]);
		//댓글 테이블에서 댓글 목록 받아와서

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
			SELECT user.id, user.nickname, user.img_url
			FROM myjungnami.user
			WHERE id = ?
			`;
			userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [commenttableInfo[i].cc_user_id]);

			//게시글 대댓글 갯수
			let getrecommentcntQuery =
			`
			SELECT count(*) as recommentCnt
			FROM myjungnami.contentsRecomment
			WHERE cr_contentsComment_id = ?
			`;
			recommentCnt = await db.queryParamCnt_Arr(getrecommentcntQuery, [commenttableInfo[i].id] );

			//댓글 좋아요 수
			let getlikecntQuery =
			`
			SELECT count(*) as commentlikeCnt
			FROM myjungnami.contentsCommentLike
			WHERE ccl_contentsComment_id = ?
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
		return next("500");
	}
});



/*  컨텐츠 댓글 작성하기  */
/*  /contents/comment  */
router.post('/', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);

	if(chkToken == -1) {
		return next("401");
	}

	var userid = chkToken.id;

	try{
		let contentsmakecommentQuery =
		`
		INSERT INTO
		myjungnami.contentsComment(id, cc_contents_id, cc_user_id, content)
		VALUES (null, ?, ?, ?)
		`;
		let data = await db.queryParamCnt_Arr(contentsmakecommentQuery, [req.body.contents_id, userid, req.body.content]);
		if(!data){
			return next("500");
		}

		res.status(201).send({
			message : "Success"
		});

	}catch(err){
		return next("500");
	}
});


/*  켄텐츠 댓글 삭제하기  */
/*  /contents/comment/:contentscommentid  */
router.delete('/:contentscommentid', async(req, res, next) => {

	const chkToken = jwt.verify(req.headers.authorization);
  
	if(chkToken == -1) {
	  return next("401");
	}
  
	let userid = chkToken.id;
  
	try{
	  // contents comment 정보 가져오기
	  let select_comment =
	  `
	  SELECT *
	  FROM contentsComment
	  WHERE id = ?
	  `;
	  let result_comment = await db.queryParamCnt_Arr(select_comment,[req.params.contentscommentid]);
  
	  // id 비교
	  if(userid == result_comment[0].cc_user_id){
		let delete_comment =
		`
		DELETE
		FROM contentsComment
		WHERE id = ?
		`;
		let result_delete = await db.queryParamCnt_Arr(delete_comment,[req.params.contentscommentid]);
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
