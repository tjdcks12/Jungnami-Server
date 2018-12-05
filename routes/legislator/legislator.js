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
    let name = req.body.name;
    let profile_img_url = req.files[0].location;

    let selectLegislatorSql =
    `
    SELECT id
    FROM legislator
    WHERE name = ?;
    `

    let selectLegislatorQuery = await db.queryParamCnt_Arr(selectLegislatorSql,[name]);

    if(selectLegislatorQuery.length < 1){

      return res.status(400).send({
        message : name + " 의원은 없는 의원입니다."
      });
    
    } else{

      let updateSql =
      `
      UPDATE legislator
      SET profile_img_url = ?
      WHERE name = ?;
      `
  
      let updateQuery = await db.queryParamCnt_Arr(updateSql,[profile_img_url, name]);
  
      if(!updateQuery){
        return next("500");
      }

      res.status(201).send({
        message : name + " 의원 프로필 변경 완료"
      });
    }

  } catch(error) {
    return next("500");
  }

});

module.exports = router;