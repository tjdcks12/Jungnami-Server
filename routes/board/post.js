//커뮤니티 글 작성 화면
var express = require('express');
var router = express.Router();

const async = require('async');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

/* GET home page. */
router.get('/',  async (req, res) => {
  try{
    const chkToken = jwt.verify(req.headers.authorization);
    if(chkToken == -1) {
      return next("401");
      // res.status(401).send({
      //   message : "Access Denied"
      // });
      //
      // return;
    }

    var userid = chkToken.id;

    let getpostingviewQuery =
    `
    SELECT img_url
    FROM myjungnami.user
    where id = ?
    `;
    let data = await db.queryParamCnt_Arr(getpostingviewQuery, userid);

    res.status(200).send({
      "message" : "Success",
      "data" : {
        img_url : data[0].img_url
      }
    });

  }catch(err){
    console.log(err);
    return next("500");
    // res.status(500).send({
    //   "message" : "Server error"
    // });
  }
});

module.exports = router;
