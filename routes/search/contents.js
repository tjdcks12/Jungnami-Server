/* 컨텐츠 검색 */
/*  /search/contents */
/* 종찬 */


var express = require('express');
const router = express.Router();

const async = require('async');

const jwt = require('../../module/jwt.js');
const addComma = require('../../module/addComma.js');
const db = require('../../module/pool.js');
const hangul = require('hangul-js');

router.get('/:keyword', async(req, res, next) => {

  // 현재시간
  var currentTime = new Date();

  // 자음, 모음까지 검색 되도록 하기 위해 사용
  let searchWord = req.params.keyword;
  let searcher = new hangul.Searcher(searchWord);

  try{

    let select_content = "SELECT contents.id, lh.name, title, thumbnail_url, writingtime, category, score FROM contents LEFT JOIN (SELECT * FROM legislator LEFT JOIN hash ON legislator.id = hash.h_legislator_id) as lh ON contents.id = lh.h_contents_id GROUP BY score";
    let result_content = await db.queryParamCnt_Arr(select_content);

    // return할 result
    var result = [];
    for(var i=0; i<result_content.length; i++){
        var data = {};
        if(searcher.search(result_content[i].title) >= 0){

        // 제목
        data.title = result_content[i].title;

        //카테고리
        data.category = result_content[i].category;

        // 썸네일
        data.thumbnail = result_content[i].thumbnail_url;

        // 시간 계산
        // 작성 10분 이내
        var writingtime = result_content[i].writingtime;
        if(currentTime.getTime() - writingtime.getTime() < 600000){
          data.writingtime = "방금 전";
        } // 1시간 이내
        else if(currentTime.getTime() - writingtime.getTime() < 3600000){
          data.writingtime = Math.floor((currentTime.getTime() - writingtime.getTime())/60000) + "분 전";
        }// 작성한지 24시간 넘음
        else if(currentTime.getTime() - writingtime.getTime() > 86400000){
          data.writingtime = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
        } // 24시간 이내
        else{
          if(currentTime.getDate() != writingtime.getDate()){
            data.writingtime = (24 - writingtime.getHours()) + (currentTime.getHours());
            if(data.writingtime == 24){
              data.writingtime = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
            }
            else{
              data.writingtime += "시간 전";
            }
          }
          else{
            data.writingtime = (currentTime.getHours() - writingtime.getHours()) + "시간 전";
          }
        }

        // console.log(writingtime.toLocaleString());
        // console.log(data.writingtime);

        // 좋아요 수
        let select_like = "SELECT * FROM contentsLike WHERE cl_contents_id = ?";
        let result_like = await db.queryParamCnt_Arr(select_like, result_content[i].id);
        data.likecnt = addComma.addComma(result_like.length);

        // 댓글 수
        let select_comment = "SELECT * FROM contentsComment WHERE cc_contents_id = ?";
        let result_comment = await db.queryParamCnt_Arr(select_comment, result_content[i].id);
        data.commentcnt = addComma.addComma(result_comment.length);

        result.push(data);
      }
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

  }catch(error) {
    console.log(error);
    res.status(500).send({
      message : "Internal Server Error"
    });
  }
});

module.exports = router;
