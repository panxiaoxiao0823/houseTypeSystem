/**
 * 用户信息
 */
const model = require('../db/model.js');

// users表model
var users = model.users;

/**
 * 查询users表中是否有当前用户
 * @param {String} userName 当前登录用户名 
 * @param {String} password 当前登录用户密码，没有传password时只查询userName
 * @return {Array} 查询到的用户信息结果
 */
async function _getCurUser({ userName, password }) {
    let whereReq = {
        userName: userName,
        password: password
    };
    if (!password) {
        delete whereReq.password;
    }
    var list = await users.findAll({
        where: whereReq
    });
    return list;
}

/**
 * 在users表中注册当前用户
 * @param {String} userName 当前注册用户名 
 * @param {String} password 当前注册用户密码 
 * @return {*}  -1:当前用户已经有账号，提示直接登录
 *              Object:当前用户信息
 */
async function _register({ userName, password }) {
    let findRes = await _getCurUser({ userName });
    if (findRes && findRes.length) {
        // 当前用户已经有账号，提示直接登录
        return '-1'
    } else {
        // 当前用户为新用户，可注册
        var res = await users.create({
            userName: userName,
            password: password
        });
        return res;
    }
}

/**
 * 在users表中修改当前用户密码
 * @param {String} userName 当前用户名 
 * @param {String} password 当前用户密码 
 * @return {*} -1:未查找到当前用户 ； 
 *             Object:当前用户信息 
 */
async function _forgetPass({ userName, password }) {
    let findRes = await _getCurUser({ userName });
    if (findRes && !findRes.length) {
        // 未查找到当前用户
        return '-1'
    } else {
        // 更新当前用户密码
        let res = await users.update({ password: password }, {
            where: {
                userName: userName
            }
        })
        return res;
    }
}

/**
 * 登录接口
 */
var fn_login = async (ctx, next) => {
    let res = await _getCurUser(ctx.request.body);
    if (res && res.length) {
        ctx.body = {
            code: 0,
            data: {
                userName: res[0].userName,
                uid: res[0].id
            },
            message: "登录成功！"
        }
    } else {
        ctx.body = {
            code: -1,
            data: {},
            message: "登录失败！请确认账号或密码正确！"
        }
    }
}

/**
 * 注册接口
 */
var fn_register = async (ctx, next) => {
    let res = await _register(ctx.request.body);
    if (res == '-1') {
        ctx.body = {
            code: -1,
            data: {},
            message: "该账号已注册，请直接登录！"
        }
    } else {
        ctx.body = {
            code: 0,
            data: {},
            message: "注册成功！"
        }
    }
}

/**
 * 重置密码
 */
var fn_forgetPass = async (ctx, next) => {
    let res = await _forgetPass(ctx.request.body);
    if (res == '-1') {
        ctx.body = {
            code: -1,
            data: {},
            message: "请先注册账号！"
        }
    } else {
        ctx.body = {
            code: 0,
            data: {},
            message: "重置成功！"
        }
    }
}

module.exports = {
    'POST /login': fn_login,
    'POST /register': fn_register,
    'POST /forgetPass': fn_forgetPass,
};
