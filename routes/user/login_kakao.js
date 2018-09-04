/* 카카오톡 로그인 */
/* /user/kakaologin */


const express = require('express');
const router = express.Router();
const async = require('async');
const bodyParser = require('body-parser');
const http = require('http');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


const jwt = require('../../module/jwt.js');
const db = require('../../module/pool.js');

const request = require('request-promise');

router.post('/', async(req, res, next) => {
  // 카카오톡 access token
  let accessToken = req.body.accessToken;
  if(!accessToken){
    return next("401");
  }

  // push 알람 클라이언트 토큰
  let fcmToken = req.body.fcmToken;

  let option = {
    method : 'GET',
    uri: 'https://kapi.kakao.com/v2/user/me',
    json : true,
    headers : {
      'Authorization': "Bearer " +  accessToken
    }
  }

  try {
    let kakaoResult = await request(option);

    let result = {};
    result.nickname = kakaoResult.properties.nickname;
    result.thumbnail_image = kakaoResult.properties.thumbnail_image;

    var nickname = kakaoResult.properties.nickname;
    var img_url = kakaoResult.properties.thumbnail_image;

    var id = kakaoResult.id;
    var token;

    var chkToken;
    if(req.headers.authorization != undefined){
      chkToken = jwt.verify(req.headers.authorization);
    }


    let checkidQuery =
    `
    SELECT * FROM user
    WHERE id = ?
    `;

    let insertQuery =
    `
    INSERT INTO user (id, nickname, img_url, fcmToken)
    VALUES (?, ?, ?, ?);
    `;
    let updateQuery =
    `
    UPDATE user SET fcmToken = ? WHERE id = ?;
    `;

    if(chkToken != undefined){ // 토큰이 이미 있는 경우 (로그인 되어있는 경우)
      console.log("토큰이 있습니다");
      if(chkToken.id == id){
        console.log("성공적으로 로그인 되었습니다");
        token = jwt.sign(id);
        res.status(201).send({
          data : {
            id : id,
            token : token
          },
          message : "Success"
        });
      } else { // 토큰이 만료된 경우 재발급
        console.log("기간이 만료되었습니다. 재발급 합니다");
        token = jwt.sign(id);
        res.status(201).send({
          data : {
            id : id,
            token : token
          },
          message : "Success"
        })
      }
    } else{ // 토큰이 없는 경우
      let checkid = await db.queryParamCnt_Arr(checkidQuery,[id]);

      if(checkid.length != 0){ // 기기를 변경했을 경우
        // fcm token update
        // 모바일일 경우 푸쉬알람 토큰 업데이트
        if(req.useragent.isMobile){
          let updateResult = await db.queryParamCnt_Arr(updateQuery, [fcmToken, id]);
          if(!updateResult){
            return next("500");
          }
        }

        console.log("다른기기에서 접속했습니다");
        token = jwt.sign(id);
        res.status(201).send({
          data : {
            id : id,
            token : token
          },
          message : "Success"
        });
      } else{ // 다른 기기이고 회원이 아닐때
        console.log("비회원입니다.")

        let insertResult = await db.queryParamCnt_Arr(insertQuery,[id, nickname ,img_url, fcmToken]);
        if(!insertResult){
          return next("500");
        }

        token = jwt.sign(id);

        res.status(201).send({
          data : {
            id : id,
            token : token
          },
          message : "Success"
        })
      }
    }
  }
  catch(err) {
    console.log("kakao Error => " + err);
    next(err);
  }
  finally {
    console.log('finally');
  }
});

module.exports = router;