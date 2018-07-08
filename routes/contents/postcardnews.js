/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents_cardnews.js');


/*  컨텐츠 카드뉴스 등록  */
/*  /contents/postcardnews  */
router.post('/', upload.array('cardnews'), async(req, res) => {

  let c_id = req.body.contents_id; // contents_id
  let cardnews = req.files[0].location; // cardnews

  try{

    let orderSql = "SELECT count(*) as ord FROM contentsImg WHERE ci_contentsid = ?;"
    let orderQuery = await db.queryParamCnt_Arr(orderSql, [c_id]);

    let order = orderQuery[0].ord; // 지금까지 order 장 올렸다!

    if(myprofileQuery.length == 0){
      console.log("query not ok");

      res.status(300).send({
            message: "No Data"
      });
      return;
    }

    // contentImg table에 cardnews 저장
    let insertcardnewsSql = "INSERT INTO contentsImg (ci_contents_id, order, img_url) VALUES (?, ?, ?);";
    let insertcardnewsQuery = await db.queryParamCnt_Arr(insertcardnewsSql, [c_id, order + 1, cardnews]);

    if(insertcardnewsQuery == undefined){
      res.status(204).send({
        "message" : "Insert cardnews error"
      });

      return;
    }

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

