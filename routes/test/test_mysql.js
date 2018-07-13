// 데이터 전송 test 및 양식
// 종찬

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/* database test */
router.post('/', async(req, res, next) => {
  console.log("test");


  let u_id = req.body.u_id;
  let l_id =+ req.body.l_id;
  let islike =+ req.body.islike;
  let vote =+ req.body.vote;

  for(var i=0; i<vote; i++){
    let insertSql = "INSERT INTO legislatorVote (lv_legislator_id, lv_user_id, islike) VALUES (?, ?, ?);"
    let insertQuery = await db.queryParamCnt_Arr(insertSql,[l_id, u_id, islike]);

    if(insertQuery == undefined){
      res.status(204).send({
        "message" : "insert error"
      });

      return;
    }
  }
  res.status(201).send({
        "message" : "successfully voting"
  });

//p_follower_id p_boardComment_id p_boardLike_id

  // let updatesql = "update user set img_url = '0' "
  //     updatesql += "where img_url is null;"
  // let updatedate = await db.queryParamCnt_Arr(updatesql, []);

  // console.log(updatedate.affectedRows)



  // let deletesql = "delete from test where test = '1234'"
  // let deletedate = await db.queryParamCnt_Arr(deletesql, []);

  // console.log(deletedate.affectedRows)


  // if (updatedate.affectedRows < 1) {

  //   res.json({
  //       message : "delete error",
  //       status : 204
  //     });
  // } else {

  //   res.json({
  //       message : "delete success",
  //       status : 200
  //     });
  // }

  // let testsql = "SELECT * FROM user";
  // let result = await db.queryParamCnt_Arr(testsql,[]);

  // if(userQuery.length == 0){
  //   console.log("query not ok");
  // }else{
  //   console.log("query ok");
  // }

  // 이렇게 파싱안해도 된다.
  // var result = [];
  // for(var i=0; i<userQuery.length; i++){
  //   var userinfo = {};
  //
  //   userinfo.id = userQuery[i].id;
  //   userinfo.name = userQuery[i].name;
  //   userinfo.nickname = userQuery[i].nickname;
  //
  //   result.push(userinfo);
  // }

  // res.json({
  //   data : result,
  //   message : "data ok",
  //   status : 200
  // });
});

module.exports = router;
