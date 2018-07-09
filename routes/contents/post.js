/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents_thumbnail.js');


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



/*  컨텐츠 게시 완료  */
/*  /contents/post  */
router.post('/', upload.array('thumbnail'), async(req, res) => {

  let title = req.body.title;
  let subtitle = req.body.subtitle;
  let contents_type = req.body.contents_type;
  let category = req.body.category;
  let thumbnail = req.files[0].location;
  let l_id = req.body.l_id; // array

  try{

    if(l_id.length < 1) { // wrong input
      res.status(403).send({
            "message" : "wrong l_id input (l_id is array)"
        });
      return;

    }

    // content table에 thumbnail 저장
    var postSql = "INSERT INTO contents (title, subtitle, thumbnail_url, category, contents_type) VALUES (?, ?, ?, ?, ?);";
    var postResult = await db.queryParamCnt_Arr(postSql,[title, subtitle, thumbnail, category, contents_type]);

    if(postResult != undefined){
      res.status(204).send({
        "message" : "fail insert"
      });

      return;
    }

    // content id 가져오기
    testsql = "SELECT id FROM contents WHERE title = ? AND category = ?;";
    queryResult = await db.queryParamCnt_Arr(testsql,[title, category]);

    let c_id = queryResult[0].id;


    // hash table에 c_id, l_id 저장
    for (var i=0; i<l_id.length; i++) {

      var hashSql = "INSERT INTO hash (h_contents_id, h_legislator_id) VALUES (?, ?);";
      var hashQuery = await db.queryParamCnt_Arr(hashSql, [c_id, l_id[i]]);

      if(hashQuery == undefined) {
        res.status(204).send({
          "message" : "insert hash error"
        });

        return;
      }
    }


    // if(queryResult.length == 0){
    //   console.log("query not ok");

    //   res.status(300).send({
    //     message: "No Data"
    //   });
    //   return;
      
    // }else{
    //   console.log("query ok");

    //   let contentsId = queryResult[0].id; // 가져온 contents id


      // contentImg table에 cardnews 저장
      // testsql = "INSERT INTO contentsImg (ci_contents_id, img_url) VALUES (?, ?);";
      // for(var i=0; i<cardnews.length; i++){
      //   queryResult = await db.queryParamCnt_Arr(testsql,[contentsId, cardnews[i].location]);
      // }

      res.status(201).send({
        message : "Successfully posting contents"
      });
      
    


  } catch (error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }


});


module.exports = router;

