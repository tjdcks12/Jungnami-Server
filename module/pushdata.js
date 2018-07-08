module.exports = {
  get_pushdata : function(fcmToken, body){
    /** 발송할 Push 메시지 내용 */
    var push_data = {
        // 수신대상
        to: fcmToken,
        // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
        notification: {
            title: "정치가 나의 미래다",
            body: body, // content
            sound: "default",
            click_action: "FCM_PLUGIN_ACTIVITY",
            icon: "fcm_push_icon"
            //icon: https://myrubysbucket.s3.ap-northeast-2.amazonaws.com/user_img/toy-story-aliens-three-eyes.jpg
        },
        // 메시지 중요도
        priority: "high",
        // App 패키지 이름
        restricted_package_name: "sopt_jungnami_android.jungnami",
        // App에게 전달할 데이터
        data : {
          testdata : "testdata"
        }
    };

    return push_data;
  }
};
