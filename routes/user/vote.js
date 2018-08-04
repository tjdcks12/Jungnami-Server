/* 투표권 충전 페이지 */
/* /user/vote */
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

    // 유저 투표권 수 가져오기
    let select_point =
    `
    SELECT coin
    FROM user
    WHERE id = ?
    `
    let result_point = await db.queryParamCnt_Arr(select_point,[id]);

    res.status(200).send({
      message : "Success",
      data : result_point[0].coin
    });

  } catch(error) {
    return next("500");
  }
});

module.exports = router;
