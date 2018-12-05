/*  300명 순위 + 의원 검색  */
/*  /ranking/all  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const addComma = require('../../module/addComma.js');
const hangul = require('hangul-js');


/*  호감, 비호감 순 리스트 보여주기  */
/*  /ranking/all/:islike/:pre  */
router.get('/:islike/:pre', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  let u_id;

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id;
  }

  let islike = req.params.islike;
  let pre =+ req.params.pre;
  let number = 15;

  try {
    let setSql =
    `
    SET @row_num:=0;
    `;
    let listSql =
    `
    SELECT *, @row_num := @row_num + 1 as row_number
    FROM
      (SELECT *
      FROM legislator
      LEFT OUTER JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote
      WHERE islike = ?
      GROUP BY lv_legislator_id) as lv
      ON legislator.id = lv.lv_legislator_id
      ORDER BY lv.score DESC) as l1;
    `;
    let setQuery = await db.queryParamCnt_Arr(setSql,[]);
    let listQuery = await db.queryParamCnt_Arr(listSql,[islike]);

    var result = [];
    for(var i=0; i<listQuery.length; i++){
      var rankingInfo = {};

      rankingInfo.row_number = listQuery[i].row_number;
      rankingInfo.l_id = listQuery[i].id;
      rankingInfo.l_name = listQuery[i].name;
      rankingInfo.party_name = listQuery[i].l_party_name;
      rankingInfo.position = listQuery[i].position;
      rankingInfo.score = listQuery[i].score;

      if (rankingInfo.score == null){
        rankingInfo.scoretext = "0 표";
      } else {
        rankingInfo.scoretext = addComma.addComma(rankingInfo.score) + " 표";
      }

      rankingInfo.profileimg = listQuery[i].profile_img_url;
      rankingInfo.mainimg = listQuery[i].main_img_url;

      result.push(rankingInfo);
    }

    // 순위 뽑기 + 막대그래프 길이
    var w = 0;
    for(var i=0; i<result.length; i++) {

      if (result[i].score == null) {
        result[i].score = 0;
        result[i].ranking = "-"
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

        result[i].ranking = (result[i].ranking).toString();
        result[i].width =+ (result[i].score / w).toFixed(2);
      }
    }

    let returnResult = [];
    for(var i=pre; i<pre+number; i++){
      if(!result[i])
        break;
      returnResult.push(result[i]);
    }


    res.status(200).send({
      message : "Success",
      data : returnResult
    });

  } catch(error) {
    return next("500");
  }
});




/*  300명 중 의원이름 검색하기  */
/*  /ranking/all/search/:l_name  */
router.get('/search/:l_name', async(req, res, next) => {
  var id; // 사용자 id

  console.log("hello")

  const chkToken = jwt.verify(req.headers.authorization);
  if(chkToken == -1) {
    id = "";
  }
  else{
    id = chkToken.id;
  }

  console.log(req.params)

  // 자음, 모음까지 검색 되도록 하기 위해 사용
  let searchWord = req.params.l_name;
  let searcher = new hangul.Searcher(searchWord);

  var data = []; // 응답할 데이터
  var ranklike = []; // 의원별 호감 랭킹 정보 저장
  var rankunlike = []; // 의원별 비호감 랭킹 정보 저장
  var votedLegislator = []; // 유저에 해당하는 투표한 의원 id

  console.log(searchWord)

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
    `
    SELECT id, score
    FROM legislator
    LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = 1 GROUP BY lv_legislator_id) as lv
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
    `
    SELECT id, score
    FROM legislator LEFT JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike = 0 GROUP BY lv_legislator_id) as lv
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
    let result_legislator = await db.queryParamCnt_Arr(select_legislator);


    // return할 result
    let result = [];
    for(var i=0; i<result_legislator.length; i++){
      var data = {};
      if(searcher.search(result_legislator[i].name) >= 0){

        console.log(result_legislator[i])
        // 의원 id
        data.id = result_legislator[i].id;

        // 이름
        data.name = result_legislator[i].name;

        // 정당
        data.party = result_legislator[i].l_party_name;

        // 내용 (지역, 대표)
        data.position = result_legislator[i].position;

        // 이미지
        data.imgurl = result_legislator[i].profile_img_url;

        // 랭킹 (위원별 랭킹 저장해놓은 값을 찾아 랭킹 매핑)
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

        console.log(data)
        result.push(data);
      }
    }

    if(result.length == 0){
      return next("1204");
    }

    res.status(200).json({
      message : "Successasdf",
      data : result
    });

  }catch(error) {
    return next("500");
  }
});


module.exports = router;
