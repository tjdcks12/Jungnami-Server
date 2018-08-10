/*  KIM JI YEON  */

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
    SELECT point
    FROM user
    WHERE id = ?
    `
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);


    let data = {};
    data.user_point = selectQuery[0].point;

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
    let point =+ req.body.point; // 몇 포인트 후원할 것인지


    // 유저의 포인트 현황
    let userpointSql = "SELECT point FROM user WHERE id = ?;"
    let userpointQuery = await db.queryParamCnt_Arr(userpointSql,[u_id]);

    var user_point =+ userpointQuery[0].point;

    // update point
    if (user_point >= point) {
      let supportSql = 
      `
      UPDATE legislator
      SET point = point + ?
      WHERE id = ?;
      `;

      let updateSql = 
      `
      UPDATE user 
      SET point = point - ? 
      WHERE id = ?;
      `

      let Transaction = await db.Transaction( async (connection) => {
        let supportQuery = await connection.query(supportSql,[point, l_id]);
        if(!supportQuery){
          console.log("update legislator error");
          return next("500");
        }

        let updateQuery = await connection.query(updateSql,[point, u_id]);
        if(!updateQuery){
          console.log("update user error");
          return next("500");
        }
      })

      if(!Transaction){
        console.log("transaction error"); // 수진이 여기서 에러남
        return next("500");
      }

      res.status(201).send({
        message : "Success"
      });
    } else { // 정나미 포인트가 부족해요
      next("1402");
    }

  } catch(error) {
    console.log("server error");
    return next("500");
  }

});

module.exports = router;
