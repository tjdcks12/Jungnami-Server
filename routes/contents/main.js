//컨텐츠 탭 메인화면 cate 별로 뿌러주기 , cate default -> 추천
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/:categoy', async (req, res) => {

  const chkToken = jwt.verify(req.headers.authorization);
  var id = chkToken.id;


  try{
  	if(!req.params.categoy) {
  		res.status(403).send({
  			"message" : "input contents category"
  		});
  	}
  	else{
  		let getcontentsmainQuery = 'SELECT * FROM myjungnami.contents WHERE category = ?';
      let data = await db.queryParamCnt_Arr(getcontentsmainQuery, [req.params.categoy]);

      let alarm;
      let islogined;

     //로그인 되어었으면 알람 수 명시 
      if(chkToken !== -1){
          let getalarmcntQuery = "select count(*) from myjungnami.push where (p_user_id = ? and ischecked = 0)";
          alarmCnt = await db.queryParamCnt_Arr(getalarmcntQuery, id);
          alarm = alarmCnt;
          islogined = 1;
      }else{
          alarmCnt = 0;
          islogined = 0;
      }

      data.push("timeset : "+ timesetfun(data.writingtime));
      data.push("islogined : " + islogined);
      data.push("alarm : "+ alarm);


      res.status(200).send({
       "message" : "Successfully get contents list",
       "data" : data
     });

      console.log(data);
    }
  }catch(err){
  	console.log(err);
  	res.status(500).send({
  		"message" : "Server error"
  	});
  }
});

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