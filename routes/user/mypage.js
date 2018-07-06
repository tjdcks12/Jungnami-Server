/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');


/*  유저의 마이 페이지  */
/*  /user/mapage/:u_id  */
router.get('/:mypage_id', async(req, res, next) => {

  const chkToken = jwt.verify(req.headers.authorization);

  if(chkToken == -1) {
      res.status(401).send({
          message : "Access Denied"
      });
  }

  let u_id = chkToken.id; // 
  let mypage_id = req.params.mypage_id; // 해당 계정 주인

  try {

    let selectSql = "SELECT * FROM user WHERE id = ?"

    let selectQuery = await db.queryParamCnt_Arr(selectSql,[mypage_id]);

    var result = {};

    if(selectQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");

      result.mypage_id = mypage_id;
      result.nickname = selectQuery[0].nickname;
      result.img_url = selectQuery[0].img_url;

      if (u_id == mypage_id) {  // 내가 내 계정에 들어온거라면 

        result.point = selectQuery[0].point;
        result.voting_cnt = selectQuery[0].voting_cnt;

      }
    }

    res.status(200).send({
        message : "Select Data Success",
        data : result
      });

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }
});

module.exports = router;
