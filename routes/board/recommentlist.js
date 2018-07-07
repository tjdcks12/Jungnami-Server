//게시글의 특정 댓글 -> 댓글의 대댓글 리스트 보여주기 

var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.get('/:c_id', async(req, res) => {
	try{
		if(!(req.params.c_id)){
			res.status(403).send({
				message : "please input comment_id"
			});
		}else{
			let getrecommentlistQuery = 'select * from myjungnami.boardRecomment where br_boardComment_id = ? ';
			let recommenttableInfo = await db.queryParamCnt_Arr(getrecommentlistQuery, [req.params.c_id]);

			console.log(recommenttableInfo);

    		let resultArry = new Array();
    		let subresultObj = new Object();

    		let userinfoObj = new Object();
   			let recommentlikeCnt;


   			for(var i=0; i< recommenttableInfo.length ; i++){

   				let timeset = timesetfun(recommenttableInfo[i].writingtime);
   	  			console.log(timeset);

      			//유저닉네임이랑 이미지 사진 
      			let getuserinfoQuery = "select nickname, img_url from myjungnami.user where id = ?";
      			userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [recommenttableInfo[i].br_user_id]);    

      			//게시글 좋아요 수 
      			let getlikecntQuery = "select count(*) from myjungnami.boardRecommentLike where brl_boardRecomment_id = ?";
      			recommentlikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [recommenttableInfo[i].id]);

      			subresultObj = recommenttableInfo[i];
      			subresultObj.timeset = timeset;
      			subresultObj.user_nick = userinfoObj[0].nickname;
      			subresultObj.user_img_rul = userinfoObj[0].img_url;
      			subresultObj.recommentlikeCnt = recommentlikeCnt[0];

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
			"message" : "syntax error"
		});
	}
})

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

}

module.exports = router;