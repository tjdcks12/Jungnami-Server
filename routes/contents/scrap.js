/* 컨텐츠 스크랩 */
/* 종찬 */
/* /contents/scrap */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');


router.post('/',  async (req, res) => {
  try{

    const chkToken = jwt.verify(req.headers.authorization);

    if(chkToken == -1) {
      return next("401");
        // res.status(401).send({
        //     message : "Access Denied"
        // });
        // return;
    }

    let userid = chkToken.id;

    let insert_scrap =
    `
    INSERT INTO
    scrap (s_contents_id, s_user_id)
    VALUES (?,?)
    `
    let result_scrap = await db.queryParamCnt_Arr(insert_scrap,[req.body.contentsid, userid]);

		res.status(201).send({
			"message" : "Success"
	 	});


  }catch(err){
  	console.log(err);
    return next("500");
  	// res.status(500).send({
  	// 	"message" : "Internal Server Error"
  	// });
  }
});

module.exports = router;
