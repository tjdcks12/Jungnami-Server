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
        res.status(401).send({
            message : "Access Denied"
        });
        return;
    }

    let u_id = chkToken.id;
    let selectSql = "SELECT voting_cnt FROM user WHERE id = ?;"
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);

    if(selectQuery.length == 0){

      res.status(300).send({
            message: "No Data"
      });
      return;

    }else{
      let data = {};
      data.voting_cnt = selectQuery[0].voting_cnt;

      res.status(200).send({
          message : "Select Data Success",
          data : data
        });
    }


  } catch(error){

    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});



/*  의원에게 투표 완료하고 나서  */
/*  /legislator/voting  */
router.post('/', async(req, res, next) => {

  try {

    const chkToken = jwt.verify(req.headers.authorization);
    if(chkToken == -1) {
        res.status(401).send({
            message : "Access Denied"
        });

        return;
    }

    let u_id = chkToken.id;
    let l_id =+ req.body.l_id;
    let islike =+ req.body.islike;

    let selectSql = "SELECT voting_cnt FROM user WHERE id = ?;"
    let selectQuery = await db.queryParamCnt_Arr(selectSql,[u_id]);

    if(selectQuery.length == 0){
      console.log("query not ok");

      res.status(300).send({
            message: "No Data"
      });
      return;

    }else{
      console.log("query ok");

      let v_cnt = selectQuery[0].voting_cnt;
      if (v_cnt > 0) {

        let insertSql = "INSERT INTO legislatorVote (lv_legislator_id, lv_user_id, islike) VALUES (?, ?, ?);"
        let insertQuery = await db.queryParamCnt_Arr(insertSql,[l_id, u_id, islike]);

          if(insertQuery == undefined){
            res.status(204).send({
              "message" : "insert error"
            });

            return;
          }


        let updateSql = "UPDATE user SET voting_cnt = voting_cnt - 1 WHERE id = ?;"
        let updateQuery = await db.queryParamCnt_Arr(updateSql,[u_id]);

        if(updateQuery <= 0){
          res.status(204).send({
            "message" : "updata data error"
          });

          return;
        }

      } else if (v_cnt <= 0) { // 투표권이 부족해요

        res.status(401).send({
          message : "I don't have enough voting_cnt"
        });
        return;
      }


        res.status(201).send({
          message : "Insert and Update Data Success"
        });
    }
  } catch(error) {
    res.status(500).send({
        message : "Internal Server Error"
      });
  }

});

module.exports = router;
