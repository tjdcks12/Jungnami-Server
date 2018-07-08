//커뮤니티 글 작성 화면
var express = require('express');
var router = express.Router();
const async = require('async');
const db = require('../../module/pool.js');

/* GET home page. */
router.get('/',  async (req, res) => {
  try{

    if(chkToken == -1) {
      res.status(401).send({
        message : "Access Denied"
      });

      return;
    }

    var userid = chkToken.id;


    let getpostingviewQuery = 'SELECT img_url FROM myjungnami.user where id = ?';
    let data = await db.queryParamCnt_Arr(getpostingviewQuery, userid);

    res.status(200).send({
      "message" : "Successfully get posting view",
      "data" : data
    });

    console.log(data);

  }catch(err){
    console.log(err);
    res.status(500).send({
      "message" : "Server error"
    });
  }
});

module.exports = router;
