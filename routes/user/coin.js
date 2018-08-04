/* 코인 충전 페이지 */
/* /user/coin */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/', async(req, res, next) => {
  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let id = chkToken.id;

    // 유저 포인트 가져오기
    let select_coin =
    `
    SELECT coin
    FROM user
    WHERE id = ?
    `;
    let result_coin = await db.queryParamCnt_Arr(select_coin,[id]);

    // return할 데이터
    var result = [];

    // 코인, 현금 전환 비율 가져오기
    let select_exchange =
    `
    SELECT *
    FROM exchange
    `;
    let result_exchange = await db.queryParamCnt_Arr(select_exchange,[]);

    var result = {};
    result.coin = result_coin[0].coin;
    result.exchange = result_exchange;

    res.status(200).send({
      message : "Success",
      data : result
    });

  } catch(error) {
    return next("500");
  }
});

module.exports = router;
