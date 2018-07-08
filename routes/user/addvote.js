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
      res.status(401).send({
        message : "Access Denied"
      });

      return;
    }

    let id = chkToken.id;
    let vote = req.body.coin;

    // 유저 코인 가져오기
    let select_coin = "SELECT coin FROM user WHERE id = ?";
    var result_coin= await db.queryParamCnt_Arr(select_coin, [id]);
    if(contentscommentCnt.length == 0){
      res.status(300).send({
        "message" : "NO data"
      });

      return;
    }

    console.log(vote + " , " + result_coin[0].coin);
    // 코인이 부족한 경우
    if(vote > result_coin[0].coin){
      res.status(401).send({
        message : "No coin"
      });
      return;
    }

    // 유저 투표권 추가하기
    let select_addvote = "UPDATE user SET voting_cnt = voting_cnt + ? WHERE id = ?";
    var result_addvote = await db.queryParamCnt_Arr(select_addvote,[vote, id]);
    if(result_addvote <= 0){
      res.status(204).send({
        "message" : "No data"
      });

      return;
    }

    // 유저 코인 감소시키기
    let select_subcoin = "UPDATE user SET coin = coin - ? WHERE id = ?";
    let result_subcoin = await db.queryParamCnt_Arr(select_subcoin,[vote, id]);
    if(result_subcoin <= 0){
      res.status(204).send({
        "message" : "No data"
      });

      return;
    }

    res.status(201).send({
      message : "Update value Success"
    });

  } catch(error) {
    res.status(500).send({
      message : "Internal Server Error"
    });
  }
});

module.exports = router;
