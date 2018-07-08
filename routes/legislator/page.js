/* KIM JI YEON */

// 경과 시간 계산 함수
function checktime (time) {

  let currentTime = new Date();
  let writingtime = time; // result_content[i].writingtime;
  var data; // 리턴할 값

  // 작성 10분 이내
  if(currentTime.getTime() - writingtime.getTime() < 600000){
    data = "방금 전";
  } // 1시간 이내
  else if(currentTime.getTime() - writingtime.getTime() < 3600000){
    data = Math.floor((currentTime.getTime() - writingtime.getTime())/60000) + "분 전";
  }// 작성한지 24시간 넘음
  else if(currentTime.getTime() - writingtime.getTime() > 86400000){
    data = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
  } // 24시간 이내
  else{
    if(currentTime.getDate() != writingtime.getDate()){
      data = (24 - writingtime.getHours()) + (currentTime.getHours());
      if(data == 24){
        data = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
      }
      else{
        data += "시간 전";
      }
    }
    else{
      data = (currentTime.getHours() - writingtime.getHours()) + "시간 전";
    }
  }

  return data;
}

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

/*  국회의원 페이지  */
/*  /legislator/page/:l_id  */
router.get('/:l_id', async(req, res, next) => {

  let u_id;

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id;
  }

  let l_id =+ req.params.l_id;

  try {
    let rankingSql = "SELECT * FROM legislator LEFT OUTER JOIN "
        rankingSql += "(SELECT lv_legislator_id, count(*) as score FROM legislatorVote "
        rankingSql += "WHERE islike=? GROUP BY lv_legislator_id) as lv "
        rankingSql += "ON legislator.id = lv.lv_legislator_id ORDER BY lv.score DESC;"

    let likeRankingQuery = await db.queryParamCnt_Arr(rankingSql,[1]);
    let unlikeRankingQuery = await db.queryParamCnt_Arr(rankingSql,[0]);

    if(likeRankingQuery.length == 0 || unlikeRankingQuery.length == 0){
      console.log("query not ok")

      res.status(300).send({
        message: "No Data"
      });
      return;

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
      if (likeRresult[i].score == null) {
          likeRresult[i].ranking = "-위"
      } else {

        if (i==0) {
          likeRresult[i].ranking = 1;
        } else {

          if(likeRresult[i].score == likeRresult[i-1].score) {
            likeRresult[i].ranking = likeRresult[i-1].ranking;
            continue;
          } else if (likeRresult[i].score < likeRresult[i-1].score) {
            likeRresult[i].ranking = i+1;
          }
        }

        likeRresult[i].ranking = (likeRresult[i].ranking).toString() + "위";
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
    for(var i=0; i<unlikeRresult.length; i++) {
      if (unlikeRresult[i].score == null) {
          unlikeRresult[i].ranking = "-위"
      } else {

        if (i==0) {
          unlikeRresult[i].ranking = 1;
        } else {

          if(unlikeRresult[i].score == unlikeRresult[i-1].score) {
            unlikeRresult[i].ranking = unlikeRresult[i-1].ranking;
            continue;
          } else if (unlikeRresult[i].score < unlikeRresult[i-1].score) {
            unlikeRresult[i].ranking = i+1;
          }
        }

        unlikeRresult[i].ranking = (unlikeRresult[i].ranking).toString() + "위";
      }
    }


    // 해당 의원의 정보 가져오기 : 사진, 이름, 소속정당, 지역구 등 and 호감, 비호감 순위 및 득표수
    var result = {};

    for (var i=0; i<likeRresult.length; i++) {
      if(likeRresult[i].id == l_id) {
        result.l_id = likeRresult[i].id;
        result.l_name = likeRankingQuery[i].name;
        result.party_name = likeRankingQuery[i].l_party_name;
        result.position = likeRankingQuery[i].position;
        result.profileimg = likeRankingQuery[i].profile_img_url;
        result.ranking = "호감 " + likeRresult[i].ranking + " / 비호감 ";

        break;
      }
    }

    for (var i=0; i<unlikeRresult.length; i++) {
      if(unlikeRresult[i].id == l_id) {
        result.ranking += unlikeRresult[i].ranking;

        break;
      }
    }

    // 의원 관련 컨텐츠 가져오기
    // 컨텐츠id, 썸네일, 타이틀, 카테고리, 타임
    let select_contents = 'SELECT contents.id as id, thumbnail_url, title, category, writingtime FROM contents LEFT JOIN hash ON contents.id = hash.h_contents_id WHERE hash.h_legislator_id = ?';
    let result_contents = await db.queryParamCnt_Arr(select_contents,[l_id]);

    var contents = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};

      data.id = result_contents[i].id;
      data.thumbnail_url = result_contents[i].thumbnail_url;
      data.title = result_contents[i].title;
      data.category = result_contents[i].category;
      data.writingtime = checktime(result_contents[i].writingtime);

      contents.push(data);
    }
    result.contents = contents;

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
