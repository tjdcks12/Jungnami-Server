/*  지역별 호감/비호감 의원 리스트  */
/*  /ranking/city/:city  */

var express = require('express');
const router = express.Router({mergeParams : true});

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const hangul = require('hangul-js');



/*  지역별 호감, 비호감 순 리스트 보여주기  */
/*  /ranking/city/:city/:islike/:pre  */
router.get('/:islike/:pre', async(req, res, next) => {

  var id; // 사용자 id

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
  }
  else{
    id = chkToken.id;
  }

  let islike = req.params.islike;
  let city = req.params.city;
  let pre =+ req.params.pre;
  let number = 15;

  var data = []; // 응답할 데이터
  var rank = []; // 의원별 랭킹 정보 저장

  try{
    // 랭킹 계산하기
    let select_rank =
    `
    SELECT id, score
    FROM legislator
    LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = ? GROUP BY lv_legislator_id) as lv
    ON legislator.id = lv.lv_legislator_id
    `;
    let result_rank = await db.queryParamCnt_Arr(select_rank, [islike]);
    
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
    let setSql =
    `
    SET @row_num:=0;
    `
    let select_legislator =
    `
    SELECT *, @row_num := @row_num + 1 as row_number
    FROM
      (SELECT id, name, l_party_name, region_city, region_state, profile_img_url, isPpresident, isLpresident, isPPpresident, score, position
      FROM legislator
      LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = ? GROUP BY lv_legislator_id) as lv
      ON legislator.id = lv.lv_legislator_id
      WHERE legislator.region_city = ?
      ORDER BY score DESC) as l1;
    `;
    let setQuery = await db.queryParamCnt_Arr(setSql,[]);
    let result_legislator = await db.queryParamCnt_Arr(select_legislator, [islike, city]);

    // return할 result
    let result = [];
    for(var i=0; i<result_legislator.length; i++){
      var data = {};

      // 의원 순서
      data.row_number = result_legislator[i].row_number;

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

      // 전체 랭킹 (위원별 랭킹 저장해논 값을 찾아 랭킹 매핑)
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

    // 순위 뽑기 + 막대그래프 길이
    for(var i=0; i<result_legislator.length; i++) {

      if (result_legislator[i].score == null) {
          result_legislator[i].score = 0;
          result[i].rank = "-"

      } else {

        if (i==0) {
          w = result_legislator[i].score; // 최대 득표수
          result[i].rank = 1;
        } else {

          if(result_legislator[i].score == result_legislator[i-1].score) {
            result[i].rank = result[i-1].rank;
            continue;
          } else if (result_legislator[i].score < result_legislator[i-1].score) {
            result[i].rank = i+1;
          }
        }

        result[i].rank = (result[i].rank).toString();
      }
    }

    let returnResult = [];
    for(var i=pre; i<pre+number; i++){
      if(!result[i])
        break;
      returnResult.push(result[i]);
    }

    res.status(200).json({
      message : "Success",
      data : returnResult
    });

  } catch(error) {
    return next("500");
  }
});


module.exports = router;
