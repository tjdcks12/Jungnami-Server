/*   KIM JI YEON  */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  의원에게 투표 완료  */
/*  /legislator/vote  */
router.post('/', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
    return next("401");
  }
  
  try {
    let u_id = chkToken.id;
    let l_id =+ req.body.l_id;
    let islike =+ req.body.islike;

    let selectSql = 
    `
    SELECT voting_cnt 
    FROM user 
    WHERE id = ?;
    `
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);


    let v_cnt = selectQuery[0].voting_cnt;
    if (v_cnt > 0) {
      let insertSql = 
      `
      INSERT INTO legislatorVote (lv_legislator_id, lv_user_id, islike)
      VALUES (?, ?, ?);
      `

      let updateSql = 
      `
      UPDATE user
      SET voting_cnt = voting_cnt - 1
      WHERE id = ?;
      `

      let Transaction = await db.Transaction( async (connection) => {
        let insertQuery = await connection.query(insertSql, [l_id, u_id, islike]);
        if(!insertQuery){
          console.log("insert error");
          return next("500");
        }

        let updateQuery = await connection.query(updateSql,[u_id]);
        if(!updateQuery){
          console.log("update error");
          return next("500");
        }
      });

      if(!Transaction){
        console.log("transaction error");
        return next("500");
      }

    } else if (v_cnt <= 0) { // 투표권이 부족해요
      return next("1403");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    console.log("server error");
    return next("500");
  }

});

module.exports = router;
