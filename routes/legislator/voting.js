/* KIM JI YEON */

var express = require('express');
const router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');

/*  의원에게 투표하기 버튼 눌렀을 때  */
/*  /legislator/voting/:u_id  */
router.get('/:u_id', async(req, res, next) => {

  let u_id = req.params.u_id;

  let selectSql = "SELECT voting_cnt FROM user WHERE id = ?;"
  let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);

  if(selectQuery.length == 0){
    res.status(500).send({
        message : "Internal Server Error"
      });
  }else{
    let v_cnt = selectQuery[0].voting_cnt;

    res.status(200).send({
        message : "Select Data Success",
        data : v_cnt
      });
  }

});



/*  의원에게 투표 완료하고 나서  */
/*  /legislator/voting/:u_id  */
router.post('/', async(req, res, next) => {

  try {
    let u_id = req.body.u_id;
    let l_id =+ req.body.l_id;
    let islike =+ req.body.islike;

    let selectSql = "SELECT voting_cnt FROM user WHERE id = ?;"
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);

    if(selectQuery.length == 0){
      console.log("query not ok");
    }else{
      console.log("query ok");
    }

    let v_cnt =+ selectQuery[0].voting_cnt;
    if (v_cnt > 0) {

      let insertSql = "INSERT INTO legislatorVote (lv_legislator_id, lv_user_id, islike) values (?, ?, ?);"
      let insertQuery = await db.queryParamCnt_Arr(insertSql,[l_id, u_id, islike]);

      v_cnt -= 1;

      let updateSql = "UPDATE user SET voting_cnt = ? WHERE id = ?;"
      let updateQuery = await db.queryParamCnt_Arr(updateSql,[v_cnt, u_id]);

      res.status(201).send({
        message : "Insert Data Success"
      });
    } 

  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});

module.exports = router;
