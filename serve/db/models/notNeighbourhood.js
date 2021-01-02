/**
 * 列表模型 表名：notNeighbourhood 未装修小区
 */
const db = require('../db');

module.exports = db.defineModel('notNeighbourhood', {
    neighbourhoodName: db.STRING(100), // 小区名称
    neighbourhoodAdress: db.STRING(100), // 小区地址
    finishDate: db.STRING(100), // 拿钥匙时间
    operatePerson: db.STRING(100), // 录入人
    designer: db.STRING(100), // 设计师
    area: db.BIGINT, // 面积
    houseType: db.STRING(100), // 户型结构
    designIdea: db.STRING(100), // 设计建议
    remark: db.STRING(100), // 备注
});