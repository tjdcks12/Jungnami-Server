/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  의원에게 투표하기 버튼 눌렀을 때  */
/*  /legislator/voting/  */
router.get('/', async(req, res, next) => {
  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
    }

    let u_id = chkToken.id;
    let selectSql =
    `
    SELECT voting_cnt
    FROM user
    WHERE id = ?
    `
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);


    let data = {};
    data.voting_cnt = selectQuery[0].voting_cnt;

    res.status(200).send({
      message : "Success",
      data : data
    });

  } catch(error){
    console.log(error);
    return next("500");
  }
});



/*  의원에게 투표 완료하고 나서  */
/*  /legislator/voting  */
router.post('/', async(req, res, next) => {

  try {

    // const chkToken = jwt.verify(req.headers.authorization);
    // if(chkToken == -1) {
    //   res.status(401).send({
    //     message : "Access Denied"
    //   });
    //
    //   return;
    // }

    // let u_id = chkToken.id;
    let u_id = "809253344";
    let l_id =+ req.body.l_id;
    let islike =+ req.body.islike;

    let selectSql = "SELECT voting_cnt FROM user WHERE id = ?;"
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);


    let v_cnt = selectQuery[0].voting_cnt;
    if (v_cnt > 0) {
      let insertSql = "INSERT INTO legislatorVote (lv_legislator_id, lv_user_id, islike) VALUES (?, ?, ?);"

      let updateSql = "UPDATE user SET voting_cnt = voting_cnt - 1 WHERE id = ?;"

      let Transaction = await db.Transaction( async (connection) => {
        let insertQuery = await connection.query(insertSql, [l_id, u_id, islike]);
        if(!insertQuery){
          return next("500");
        }

        let updateQuery = await connection.query(updateSql,[]);
        if(!updateQuery){
          return next("500");
        }
      });

      if(!Transaction){
        return next("500");
      }

    } else if (v_cnt <= 0) { // 투표권이 부족해요
      return next("1403");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    return next("500");
  }

});

module.exports = router;
