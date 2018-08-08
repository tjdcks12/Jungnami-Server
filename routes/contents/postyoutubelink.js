/* KIM JI YEON */
/* 사용안함 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');


/*  컨텐츠 영상 링크 등록  */
/*  /contents/postyoutubelink  */
router.post('/', async(req, res, next) => {

  let c_id = req.body.contents_id; // contents_id
  let youtubelink = req.body.youtubelink; // youtubelink

  try{
      // content table에 youtubelink 삽입
      let insertyoutubelinkSql =
      `
      UPDATE contents
      SET youtubelink = ?
      WHERE id = ?;
      `
      let insertyoutubelinkQuery = await db.queryParamCnt_Arr(insertyoutubelinkSql,[youtubelink, c_id]);


      res.status(201).send({
        message : "Success"
      });

  } catch (error) {
    return next("500");
    // res.status(500).send({
    //     message : "Internal Server Error"
    //   });
  }
});


module.exports = router;
