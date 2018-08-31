/*  컨텐츠 카드뉴스 + 유투브링크 등록  */
/*  /web/contents/post  */
/* 사용안함 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const upload = require('../../module/multer_contents_cardnews.js');


/*  컨텐츠 카드뉴스 등록  */
/*  /web/contents/post/cardnews  */
router.post('/cardnews', upload.array('cardnews'), async(req, res, next) => {

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
  }
});


/*  컨텐츠 유투브링크 등록  */
/*  /web/contents/post/youtubelink  */
router.post('/youtubelink', async(req, res, next) => {

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
  }
});

module.exports = router;
