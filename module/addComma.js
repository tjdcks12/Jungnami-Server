module.exports = {
    // 숫자에 comma 붙이기
    addComma : function(num) {
      var regexp = /\B(?=(\d{3})+(?!\d))/g;
      return num.toString().replace(regexp, ',');
    }
};
