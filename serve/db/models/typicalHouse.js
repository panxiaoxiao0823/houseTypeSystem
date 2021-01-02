/**
 * 列表模型 表名：typicalHouse 典型户型
 */
const db = require('../db');

module.exports = db.defineModel('typicalHouse', {
    operatePerson: db.STRING(100), // 录入人
    area: db.BIGINT, // 面积
    houseType: db.STRING(100), // 户型结构
    houseFeature: db.STRING(100), // 户型特点
    decorationSuggestions: db.STRING(100), // 装修建议
    remark: db.STRING(100), // 备注
});