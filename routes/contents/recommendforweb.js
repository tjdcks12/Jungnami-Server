
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
const checktime = require('../../module/checktime.js');

router.get('/', async (req, res) => {

  const chkToken = jwt.verify(req.headers.authorization);

  var userid;
  if(chkToken == -1){
    userid = "";
  }
  else{
    userid = chkToken.id;
  }

  try{
    // 푸쉬알람 카운트 가져오기
    let pushcntSql = "SELECT count(*) as pushcnt FROM push WHERE p_user_id = ? AND ischecked = false"
    let pushcntQuery = await db.queryParamCnt_Arr(pushcntSql,[userid]);

    // 추천 컨텐츠 다가져오기
    var select_contents = 'SELECT * FROM contents ORDER BY score DESC LIMIT 20';
    var result_contents = await db.queryParamCnt_Arr(select_contents);
    if(result_contents.length == 0){
      res.status(300).send({
        "message" : "NO data"
      });

      return;
    }

    var recommend = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};
      // id
      data.contentsid = result_contents[i].id;

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      recommend.push(data);
    }

    // tmi 가져오기
    select_contents = "SELECT * FROM contents WHERE category = 'tmi' ORDER BY writingtime DESC LIMIT 20";
    result_contents = await db.queryParamCnt_Arr(select_contents);
    if(result_contents.length == 0){
      res.status(300).send({
        "message" : "NO data"
      });

      return;
    }

    var tmi = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};
      // id
      data.contentsid = result_contents[i].id;

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      tmi.push(data);
    }

    // 스토리 가져오기
    select_contents = "SELECT * FROM contents WHERE category = '스토리' ORDER BY writingtime DESC LIMIT 20";
    result_contents = await db.queryParamCnt_Arr(select_contents);
    if(result_contents.length == 0){
      res.status(300).send({
        "message" : "NO data"
      });

      return;
    }

    var story = [];
    for(var i=0; i<result_contents.length; i++){
      var data = {};
      // id
      data.contentsid = result_contents[i].id;

      // title
      data.title = result_contents[i].title;

      // thumbnail
      data.thumbnail = result_contents[i].thumbnail_url;

      // 카테고리 + 시간
      data.text = result_contents[i].category + " · " + checktime.checktime(result_contents[i].writingtime);

      // 동영상 체크
      data.type = result_contents[i].contents_type; // 0: cardnews, 1:youtube_url

      story.push(data);
    }


    res.status(200).send({
      "message" : "Successfully get posting view",
      "data" : {
        recommend : recommend,
        tmi : tmi,
        story : story,
        alarmcnt : pushcntQuery[0].pushcnt
      }
    });

  }catch(err){
    console.log(err);
    res.status(500).send({
      "message" : "Server error"
    });
  }
});

module.exports = router;
