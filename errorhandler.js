const errors = require('./errors');
const moment = require('moment');

module.exports = (app) => {

  app.use((err, req, res, next) => {
    if(err == 404){
      console.log("test")
      return next();
    }

    // 서버측 에러
    // 에러가 숫자일 경우
    if(isNaN(err)){
      err = 500;
    }

    var error = errors[err];
    console.log(moment().format('YYYY.MM.DD h:mm:ss a ]') + " >> " + error.code + " : " + error.description);

    var result = {
      "message" : error.message
    }
    return res.status(error.status).json(result);
  });
};
