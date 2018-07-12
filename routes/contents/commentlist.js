//컨텐츠에 달린 댓글 보여주기
var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

router.get('/:contents_id', async(req, res) => {
	const chkToken = jwt.verify(req.headers.authorization);

	var userid;
	if(chkToken == -1){
		userid = "";
	}
	else{
		userid = chkToken.id;
	}

	try{
		if(!(req.params.contents_id)){
			res.status(403).send({
				message : "please input contents' id"
			});
		}else{
			// 유저 댓글 좋아요 여부
			var islike = [];
			let select_islike = 'SELECT ccl_contentsComment_id FROM contentsCommentLike WHERE ccl_user_id = ?';
			let result_islike = await db.queryParamCnt_Arr(select_islike, [userid])
			for(var i=0; i<result_islike.length; i++){
				islike[i] = result_islike[i].ccl_contentsComment_id;
			}

			//유저 닉, 이미지, 시간, 컨텐츠, 좋아요, 대댓 수 출력
			let getcommentlistQuery = 'select * from contentsComment left join (SELECT ccl_contentsComment_id, count(*) as cnt from contentsCommentLike GROUP BY ccl_contentsComment_id) as ccl on contentsComment.id = ccl.ccl_contentsComment_id  where cc_contents_id = ? order by ccl.cnt desc, writingtime desc';
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
				let getuserinfoQuery = "select user.nickname, user.img_url from myjungnami.user where id = ?";
				userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [commenttableInfo[i].cc_user_id]);

				//게시글 대댓글 갯수
				let getrecommentcntQuery = "select count(*) as recommentCnt from myjungnami.contentsRecomment where cr_contentsComment_id = ?";
				recommentCnt = await db.queryParamCnt_Arr(getrecommentcntQuery, [commenttableInfo[i].id] );

				//댓글 좋아요 수
				let getlikecntQuery = "select count(*) as commentlikeCnt from myjungnami.contentsCommentLike where ccl_contentsComment_id = ?";
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
				"message" : "Successfully get contents comment list",
				"data" : resultArry
			});
		}


	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "Server error"
		});
	}
})



// 모듈 추가했음 지워도 됨 _ from jiyeon
/*
var timesetfun = function(param_writingtime) {
// 현재시간
var currentTime = new Date();
let returnvalue;
var writingtime = param_writingtime;

//--------------- 시간 계산------------------
//1. 작성 10분 이내
if(currentTime.getTime() - writingtime.getTime() < 600000){
returnvalue = "방금 전";
return returnvalue;
} //2. 1시간 이내
else if(currentTime.getTime() - writingtime.getTime() < 3600000){
returnvalue = Math.floor((currentTime.getTime() - writingtime.getTime())/60000) + "분 전";
return returnvalue;
}//3. 작성한지 24시간 넘음
else if(currentTime.getTime() - writingtime.getTime() > 86400000){
returnvalue = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
return returnvalue;
} //4. 24시간 이내
else{
if(currentTime.getDate() != writingtime.getDate()){
returnvalue = (24 - writingtime.getHours()) + (currentTime.getHours());
if(returnvalue == 24){
returnvalue = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
}
else{
returnvalue += "시간 전";
}
}
else{
returnvalue = (currentTime.getHours() - writingtime.getHours()) + "시간 전";
}
return returnvalue;
}

}*/

module.exports = router;
