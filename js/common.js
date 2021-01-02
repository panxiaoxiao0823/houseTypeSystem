/**
 * 获取 路由传参key 对应的 value
 * @param {name} String 路由传参key
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

/**
 * 判断当前用户是否登录
 */
var loginInfo = sessionStorage.getItem('loginInfo');
if (loginInfo) {
    // 已经登录
    loginInfo = JSON.parse(loginInfo);
} else {
    // 尚未登录，跳转登录界面
    window.location = 'page/login.html';
}