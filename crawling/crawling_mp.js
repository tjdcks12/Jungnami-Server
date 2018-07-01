// 공공데이터 사이트에서 국회의원 정보 가져오기

var request = require('request');

url = 'http://apis.data.go.kr/9710000/NationalAssemblyInfoService/getMemberCurrStateList';
queryParams = '?' + encodeURIComponent('ServiceKey') + '=gy2wRbSnGh44NhYNZO%2FvpsfcOZlXy%2BnxBrYEsQstMf5b9JVCKiKJ4zHS9OcWrXY0rzWkt%2F452x2XUFPVurhgHA%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('300'); /* 도시코드 */
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 정류소ID */

request({
  url: url + queryParams,
  method: 'GET'
}, function(error, response, body){
  if(error) throw error;

  console.log(body);

});
