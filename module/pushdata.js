module.exports = {
  get_pushdata : function(fcmToken, data){
    /** 발송할 Push 메시지 내용 */
    var push_data = {
        // 수신대상
        to: fcmToken,
        // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
        notification: {
            title: "Hello Node",
            body: "Node로 발송하는 Push 메시지 입니다.",
            sound: "default",
            click_action: "FCM_PLUGIN_ACTIVITY",
            icon: "fcm_push_icon"
        },
        // 메시지 중요도
        priority: "high",
        // App 패키지 이름
        restricted_package_name: "sopt_jungnami_android.jungnami",
        // App에게 전달할 데이터
        data : data
        // data: {
        //     num1: 2000,
        //     num2: 3000
        // }
    };

    return push_data;
  }
};
