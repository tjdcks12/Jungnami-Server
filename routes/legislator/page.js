/*  국회의원 페이지  */
/*  /legislator/page  */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');
const checktime = require('../../module/checktime.js');


/*  /legislator/page/:l_id  */
router.get('/:l_id', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);
  let u_id;

  if(chkToken == -1) {
    u_id = '';
  } else {
    u_id = chkToken.id;
  }

  let l_id =+ req.params.l_id;

  try {
    let rankingSql =
    `
    SELECT *
    FROM legislator
    LEFT OUTER JOIN (SELECT lv_legislator_id, count(*) as score FROM legislatorVote WHERE islike=? GROUP BY lv_legislator_id) as lv
    ON legislator.id = lv.lv_legislator_id
    ORDER BY lv.score DESC;
    `

    let likeRankingQuery = await db.queryParamCnt_Arr(rankingSql,[1]);
    let unlikeRankingQuery = await db.queryParamCnt_Arr(rankingSql,[0]);

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
          likeRresult[i].ranking = "-"
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

        likeRresult[i].ranking = (likeRresult[i].ranking).toString();
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
          unlikeRresult[i].ranking = "-"
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

        unlikeRresult[i].ranking = (unlikeRresult[i].ranking).toString();
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
        result.likerank = likeRresult[i].ranking;

        break;
      }
    }

    for (var i=0; i<unlikeRresult.length; i++) {
      if(unlikeRresult[i].id == l_id) {
        result.unlikerank = unlikeRresult[i].ranking;

        break;
      }
    }

    // 의원 관련 컨텐츠 가져오기
    // 컨텐츠id, 썸네일, 타이틀, 카테고리, 타임
    let select_contents =
    `
    SELECT contents.id as id, thumbnail_url, title, category, contents_type, writingtime
    FROM contents
    LEFT JOIN hash
    ON contents.id = hash.h_contents_id
    WHERE hash.h_legislator_id = ?
    `;
    let result_contents = await db.queryParamCnt_Arr(select_contents,[l_id]);

    var contents = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};

      data.c_id = result_contents[i].id;
      data.thumbnail = result_contents[i].thumbnail_url;
      data.c_title = result_contents[i].title;
      data.c_type =  result_contents[i].contents_type;
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      contents.push(data);
    }
    result.contents = contents;

    res.status(200).send({
        message : "Success",
        data : result
      });

  } catch(error) {
    return next("500");
  }
});

module.exports = router;
