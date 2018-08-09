/* 투표권 충전 하기 */
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
    let vote = req.body.point;

    // 유저 포인트 가져오기
    let select_point =
    `
    SELECT point
    FROM user
    WHERE id = ?
    `;
    var result_point= await db.queryParamCnt_Arr(select_point, [id]);

    // 포인트이 부족한 경우
    if(vote > result_point[0].point){
      return next("1402");
    }

    // 유저 투표권 추가하기
    let select_addvote =
    `
    UPDATE user
    SET voting_cnt = voting_cnt + ?
    WHERE id = ?
    `;

    // 유저 포인트 감소시키기
    let select_subpoint =
    `
    UPDATE user
    SET point = point - ?
    WHERE id = ?
    `;

    let Transaction = await db.Transaction( async (connection) => {
      var result_addvote = await connection.query(select_addvote,[vote, id]);
      if(!result_addvote){
        return next("500");
      }

      let result_subpoint = await connection.query(select_subpoint,[vote, id]);
      if(!result_subpoint){
        return next("500");
      }
    })

    if(!Transaction){
      return next("500");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    console.log(error);
    return next("500");
  }
});

module.exports = router;
