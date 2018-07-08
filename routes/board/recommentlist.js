//게시글의 특정 댓글 -> 댓글의 대댓글 리스트 보여주기

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const checktime = require('../../module/checktime.js');

router.get('/:comment_id', async(req, res) => {
	try{
		if(!(req.params.comment_id)){
			res.status(403).send({
				message : "please input comment id"
			});
		}else{
			let getrecommentlistQuery = 'select * from myjungnami.boardRecomment where br_boardComment_id = ? ORDER BY writingtime DESC';
			let recommenttableInfo = await db.queryParamCnt_Arr(getrecommentlistQuery, [req.params.comment_id]);

			let resultArry = new Array();
			let subresultObj = new Object();

			let userinfoObj = new Object();
			let recommentlikeCnt;


			for(var i=0; i< recommenttableInfo.length ; i++){

				let timeset = checktime.checktime(recommenttableInfo[i].writingtime);

				//유저닉네임이랑 이미지 사진
				let getuserinfoQuery = "select nickname, img_url from myjungnami.user where id = ?";
				userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [recommenttableInfo[i].br_user_id]);

				//좋아요 수
				let getlikecntQuery = "select count(*) as recommentlikeCnt from myjungnami.boardRecommentLike where brl_boardRecomment_id = ?";
				recommentlikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [recommenttableInfo[i].id]);

				subresultObj = recommenttableInfo[i];
				subresultObj.timeset = timeset;
				subresultObj.user_nick = userinfoObj[0].nickname;
				subresultObj.user_img_rul = userinfoObj[0].img_url;
				subresultObj.recommentlikeCnt = recommentlikeCnt[0].recommentlikeCnt;

				resultArry.push(subresultObj);

			}

			res.status(200).send({
				"message" : "Successfully get board recomment",
				"data" : resultArry
			});

			console.log(resultArry);
		}
	}catch(err){
		console.log(err);
		res.status(500).send({
			"message" : "Server error"
		});
	}
})
module.exports = router;
