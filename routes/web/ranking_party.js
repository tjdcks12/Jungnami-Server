/*  정당별 호감/비호감 의원 리스트  */
/*  /web/ranking/party/:p_name   */

var express = require('express');
const router = express.Router({mergeParams : true});

const async = require('async');

const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const addComma = require('../../module/addComma.js');


/*  /web/ranking/party/:p_name/:islike   */
router.get('/:islike', async(req, res, next) => {

  var id; // 사용자 id

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
  }
  else{
    id = chkToken.id;
  }

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
    let select_legislator =
    `
    SELECT id, name, l_party_name, region_city, region_state, profile_img_url, isPpresident, isLpresident, isPPpresident, score, position
    FROM legislator
    LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = ? GROUP BY lv_legislator_id) as lv
    ON legislator.id = lv.lv_legislator_id
    where legislator.l_party_name = ? ORDER BY score DESC
    `

    let result_legislator = await db.queryParamCnt_Arr(select_legislator,[req.params.islike, req.params.p_name]);

    // return할 result
    let result = [];
    for(var i=0; i<result_legislator.length; i++){
      var data = {};

      // 의원 id
      data.l_id = result_legislator[i].id;

      // 이름
      data.l_name = result_legislator[i].name;

      // 정당이름
      data.party_name = result_legislator[i].l_party_name;

      // 이미지
      data.profileimg = result_legislator[i].profile_img_url;

      // 득표수
      if(!result_legislator[i].score){
        result_legislator[i].score = 0;
      }
      data.score = result_legislator[i].score;

      result.push(data);
    }



    // 순위 뽑기 + 막대그래프 길이
    var w = 0;
    for(var i=0; i<result_legislator.length; i++) {

      if (result_legislator[i].score == 0) {
          result[i].ranking = "-"
          result[i].width = 0;

      } else {

        if (i==0) {
          w = result_legislator[i].score; // 최대 득표수
          result[i].ranking = 1;
        } else {

          if(result_legislator[i].score == result_legislator[i-1].score) {
            result[i].ranking = result[i-1].ranking;
            result[i].width = result[i-1].width;
            continue;
          } else if (result_legislator[i].score < result_legislator[i-1].score) {
            result[i].ranking = i+1;
          }
        }

        result[i].ranking = (result[i].ranking).toString();
        result[i].width =+ (result[i].score / w).toFixed(2);
      }
    }

    res.status(200).json({
      message : "Success",
      data : result
    });

  } catch(error) {
    return next("500");
  }
  
});

module.exports = router;
