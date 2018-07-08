// test routes

const express = require('express');
const router = express.Router();

var FCM = require('fcm-node');
const async = require('async');

const get_pushdata = require('../../module/pushdata.js');
const serverKey = require('../../config/fcmKey.js').key;


router.get('/', async (req, res, next) => {
  var data = {
    data : [
      {
        name : "종찬",
        age : "26"
      },
      {
        name : "형민",
        age : "25"
      }
    ],
    message : "test"
  };

  var fcmToken = 'c_LgGFeTozc:APA91bHJtuxQsIAoD3IEf_8_pDiQ-9Ef-LX0L6JfhTIE-Yl8gCrdPZHIeKiz1J-skvFLR_crrVO45y0e1WXn_NQWoDpSCnoU7ZOkmKsvJ6hDVFJAyygEnnhj6tItI0lGOre9dzhsLE98v80n5TnClqNACqsyYZ8Lwg';
  //var fcmToken = null;
  if(fcmToken != null){
    var push_data = await get_pushdata.get_pushdata(fcmToken, "내용");

    console.log(push_data);

    var fcm = new FCM(serverKey);

    // console.log(push_data);
    // console.log(serverKey);

    fcm.send(push_data, function(err, response) {
      console.log(push_data);
      if (err) {
        console.error('Push메시지 발송에 실패했습니다.');
        console.error(err);
        return;
      }

      console.log('Push메시지가 발송되었습니다.');
      console.log(response);
    });
  }
  else {
    console.log("No fcmToken");
  }
});

module.exports = router;
