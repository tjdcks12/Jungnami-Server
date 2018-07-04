// 데이터 전송 test 및 양식
// 종찬

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/* database test */
router.get('/', async(req, res, next) => {
  console.log("test");

  let testsql = "SELECT * FROM user";
  let result = await db.queryParamCnt_Arr(testsql,[]);

  if(userQuery.length == 0){
    console.log("query not ok");
  }else{
    console.log("query ok");
  }

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

  res.json({
    data : result,
    message : "data ok",
    status : 200
  });
});

module.exports = router;
