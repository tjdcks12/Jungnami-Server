/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const addComma = require('../../module/addComma.js');


/*  호감, 비호감 순 리스트  */
/*  /ranking/list/:islike  */
router.get('/:islike', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  let u_id;

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id;
  }

  let islike =+ req.params.islike;

  try {
    let listSql = "SELECT * FROM legislator LEFT OUTER JOIN "
        listSql += "(SELECT lv_legislator_id, count(*) as score FROM legislatorVote "
        listSql += "WHERE islike=? GROUP BY lv_legislator_id) as lv "
        listSql += "ON legislator.id = lv.lv_legislator_id ORDER BY lv.score DESC;"

    let listQuery = await db.queryParamCnt_Arr(listSql,[islike]);

    if(listQuery.length == 0){
      console.log("query not ok");

      res.status(300).send({
        message: "No Data"
      });
      return;

    } else {
      console.log("query ok");

      // let votedSql = "SELECT * FROM legislatorVote WHERE lv_user_id = ? AND islike = ?;"
      // let votedQuery = await db.queryParamCnt_Arr(votedSql, [u_id, islike]);

      var result = [];
      for(var i=0; i<listQuery.length; i++){
        var rankingInfo = {};

        rankingInfo.l_id = listQuery[i].id;
        rankingInfo.l_name = listQuery[i].name;
        rankingInfo.party_name = listQuery[i].l_party_name;
        rankingInfo.position = listQuery[i].position; 
        rankingInfo.score = listQuery[i].score; 

        if (rankingInfo.score == null){
          rankingInfo.scoretext = null;
        } else {
          rankingInfo.scoretext = addComma.addComma(rankingInfo.score) + " 표";
        }

        rankingInfo.profileimg = listQuery[i].profile_img_url;
        rankingInfo.mainimg = listQuery[i].main_img_url;

        // 투표여부 필요없음 : 어차피 했건 안했건 동일하게 보여줌
        /*
        for (var j=0; j<votedQuery.length; j++)
          if (listQuery[i].id == votedQuery[j].lv_legislator_id) {
            rankingInfo.voted = true;
            break;
          }
          else
            rankingInfo.voted = false;
        */
        result.push(rankingInfo);
      } 

      // 순위 뽑기 + 막대그래프 길이
      var w = 0; 
      for(var i=0; i<result.length; i++) {

        if (result[i].score == null) {
            result[i].ranking = "-위"
            result[i].width = 0;

        } else {

          if (i==0) {
            w = result[i].score; // 최대 득표수
            result[i].ranking = 1;
          } else {

            if(result[i].score == result[i-1].score) {
              result[i].ranking = result[i-1].ranking;
              result[i].width = result[i-1].width;
              continue;
            } else if (result[i].score < result[i-1].score) {
              result[i].ranking = i+1;
            }
          }

          result[i].ranking = (result[i].ranking).toString() + "위";
          result[i].width =+ (result[i].score / w).toFixed(2);
        }
      }

      res.status(200).send({
          message : "Select Data Success",
          data : result
        });
    }


  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});

module.exports = router;
