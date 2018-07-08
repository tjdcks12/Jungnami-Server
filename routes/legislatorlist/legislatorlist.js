/* 정당별 호감/비호감 의원 리스트 */
/*  /legislatorlist/legislatorlist */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');

const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

router.get('/:islike/:p_name', async(req, res, next) => {

  var id; // 사용자 id

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
  }
  else{
    id = chkToken.id;
  }

  var cnt; // 의석 수
  var data = []; // 응답할 데이터
  var votedLegislator = []; // 유저에 해당하는 투표한 의원 id
  var rank = []; // 의원별 랭킹 정보 저장

  try{
    // 투표 여부
    let select_vote = "SELECT lv_legislator_id FROM legislatorVote WHERE islike = ? AND lv_user_id = ?";
    let result_vote = await db.queryParamCnt_Arr(select_vote, [req.params.islike, id]);
    votedLegislator = result_vote;

    // 랭킹 계산하기
    let select_rank = "SELECT id, score FROM legislator  LEFT JOIN (SELECT  lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = ? GROUP BY lv_legislator_id) as lv ON legislator.id = lv.lv_legislator_id";
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

    // 의석 수 가져오기
    let select_legislatorcnt = "SELECT count(*) as cnt FROM legislator where l_party_name = ?";
    let result_legislatorcnt = await db.queryParamCnt_Arr(select_legislatorcnt,[req.params.p_name]);
    cnt = result_legislatorcnt[0].cnt;

    //의원정보 가져오기
    let select_legislator = "SELECT id, name, region_city, region_state, profile_img_url, isPpresident, isLpresident, isPPpresident, score, position FROM legislator ";
    select_legislator += "LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote ";
    select_legislator += "WHERE islike = ? GROUP BY lv_legislator_id) as lv ";
    select_legislator += "ON legislator.id = lv.lv_legislator_id where legislator.l_party_name = ? ORDER BY score DESC";

    let result_legislator = await db.queryParamCnt_Arr(select_legislator,[req.params.islike, req.params.p_name]);

    // return할 result
    let result = [];
    for(var i=0; i<result_legislator.length; i++){
      var data = {};

      // 의원 id
      data.id = result_legislator[i].id;

      // 이름
      data.name = result_legislator[i].name;

      // 내용 (지역, 대표)
      data.content = result_legislator[i].position;
      // if(result_legislator[i].isPpresident == 1){
      //   data.content += "당 대표";
      // }
      // if(result_legislator[i].isLpresident == 1){
      //   data.content += "원내 대표";
      // }
      // if(result_legislator[i].isPPpresident == 1){
      //   if(data.content != ""){
      //     data.content += ", ";
      //   }
      //   data.content += "비례 대표";
      // }
      //
      // if (result_legislator[i].region_city != "") {  // 지역구+선거구
      //   if(data.content != "")
      //     data.content += ", "
      //   data.content += result_legislator[i].region_city + " ";
      //   data.content += result_legislator[i].region_state;
      // }

      // 이미지
      data.imgurl = result_legislator[i].profile_img_url;

      // 랭킹
      // 위원별 랭킹 저장해논 값을 찾아 랭킹 매핑
      for(var j=0; j<rank.length; j++){
        if(result_legislator[i].id == rank[j].id){
          data.rank = rank[j].r;
        }
      }
      if(result_legislator[i].score){
        data.rank += "위";
      }
      else{
        data.rank = "-위";
      }

      // 투표 여부
      data.voted = false;
      for(var j=0; j<votedLegislator.length; j++){
        if(result_legislator[i].id == votedLegislator[j].lv_legislator_id){
          data.voted = true;
        }
      }

      result.push(data);
    }

    if(result.length == 0){
      res.status(300).json({
        message : "No data",
        status : 300
      });
      return;
    }

    res.status(200).json({
      data : {
        cnt : cnt,
        legislator : result
      },
      message : "Success",
      status : 200
    });
  } catch(error) {
    res.status(500).send({
      message : "Internal Server Error"
    });
  }
});

module.exports = router;
