/* 포인트 충전 하기 */
/* /user/addpoint */
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
    let point = req.body.point;

    // 유저 포인트 추가하기
    let select_addpoint =
    `
    UPDATE user
    SET point = point + ?
    WHERE id = ?
    `;
    let result_addpoint = await db.queryParamCnt_Arr(select_addpoint,[]);
    if(!result_addpoint){
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
