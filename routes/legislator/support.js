/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  의원에게 후원하기 버튼 눌렀을 때  */
/*  /legislator/support  */
router.get('/', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    return next("401");
  }

  try{
    let u_id = chkToken.id;
    let selectSql =
    `
    SELECT coin
    FROM user
    WHERE id = ?
    `
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);


    let data = {};
    data.user_coin = selectQuery[0].coin;

    res.status(200).send({
      message : "Success",
      data : data
    });


  } catch(error) {
    console.log(error);
    return next("500");
  }

});



/*  의원에게 후원 완료하고 나서  */
/*  /legislator/support  */
router.post('/', async(req, res, next) => {
  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    return next("401");
  }

  try {
    const chkToken = jwt.verify(req.headers.authorization);

    let u_id = chkToken.id;
    let l_id =+ req.body.l_id;
    let coin =+ req.body.coin; // 몇 코인 후원할 것인지

    var user_coin, legislator_coin;


    // 유저의 코인 현황
    let usercoinSql = "SELECT coin FROM user WHERE id = ?;"
    let usercoinQuery = await db.queryParamCnt_Arr(usercoinSql,[u_id]);

    user_coin =+ usercoinQuery[0].coin;

    // update point
    if (user_coin >= coin) {
      let supportSql = "UPDATE legislator SET coin = coin + ? WHERE id = ?;"

      let updateSql = "UPDATE user SET coin = coin - ? WHERE id = ?;"

      let Transaction = await db.Transaction( async (connection) => {
        let supportQuery = await connection.query(supportSql,[coin, l_id]);
        if(!supportQuery){
          return next("500");
        }

        let updateQuery = await connection.query(updateSql,[coin, u_id]);
        if(!updateQuery){
          return next("500");
        }
      })

      if(!Transaction){
        return next("500");
      }

      res.status(201).send({
        message : "Success"
      });
    } else { // 정나미 포인트가 부족해요
      next("1402");
    }

  } catch(error) {
    return next("500");
  }

});

module.exports = router;
