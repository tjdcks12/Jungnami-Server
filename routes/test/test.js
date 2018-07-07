/* 코인 충전 하기 */
/* /user/addcoin */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.get('/', async(req, res, next) => {

    // 유저 투표권 추가하기
    let select_addvote = "select * from user";
    var result_addvote = await db.queryParamCnt_Arr(select_addvote,[]);

    console.log(result_addvote);

});

module.exports = router;
