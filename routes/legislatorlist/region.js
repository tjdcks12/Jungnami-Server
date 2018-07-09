/* 지역별 호감/비호감 의원 리스트 */
/*  /legislatorlist/region */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');

const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

router.get('/:islike/:city', async(req, res, next) => {
  var id; // 사용자 id

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
  }
  else{
    id = chkToken.id;
  }
  // if(chkToken == -1) {
  //     res.status(401).send({
  //         message : "Access Denied"
  //     });
  // }

  const time = new Date();
  var data = []; // 응답할 데이터
  var votedLegislator = []; // 유저에 해당하는 투표한 의원 id
  var rank = []; // 의원별 랭킹 정보 저장

  try{

    // 랭킹 계산하기
    let select_rank = "SELECT id, score FROM legislator LEFT JOIN (SELECT  lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = ? GROUP BY lv_legislator_id) as lv ON legislator.id = lv.lv_legislator_id";
    let result_rank = await db.queryParamCnt_Arr(select_rank, [req.params.islike]);
    for(var i=0; i<result_rank.length; i++){
      var r = 1;
      for(var j=0; j<result_rank.length; j++){
        if(result_rank[i].score < result_rank[j].score){
          r++;
        }
      }
      rank.push(
        {
          id: result_rank[i].id,
          r: r
        }
      );
    }

    //의원정보 가져오기
    let select_legislator = "SELECT id, name, l_party_name, region_city, region_state, profile_img_url, isPpresident, isLpresident, isPPpresident, score, position FROM legislator ";
    select_legislator += "LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote ";
    select_legislator += "WHERE islike = ? GROUP BY lv_legislator_id) as lv ";
    select_legislator += "ON legislator.id = lv.lv_legislator_id where legislator.region_city = ? ORDER BY score DESC";

    let result_legislator = await db.queryParamCnt_Arr(select_legislator, [req.params.islike, req.params.city]);
    console.log(result_legislator);

    // return할 result
    let result = [];
    for(var i=0; i<result_legislator.length; i++){
      var data = {};

      // 의원 id
      data.id = result_legislator[i].id;

      // 이름
      data.name = result_legislator[i].name;

      // 내용 (지역, 대표)
      data.position = result_legislator[i].position;

      // 이미지
      data.imgurl = result_legislator[i].profile_img_url;

      // 정당이름
      data.party_name = result_legislator[i].l_party_name;

      if(!result_legislator[i].score){
        result_legislator[i].score = 0;
      }

      // 지역 내 랭킹
      if(i == 0){
        data.rank = 1;
        result_legislator[i].ranking = data.rank;
      }
      else{
        if(result_legislator[i-1].score == result_legislator[i].score){
          data.rank = result_legislator[i-1].ranking;
          result_legislator[i].ranking = result_legislator[i-1].ranking;
        }
        else if(result_legislator[i-1].score > result_legislator[i].score){
          data.rank = i+1;
          result_legislator[i].ranking = i+1;
        }
      }

      // 전체 랭킹
      // 위원별 랭킹 저장해논 값을 찾아 랭킹 매핑
      for(var j=0; j<rank.length; j++){
        if(result_legislator[i].id == rank[j].id){
          data.rankInAll = rank[j].r;
        }
      }
      if(result_legislator[i].score){
        data.rankInAll += "위";
      }
      else{
        data.rankInAll = "-";
      }

      result.push(data);
    }

    if(result.length == 0){
      res.status(300).json({
        message : "No data",
      });
      return;
    }

    res.status(200).json({
      data : result,
      message : "Success"
    });
  } catch(error) {
    res.status(500).send({
      message : "Internal Server Error"
    });
  }
});

module.exports = router;
