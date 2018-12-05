/*  300명의 의원 목록 (이름, 정당, 지역구)  */
/*  /legislator  */

var express = require('express');
const router = express.Router();

const async = require('async');
const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

const upload = require('../../module/multer_legislator_img.js');

router.get('/', async(req, res, next) => {

    try {
      let legislatorSql =
      `
      SELECT id, name, l_party_name, position
      FROM legislator
      `
      let legislatorQuery = await db.queryParamCnt_Arr(legislatorSql,[]);
  
      res.status(200).send({
        message : "Success",
        data : legislatorQuery
      });
  
    } catch(error) {
      return next("500");
    }
});


router.post('/profile', upload.array('profile'), async(req, res, next) => {

  try {

    console.log("들어오긴 함")

    let name = req.body.name;
    let profile_img_url = req.files[0].location;

    let updateSql =
    `
    UPDATE legislator
    SET profile_img_url = ?
    WHERE name = ?;
    `
    console.log("update sql")

    let updateQuery = await db.queryParamCnt_Arr(updateSql,[profile_img_url, name]);

    console.log("update query")

    if(!updateQuery){
      return next("500");
    }

    res.status(201).send({
      message : "Success"
    });

  } catch(error) {
    console.log("왜 그러지")
    return next("500");
  }

});
  

module.exports = router;