/* 정당목록 조회 */
/* /legislatorlist/partylist */
/* 종찬 */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

router.get('/', async(req, res, next) => {

  try{
    // 의석 수 내림차순으로 정렬
    let selectQuery =
    `
    SELECT name, cnt
    FROM party
    LEFT JOIN (SELECT l_party_name, count(*) as cnt FROM legislator GROUP BY l_party_name) as l
    ON party.name = l.l_party_name
    ORDER BY cnt DESC
    `

    let result = await db.queryParamCnt_Arr(selectQuery,[]);

    res.json({
      message : "Success",
      data : result
    });
  } catch(error) {
    return next("500");
  }
});

module.exports = router;
