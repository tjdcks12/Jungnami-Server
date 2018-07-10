// 데이터 전송 test 및 양식
// 종찬

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/* database test */
router.get('/', async(req, res, next) => {
  console.log("test");


//p_follower_id p_boardComment_id p_boardLike_id

  let updatesql = "update push set p_follower_id = '0', p_boardComment_id = '0', p_boardLike_id = '0' "
      updatesql += "where p_follower_id is null or p_boardComment_id is null or p_boardLike_id = '0';"
  let updatedate = await db.queryParamCnt_Arr(updatesql, []);

  console.log(updatedate.affectedRows)



  // let deletesql = "delete from test where test = '1234'"
  // let deletedate = await db.queryParamCnt_Arr(deletesql, []);

  // console.log(deletedate.affectedRows)


  if (updatedate.affectedRows < 1) {

    res.json({
        message : "delete error",
        status : 204
      });
  } else {

    res.json({
        message : "delete success",
        status : 200
      });
  }

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
