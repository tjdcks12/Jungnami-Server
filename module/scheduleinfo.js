
const async = require('async');
const db = require('../module/pool.js');

module.exports = {
  /* voting cnt 초기화 */
  initscore : async () => {
    console.log("initscore!");
    try {
      let updatesql = 'UPDATE user SET voting_cnt = voting_cnt + 5';
      let resultsql = await db.queryParamCnt_Arr(updatesql);
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
      next(err);
    }
    finally {
    }
  },
  // 컨텐츠 score 계산
  contentsscore : async () => {
    console.log("calculate score start !");
    try{
      /* 1. 오늘 올라온 게시물 score 계산 (조회수 + 좋아요 수) */
      var currentTime = new Date(); // 현재시간

      let selectsql = 'SELECT * FROM contents';
      let resultsql = await db.queryParamCnt_Arr(selectsql);

      for(var i=0; i<resultsql.length; i++){
        // 오늘 작성한 게시물일 경우
        if( (currentTime.getFullYear() == resultsql[i].writingtime.getFullYear()) && (currentTime.getMonth() == resultsql[i].writingtime.getMonth()) && (currentTime.getDate() == resultsql[i].writingtime.getDate()) ){
          // 좋아요 수 구하기
          let selectlike = 'SELECT count(*) as cnt FROM contentsLike WHERE cl_contents_id = ?';
          let likeresult = await db.queryParamCnt_Arr(selectlike, [resultsql[i].id]);

          // score update
          let updatesql = 'UPDATE contents SET score = ? + ? WHERE id = ?';
          let updateresult = await db.queryParamCnt_Arr(updatesql, [resultsql[i].views, likeresult[0].cnt, resultsql[i].id]);
        }
      }

      /* 2. 모든 게시물 점수 30% 감소 */
      let updatescore = 'UPDATE contents SET score = score*0.7';
      let resultscore = await db.queryParamCnt_Arr(updatescore);

      console.log("calculate score finish !");
    }
    catch(err) {
      console.log("mysql error! err log =>" + err);
      next(err);
    }
    finally {
    }
  }
};
