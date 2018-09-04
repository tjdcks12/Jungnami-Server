/*  유저의 정나미 포인트   */
/*  /user/point  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');



/*  정나미 포인트 가져오기  */
/*  /user/point  */
router.get('/', async(req, res, next) => {
  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let id = chkToken.id;

    // 유저 포인트 가져오기
    let select_point =
    `
    SELECT point
    FROM user
    WHERE id = ?
    `;
    let result_point = await db.queryParamCnt_Arr(select_point,[id]);

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
    result.point = result_point[0].point;
    result.exchange = result_exchange;

    res.status(200).send({
      message : "Success",
      data : result
    });

  } catch(error) {
    return next("500");
  }
});



/*  정나미 포인트 충전하기  */
/*  /user/point  */
router.post('/', async(req, res, next) => {
  try {
    const chkToken = jwt.verify(req.headers.authorization);
    if(chkToken == -1) {
      return next("401");
    }

    let id = chkToken.id;
    let point = req.body.point;
    
    // null 방지 : point + null = null
    if(!point){
      point = 0;
    }

    // 유저 포인트 증가하기
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
