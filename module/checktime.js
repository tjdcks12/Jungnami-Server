module.exports = {

  // 경과 시간 계산 함수
  checktime : function (time) {

    let currentTime = new Date();
    let writingtime = time; // result_content[i].writingtime;
    var data; // 리턴할 값

    // 작성 10분 이내
    if(currentTime.getTime() - writingtime.getTime() < 600000){
      data = "방금 전";
    } // 1시간 이내
    else if(currentTime.getTime() - writingtime.getTime() < 3600000){
      data = Math.floor((currentTime.getTime() - writingtime.getTime())/60000) + "분 전";
    }// 작성한지 24시간 넘음
    else if(currentTime.getTime() - writingtime.getTime() > 86400000){
      data = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
    } // 24시간 이내
    else{
      if(currentTime.getDate() != writingtime.getDate()){
        data = (24 - writingtime.getHours()) + (currentTime.getHours());
        if(data == 24){
          data = writingtime.getFullYear() + "년 " + (writingtime.getMonth()+1) +"월 " + writingtime.getDate() + "일";
        }
        else{
          data += "시간 전";
        }
      }
      else{
        data = (currentTime.getHours() - writingtime.getHours()) + "시간 전";
      }
    }

    return data;
  }
}
