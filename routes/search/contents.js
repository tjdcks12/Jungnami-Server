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
const checktime = require('../../module/checktime.js');

router.get('/:keyword', async(req, res, next) => {

  // 현재시간
  var currentTime = new Date();

  // 자음, 모음까지 검색 되도록 하기 위해 사용
  let searchWord = req.params.keyword;
  let searcher = new hangul.Searcher(searchWord);

  try{

    let select_content = "SELECT * FROM contents ORDER BY score DESC";
    let result_content = await db.queryParamCnt_Arr(select_content);

    // return할 result
    var result = [];
    for(var i=0; i<result_content.length; i++){
        var data = {};
        if(searcher.search(result_content[i].title) >= 0){

        // 제목
        data.title = result_content[i].title;


        // 썸네일
        data.thumbnail = result_content[i].thumbnail_url;


        // 카테고리 + 시간
        data.text = result_content[i].category + " * " + checktime.checktime(result_content[i].writingtime);

        result.push(data);
      }
    }

    if(result.length == 0){
      res.status(300).json({
        message : "No data"
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
