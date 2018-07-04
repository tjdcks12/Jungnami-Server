var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/*  의원에게 투표하기  */
/*  /ranking/voting/:islike/:l_id  */
router.post('/', async(req, res, next) => {

  let u_id = req.body.u_id;
  let l_id = req.body.l_id;
  let islike = req.body.islike;

  let insertSql = "insert into legislatorVote (lv_legislator_id, lv_user_id, islike) values (?, ?, ?);"
  let insertQuery = await db.queryParamCnt_Arr(insertSql,[u_id, l_id, islike]);

  if(selectQuery.length == 0){
    console.log("query not ok");
  }else{
    console.log("query ok");
  }

  var result = [];
  for(var i=0; i<selectQuery.length; i++){
    var rankingInfo = {};

    rankingInfo.name = selectQuery[i].name;
    rankingInfo.party_name = selectQuery[i].l_party_name;

    rankingInfo.info = null;
    if (selectQuery[i].isPpresident) { // 당대표
      rankingInfo.info += "당 대표 "
    }
    if (selectQuery[i].isLpresident) { // 원내대표
      rankingInfo.info += "원내 대표 "
    }
    if (selectQuery[i].isPPpresident) { // 비례대표
      rankingInfo.info += "비례 대표 "
    }
    if (selectQuery[i].region_city != "") {  // 지역구+선거구
      rankingInfo.info += selectQuery[i].region_city + " ";
      rankingInfo.info += selectQuery[i].region_state;
    }
    
    rankingInfo.score = selectQuery[i].score;
    rankingInfo.profileimg = selectQuery[i].profile_img_url;
    rankingInfo.mainimg = selectQuery[i].main_img_url;
    
    result.push(rankingInfo);
  }

  res.json({
    data : result,
    message : "data ok",
    status : 200
  });
});

module.exports = router;
