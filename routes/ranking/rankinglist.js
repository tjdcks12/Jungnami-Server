/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/*  호감, 비호감 순 리스트  */
/*  /ranking/rankinglist/:islike  */
router.get('/:islike/:u_id', async(req, res, next) => {

  let islike =+ req.params.islike;
  let u_id = req.params.u_id;

  try {
    let listSql = "SELECT * FROM legislator LEFT OUTER JOIN "
        listSql += "(SELECT lv_legislator_id, count(*) as score FROM legislatorVote "
        listSql += "WHERE islike=? GROUP BY lv_legislator_id) as lv "
        listSql += "ON legislator.id = lv.lv_legislator_id ORDER BY lv.score DESC;"

    let listQuery = await db.queryParamCnt_Arr(listSql,[islike]);

    if(listQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");
    }

    let votedSql = "SELECT * FROM legislatorVote WHERE lv_user_id = ? AND islike = ?;"
    let votedQuery = await db.queryParamCnt_Arr(votedSql, [u_id, islike]);

    if(listQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");
    }

    var result = [];
    for(var i=0; i<listQuery.length; i++){
      var rankingInfo = {};

      rankingInfo.l_id = listQuery[i].id;
      rankingInfo.l_name = listQuery[i].name;
      rankingInfo.party_name = listQuery[i].l_party_name;

      rankingInfo.info = '';
      if (listQuery[i].isPpresident) { // 당대표
        rankingInfo.info += "당 대표"
      }
      if (listQuery[i].isLpresident) { // 원내대표
        rankingInfo.info += "원내 대표"
      }
      if (listQuery[i].isPPpresident) { // 비례대표
        if (rankingInfo.info != '')
          rankingInfo.info += ", "
        rankingInfo.info += "비례 대표"
      }
      if (listQuery[i].region_city != "") {  // 지역구+선거구
        if (rankingInfo.info != '')
          rankingInfo.info += ", "
        rankingInfo.info += listQuery[i].region_city + " ";
        rankingInfo.info += listQuery[i].region_state;
      }

      rankingInfo.score = listQuery[i].score;
      rankingInfo.profileimg = listQuery[i].profile_img_url;
      rankingInfo.mainimg = listQuery[i].main_img_url;

      for (var j=0; j<votedQuery.length; j++)
        if (listQuery[i].id == votedQuery[j].lv_legislator_id) {
          rankingInfo.voted = true;
          break;
        }
        else
          rankingInfo.voted = false;

      result.push(rankingInfo);
    }

    for(var i=0; i<result.length; i++) {
      if (i==0) {
        result[i].ranking = 1;
      } else {
        if(result[i].score == result[i-1].score) {
          result[i].ranking = result[i-1].ranking;
        } else if (result[i].score < result[i-1].score) {
          result[i].ranking = i+1;
        }
      }
    }

    res.status(200).send({
        message : "Select Data Success",
        data : result
      });

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});

module.exports = router;
