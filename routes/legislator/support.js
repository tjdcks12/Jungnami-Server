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
      res.status(401).send({
          message : "Access Denied"
      });
  }

  let u_id = chkToken.id; 
  let selectSql = "SELECT point FROM user WHERE id = ?;"
  let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);

  if(selectQuery.length == 0){
    res.status(500).send({
        message : "Internal Server Error"
      });
  }else{
    let user_point = selectQuery[0].point;

    res.status(200).send({
        message : "Select Data Success",
        data : user_point
      });
  }

});



/*  의원에게 후원 완료하고 나서  */
/*  /legislator/support  */
router.post('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });
    }

    let u_id = chkToken.id;
    let l_id =+ req.body.l_id;
    let point =+ req.body.point; // 몇 포인트 후원할 것인지

    var user_point, legislator_point;


    // 유저의 포인트 현황
    let userpointSql = "SELECT point FROM user WHERE id = ?;"
    let userpointQuery = await db.queryParamCnt_Arr(userpointSql,[u_id]);

    if(userpointQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");

      user_point =+ userpointQuery[0].point;
    }


    // 의원의 포인트 현황
    let legislatorpointSql = "SELECT point FROM legislator WHERE id = ?;"
    let legislaotrpointQuery = await db.queryParamCnt_Arr(userpointSql,[l_id]);

    if(legislaotrpointQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");

      legislator_point =+ legislaotrpointQuery[0].point;
    }


    // update point
    if (user_point <= point) {

      legislator_point += point;

      let supportSql = "UPDATE legislator SET point = ? WHERE id = ?;"
      let supportQuery = await db.queryParamCnt_Arr(supportSql,[legislator_point, l_id]);

      user_point -= point;

      let updateSql = "UPDATE user SET point = ? WHERE id = ?;"
      let updateQuery = await db.queryParamCnt_Arr(updateSql,[user_point, u_id]);

      res.status(201).send({
        message : "Update Data Success"
      });
    } else { // 정나미 포인트가 부족해요
      res.status(304).send({
        message : "I don't have enough point"
      });
    }

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});

module.exports = router;
