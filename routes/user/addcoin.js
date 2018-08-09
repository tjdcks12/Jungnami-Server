/* 코인 충전 하기 */
/* /user/addcoin */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.post('/', async(req, res, next) => {
  try {
    const chkToken = jwt.verify(req.headers.authorization);
    if(chkToken == -1) {
      return next("401");
    }

    let id = chkToken.id;
    let coin = req.body.coin;

    // 유저 코인 추가하기
    let select_addcoin =
    `
    UPDATE user
    SET coin = coin + ?
    WHERE id = ?
    `;
    let result_addcoin = await db.queryParamCnt_Arr(select_addcoin,[]);
    if(!result_addcoin){
      return next("500");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    return next("500");
  }
});

module.exports = router;
