/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents.js');


/*  관리자가 컨텐츠 글을 게시하는 페이지  */
/*  /contents/post  */
router.get('/', async(req, res, next) => {

  try {

    let legislatorSql = "SELECT id, name, l_party_name, position FROM legislator;"
    let legislatorQuery = await db.queryParamCnt_Arr(legislatorSql,[]);

    if(legislatorQuery.length == 0){
      console.log("query not ok");

      res.status(300).send({
        message: "No Data"
      });
      return;

    }else{
      console.log("query ok");

      res.status(200).send({
        message : "Select Data Success",
        data : legislatorQuery
      });
    }

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});



/*  컨첸츠 게시 완료  */
/*  /contents/post  */
router.post('/', upload.fields([{name : 'thumbnail', maxCount : 1}, {name : 'cardnews', maxCount : 20}]), async(req, res) => {

  let title = req.body.title;
  let category = req.body.category;
  let thumbnail = req.files.thumbnail[0].location;
  let cardnews = eq.files.cardnews; // array

  try{
    // content table에 thumbnail 저장
    var postSql = "INSERT INTO contents (title, thumbnail_url, category) VALUES (?, ?, ?);";
    var postResult = await db.queryParamCnt_Arr(postSql,[title, thumbnail, category]);

    // content id가져오기
    testsql = "SELECT id FROM contents WHERE title = ? AND category = ?;";
    queryResult = await db.queryParamCnt_Arr(testsql,[title, category]);

    if(queryResult.length == 0){
      console.log("query not ok");

      res.status(300).send({
        message: "No Data"
      });
      return;
      
    }else{
      console.log("query ok");

      let contentsId = queryResult[0].id; // 가져온 contents id


      // contentImg table에 cardnews 저장
      testsql = "INSERT INTO contentsImg (ci_contents_id, img_url) VALUES (?, ?);";
      for(var i=0; i<cardnews.length; i++){
        queryResult = await db.queryParamCnt_Arr(testsql,[contentsId, cardnews[i].location]);
      }

      res.status(201).send({
        message : "Successfully posting contents"
      });
      
    }


  } catch (error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }


});


module.exports = router;

