var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/*  호감, 비호감 순 리스트  */
/*  /ranking/like/:islike  */
router.get('/:islike', async(req, res, next) => {

  let islike = req.params.islike;

  let selectSql = "SELECT * FROM legislator LEFT OUTER JOIN"
      selectSql += "(SELECT lv_legislator_id, count(*) as score FROM legislatorVote"
      selectSql += "WHERE islike is ? GROUP BY lv_legislator_id) as lv"
      selectSql += "ON legislator.id = lv.lv_legislator_id ORDER BY lv.score DESC;"

  let selectQuery = await db.queryParamCnt_Arr(selectSql,[islike]);

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
