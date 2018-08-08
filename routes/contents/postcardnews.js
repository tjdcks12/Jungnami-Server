/* KIM JI YEON */
/* 사용안함 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents_cardnews.js');


/*  컨텐츠 카드뉴스 등록  */
/*  /contents/postcardnews  */
router.post('/', upload.array('cardnews'), async(req, res, next) => {

  let c_id = req.body.contents_id; // contents_id
  let cardnews = req.files[0].location; // cardnews

  try{

    let orderSql =
    `
    SELECT count(*) as ord
    FROM contentsImg
    WHERE ci_contentsid = ?;
    `
    let orderQuery = await db.queryParamCnt_Arr(orderSql, [c_id]);

    let order = orderQuery[0].ord; // 지금까지 order 장 올렸다!

    // contentImg table에 cardnews 저장
    let insertcardnewsSql =
    `
    INSERT INTO
    contentsImg (ci_contents_id, order, img_url)
    VALUES (?, ?, ?);
    `;
    let insertcardnewsQuery = await db.queryParamCnt_Arr(insertcardnewsSql, [c_id, order + 1, cardnews]);

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
