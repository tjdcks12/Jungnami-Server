/*  유저의 투표권   */
/*  /user/vote  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');



/*  투표권 개수 가져오기  */
/*  /user/vote  */
router.get('/', async(req, res, next) => {
  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let id = chkToken.id;

    let select_point =
    `
    SELECT point
    FROM user
    WHERE id = ?
    `
    let result_point = await db.queryParamCnt_Arr(select_point,[id]);

    res.status(200).send({
      message : "Success",
      data : result_point[0].point
    });

  } catch(error) {
    return next("500");
  }
});



/*  투표권 개수 충전하기  */
/*  /user/vote  */
router.post('/', async(req, res, next) => {
  try {
    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let id = chkToken.id;
    let vote = req.body.point;

    // null 방지
    if(!vote){
      vote = 0;
    }

    // 유저 포인트 가져오기
    let select_point =
    `
    SELECT point
    FROM user
    WHERE id = ?
    `;
    var result_point= await db.queryParamCnt_Arr(select_point, [id]);

    // 포인트가 부족한 경우
    if(vote > result_point[0].point){
      return next("1402");
    }

    // 유저 투표권 증가시키기
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
        console.log(error);
        return next("500");
      }

      let result_subpoint = await connection.query(select_subpoint,[vote, id]);
      if(!result_subpoint){
        console.log(error);
        return next("500");
      }
    })

    if(!Transaction){
      console.log(error);
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
