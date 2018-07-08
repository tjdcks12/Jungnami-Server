//컨텐츠 탭 메인화면 cate 별로 뿌러주기 , cate default -> 추천
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/:cate', async (req, res) => {

  const chkToken = jwt.verify(req.headers.authorization);
  var id = chkToken.id;


  try{
  	if(!req.params.cate) {
  		res.status(403).send({
  			"message" : "input contents category"
  		});
  	}
  	else{
  		let getcontentsmainQuery = 'SELECT * FROM myjungnami.contents WHERE category = ?';
      let data = await db.queryParamCnt_Arr(getcontentsmainQuery, [req.params.cate]);

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
  		"message" : "Syntax error"
  	});
  }
});

module.exports = router;