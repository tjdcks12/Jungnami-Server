//게시글의 특정 댓글 -> 댓글의 대댓글 리스트 보여주기

var express = require('express');
var router = express.Router();
const async = require('async');

const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

router.get('/:comment_id', async(req, res) => {
	const chkToken = jwt.verify(req.headers.authorization);

	var userid;
	if(chkToken == -1){
		userid = "";
	}
	else{
		userid = chkToken.id;
	}

	try{
		if(!(req.params.comment_id)){
			return next("1403");
			// res.status(403).send({
			// 	message : "please input comment id"
			// });
		}else{
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
		}
	}catch(err){
		console.log(err);
		return next("500");
		// res.status(500).send({
		// 	"message" : "Server error"
		// });
	}
})
module.exports = router;
