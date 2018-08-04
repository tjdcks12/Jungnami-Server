/* 지역 별 호감/비호감 의원 탭에서 검색 */
/*  /search/legislatorparty */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');

const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const hangul = require('hangul-js');

router.get('/:city/:l_name', async(req, res, next) => {
  var id; // 사용자 id

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
  }
  else{
    id = chkToken.id;
  }

  // 자음, 모음까지 검색 되도록 하기 위해 사용
  let searchWord = req.params.keyword;
  let searcher = new hangul.Searcher(req.params.l_name);

  var data = []; // 응답할 데이터
  var ranklike = []; // 의원별 호감 랭킹 정보 저장
  var rankunlike = []; // 의원별 비호감 랭킹 정보 저장
  var votedLegislator = []; // 유저에 해당하는 투표한 의원 id

  try{
    // 투표 여부
    let select_vote =
    `
    SELECT lv_legislator_id
    FROM legislatorVote
    WHERE lv_user_id = ?
    `;
    let result_vote = await db.queryParamCnt_Arr(select_vote, id);
    votedLegislator = result_vote;

    // 호감 랭킹 계산하기
    let select_ranklike =
    `SELECT id, score
    FROM legislator
    LEFT JOIN (SELECT  lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = 1 GROUP BY lv_legislator_id) as lv
    ON legislator.id = lv.lv_legislator_id
    `;
    let result_ranklike = await db.queryParamCnt_Arr(select_ranklike, []);
    for(var i=0; i<result_ranklike.length; i++){
      var r = 1;
      for(var j=0; j<result_ranklike.length; j++){
        if(result_ranklike[i].score < result_ranklike[j].score){
          r++;
        }
      }
      ranklike.push(
        {
          id: result_ranklike[i].id,
          score: result_ranklike[i].score,
          r: r
        }
      );
    }

    // 바호감 랭킹 계산하기
    let select_rankunlike =
    `SELECT id, score
    FROM legislator
    LEFT JOIN (SELECT  lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = 0 GROUP BY lv_legislator_id) as lv
    ON legislator.id = lv.lv_legislator_id
    `;
    let result_rankunlike = await db.queryParamCnt_Arr(select_rankunlike, []);
    for(var i=0; i<result_rankunlike.length; i++){
      var r = 1;
      for(var j=0; j<result_rankunlike.length; j++){
        if(result_rankunlike[i].score < result_rankunlike[j].score){
          r++;
        }
      }
      rankunlike.push(
        {
          id: result_rankunlike[i].id,
          score: result_rankunlike[i].score,
          r: r
        }
      );
    }

    //의원정보 가져오기
    let select_legislator =
    `
    SELECT id, l_party_name, name, region_city, region_state, profile_img_url, isPpresident, isLpresident, isPPpresident, score, position
    FROM legislator
    LEFT JOIN (SELECT  lv_legislator_id, count(*) as score FROM legislatorVote GROUP BY lv_legislator_id) as lv
    ON legislator.id = lv.lv_legislator_id ORDER BY score DESC
    `
    let result_legislator = await db.queryParamCnt_Arr(select_legislator,[req.params.city]);


    // return할 result
    let result = [];
    for(var i=0; i<result_legislator.length; i++){
      var data = {};
      if(searcher.search(result_legislator[i].name) >= 0){

        // 의원 id
        data.id = result_legislator[i].id;

        // 이름
        data.name = result_legislator[i].name;

        // 정당
        data.party = result_legislator[i].l_party_name;

        // 내용 (지역, 대표)
        data.position = result_legislator[i].position;
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
        //   data.content += ", "
        //   data.content += result_legislator[i].region_city + " ";
        //   data.content += result_legislator[i].region_state;
        // }

        // 이미지
        data.imgurl = result_legislator[i].profile_img_url;

        // 랭킹
        // 위원별 랭킹 저장해논 값을 찾아 랭킹 매핑
        var rank ="호감 ";
        for(var j=0; j<ranklike.length; j++){
          if(result_legislator[i].id == ranklike[j].id){
            if(ranklike[j].score){
              rank += ranklike[j].r;
            }
            else{
              rank += "-";
            }
          }
        }
        rank += "위 / 비호감 ";

        for(var j=0; j<rankunlike.length; j++){
          if(result_legislator[i].id == rankunlike[j].id){
            if(rankunlike[j].score){
              rank += rankunlike[j].r;
            }
            else{
              rank += "-";
            }
          }
        }
        rank += "위";
        data.rank = rank;

        // 투표 여부
        data.voted = false;
        for(var j=0; j<votedLegislator.length; j++){
          if(result_legislator[i].id == votedLegislator[j].lv_legislator_id){
            data.voted = true;
          }
        }

        result.push(data);
      }
    }

    if(result.length == 0){
      return next("1204");
    }

    res.status(200).json({
      data : result,
      message : "Success"
    });

  }catch(error) {
    console.log(error);
    return next("500");
  }
});

module.exports = router;
