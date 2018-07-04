/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/*  국회의원 페이지  */
/*  /legislator/page/:l_id  */
router.get('/:l_id', async(req, res, next) => {

  let l_id =+ req.params.l_id;

  try {
    let rankingSql = "SELECT * FROM legislator LEFT OUTER JOIN "
        rankingSql += "(SELECT lv_legislator_id, count(*) as score FROM legislatorVote "
        rankingSql += "WHERE islike=? GROUP BY lv_legislator_id) as lv "
        rankingSql += "ON legislator.id = lv.lv_legislator_id ORDER BY lv.score DESC;"

    let likeRankingQuery = await db.queryParamCnt_Arr(rankingSql,[1]);
    let unlikeRankingQuery = await db.queryParamCnt_Arr(rankingSql,[0]);

    if(likeRankingQuery.length == 0 || unlikeRankingQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");
    }

    // 호감 순 줄 세우기
    var likeRresult = [];
    for(var i=0; i<likeRankingQuery.length; i++){
      var rankingInfo = {};

      rankingInfo.id = likeRankingQuery[i].id;
      rankingInfo.score = likeRankingQuery[i].score;

      likeRresult.push(rankingInfo);
    }
    // 호감 순 랭킹 뽑기
    for(var i=0; i<likeRresult.length; i++) {
      if (i==0) {
        likeRresult[i].ranking = 1;
      } else {
        if(likeRresult[i].score == likeRresult[i-1].score) {
          likeRresult[i].ranking = likeRresult[i-1].ranking;
        } else if (likeRresult[i].score < likeRresult[i-1].score) {
          likeRresult[i].ranking = i+1;
        }
      }
    }

    // 비호감 순 줄 세우기
    var unlikeRresult = [];
    for (var i=0; i<unlikeRankingQuery.length; i++){
      var rankingInfo = {};

      rankingInfo.id = unlikeRankingQuery[i].id;
      rankingInfo.score = unlikeRankingQuery[i].score;
      
      unlikeRresult.push(rankingInfo);
    }
    // 비호감 순 랭킹 뽑기
    for (var i=0; i<unlikeRresult.length; i++) {
      if (i==0) {
        unlikeRresult[i].ranking = 1;
      } else {
        if(unlikeRresult[i].score == unlikeRresult[i-1].score) {
          unlikeRresult[i].ranking = unlikeRresult[i-1].ranking;
        } else if (unlikeRresult[i].score < unlikeRresult[i-1].score) {
          unlikeRresult[i].ranking = i+1;
        }
      }
    }


    // 해당 의원의 정보 가져오기 : 사진, 이름, 소속정당, 지역구 등 and 호감, 비호감 순위 및 득표수
    var result = {};

    for (var i=0; i<likeRresult.length; i++) {
      if(likeRresult[i].id == l_id) {

        result.l_id = likeRresult[i].id;
        result.l_name = likeRankingQuery[i].name;
        result.party_name = likeRankingQuery[i].l_party_name;

        result.info = '';
        if (likeRankingQuery[i].isPpresident) { // 당대표
          result.info += "당 대표"
        }
        if (likeRankingQuery[i].isLpresident) { // 원내대표
          result.info += "원내 대표"
        }
        if (likeRankingQuery[i].isPPpresident) { // 비례대표
          if (result.info != '')
            result.info += ", "
          result.info += "비례 대표"
        }
        if (likeRankingQuery[i].region_city != "") {  // 지역구+선거구
          if (result.info != '')
            result.info += ", "
          result.info += likeRankingQuery[i].region_city + " ";
          result.info += likeRankingQuery[i].region_state;
        }

        result.profileimg = likeRankingQuery[i].profile_img_url;
        result.like_ranking = likeRresult[i].ranking;
        result.like_score = likeRresult[i].score;

        break;
      }
    }

    for (var i=0; i<unlikeRresult.length; i++) {
      if(unlikeRresult[i].id == l_id) {

        result.unlike_ranking = unlikeRresult[i].ranking;
        result.unlike_score = unlikeRresult[i].score;

        break;
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
