/**
 * 列表模型 表名：finishNeighbourhood 完工小区
 */
const db = require('../db');

module.exports = db.defineModel('finishNeighbourhood', {
    neighbourhoodName: db.STRING(100), // 小区名称
    neighbourhoodAdress: db.STRING(100), // 小区地址
    finishDate: db.STRING(100), // 完工时期
    operatePerson: db.STRING(100), // 录入人
    designer: db.STRING(100), // 设计师
    area: db.BIGINT, // 面积
    houseType: db.STRING(100), // 户型结构
    remark: db.STRING(100), // 备注
});