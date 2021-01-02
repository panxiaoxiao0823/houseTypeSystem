/**
 * 用户表users模型 表名：users
 */
const db = require('../db');

module.exports = db.defineModel('users', {
    userName: db.STRING(100),
    password: db.STRING(100),
});