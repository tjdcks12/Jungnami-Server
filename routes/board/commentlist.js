//커뮤니티 글에 달린 댓글 리스트 보여주기 - OK
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

router.get('/:bc_board_id', async(req, res) => {
	try{
		if(!(req.params.bc_board_id)){
			res.status(403).send({
				message : "please input bc_board_id"
			});
		}else{
			//유저 닉, 이미지, 시간, 컨텐츠, 좋아요, 대댓 수 출력 
			let getcommentlistQuery = 'select * from myjungnami.boardComment where bc_board_id = ? ';  
			let commenttableInfo = await db.queryParamCnt_Arr(getcommentlistQuery, [req.params.bc_board_id]);
			console.log(commenttableInfo);
			//댓글 테이블에서 댓글 목록 받아와서 

  			let resultArry = new Array();
    		let subresultObj = new Object();

    		let userinfoObj = new Object();
    		let recommentCnt;
    		let commentlikeCnt;

    		for(var i=0; i< commenttableInfo.length; i++){

    			let timeset = timesetfun(commenttableInfo[i].writingtime);
   	  			console.log(timeset);


	      		//유저닉네임이랑 이미지 사진 
    	 	 	let getuserinfoQuery = "select user.nickname, user.img_url from myjungnami.user where id = ?";
     	 		userinfoObj = await db.queryParamCnt_Arr(getuserinfoQuery, [commenttableInfo[i].bc_user_id]);
      
     	 		//게시글 대댓글 갯수 
      			let getrecommentcntQuery = "select count(*) from myjungnami.boardRecomment where br_boardComment_id = ?;";
     			commentCnt = await db.queryParamCnt_Arr(getrecommentcntQuery, [commenttableInfo[i].id] );

      			//댓글 좋아요 수 
      			let getlikecntQuery = "select count(*) from myjungnami.boardCommentLike where bcl_boardComment_id = ?";
      			commentlikeCnt = await db.queryParamCnt_Arr(getlikecntQuery, [commenttableInfo[i].id]);
      
      			subresultObj = commenttableInfo[i];
      			subresultObj.timeset = timeset;
      			subresultObj.user_nick = userinfoObj[0].nickname;
      			subresultObj.user_img_rul = userinfoObj[0].img_url;
      			subresultObj.recommentCnt = commentCnt[0];
      			subresultObj.commentlikeCnt = commentCnt[0];

      			resultArry.push(subresultObj);

    		}

			res.status(200).send({
				"message" : "Successfully get board comment list",
				"data" : resultArry
			});

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