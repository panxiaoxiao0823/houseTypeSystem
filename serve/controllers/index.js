const model = require('../db/model.js');
const {
    Op
} = require("sequelize");
const formatTimeToStr = require('../public/javascripts/date')
const xlsx = require('node-xlsx')
const fs = require('fs')

var models = {
    finishNeighbourhood: model.finishNeighbourhood, // 已完工小区finishNeighbourhood 表model
    notNeighbourhood: model.notNeighbourhood, // 未装修小区notNeighbourhood 表model
    typicalHouse: model.typicalHouse, // 典型户型typicalHouse 表model
};

/**
 * 获取所有数据
 */
async function fn_getRows(params) {
    let table = models[params.type];
    let whereObj = {};
    if (params.searchParams) {
        let jsonSearchParams = JSON.parse(params.searchParams);
        for (var i in jsonSearchParams) {
            if (jsonSearchParams[i]) {
                whereObj[i] = {
                    [Op.substring]: jsonSearchParams[i]
                }
            }
        }
    }

    var res = await table.findAndCountAll({
            where: whereObj,
            offset: (Number(params.page) - 1) * Number(params.size),
            limit: Number(params.size),
        }).then((res) => [null, res])
        .catch((err) => [err, null]);
    if (res[0]) {
        return null;
    } else if (res[1]) {
        return res[1];
    }
}

/**
 * 获取列表
 * @param {*} ctx 
 * @param {*} next 
 */
var fn_getList = async (ctx, next) => {
    let list = await fn_getRows(ctx.request.body);
    if (list) {
        list.rows.forEach(v => {
            v.createdAt = formatTimeToStr(v.createdAt, 'yyyy-MM-dd')
        })
        ctx.body = {
            code: 0,
            count: list.count,
            data: list.rows,
            message: "获取成功！"
        }
    } else {
        ctx.body = {
            code: -1,
            count: 0,
            data: [],
            message: "获取失败！"
        }
    }
}

/**
 * 修改行数据
 * @param {*} ctx 
 * @param {*} next 
 */
var fn_updateRow = async (ctx, next) => {
    let params = ctx.request.body;
    let table = models[params.type];
    let res = await table.update(JSON.parse(params.formDate), {
        where: {
            id: params.id,
        }
    }) // res返回值为[ <number> ]，其中<number>为修改了几条数据
    let modifyCtx = false; // 修改失败
    if (typeof res[0] === 'number') {
        if (res[0] === 1) {
            // 更新了一条数据
            modifyCtx = true;
        } else if (res[0] === 0) {
            // 没有更新数据
            modifyCtx = false;
        }
    } else {
        modifyCtx = false;
    }
    if (modifyCtx) {
        ctx.body = {
            code: 0,
            data: {},
            message: "修改成功！"
        }
    } else {
        ctx.body = {
            code: -1,
            data: {},
            message: "修改失败！"
        }
    }
}

/**
 * 删除
 * @param {*} ctx 
 * @param {*} next 
 */
var fn_deleteRows = async (ctx, next) => {
    let params = ctx.request.body;
    let table = models[params.type];
    let idArr = JSON.parse(params.idArr);
    let errNumber = 0;
    let res = await table.destroy({
        where: {
            id: {
                [Op.in]: idArr
            },
        }
    }) // res返回值为<number>，删除了几条数据，此方法属于物理删除，删除后无法进行恢复
    let modifyCtx = false; // 修改失败
    if (typeof res === 'number') {
        if (res === idArr.length) {
            // 删除了当前idArr所有数据
            modifyCtx = true;
        } else {
            // 有数据删除失败
            modifyCtx = false;
            errNumber = idArr.length - res;
        }
    } else {
        modifyCtx = false;
    }
    if (modifyCtx) {
        ctx.body = {
            code: 0,
            data: {},
            message: "删除成功！"
        }
    } else {
        ctx.body = {
            code: -1,
            data: {},
            message: `${errNumber==0?'':'条数据'}删除失败！`
        }
    }
}

/**
 * 添加某一项
 * @param {*} ctx 
 * @param {*} next 
 */
var fn_addRow = async (ctx, next) => {
    let params = ctx.request.body;
    let table = models[params.type];
    let res = await table.create(params).then((res) => [null, res])
        .catch((err) => [err, null])

    if (res[0]) {
        console.log(res)
        ctx.body = {
            code: -1,
            data: {},
            message: '添加失败！'
        }
    } else if (res[1]) {
        ctx.body = {
            code: 0,
            data: {},
            message: "添加成功！"
        }
    }
}

/**
 * 写入文件
 * @param {*} datas 
 */
function writeXls(datas) {
    let buffer = xlsx.build([{
        name: 'sheet1',
        data: datas
    }]);
    fs.writeFileSync('./public/files/export.xlsx', buffer, {
        'flag': 'w'
    });
}

/**
 * 导出
 * @param {*} ctx 
 * @param {*} next 
 */
var fn_export = async (ctx, next) => {
    let params = ctx.request.body;
    let table = models[params.type];

    var res = await table.findAll({
            where: {},
        }).then((res) => [null, res])
        .catch((err) => [err, null]);

    let data = [] // 要写入excel的数组 
    let title = []; // 列名
    if (params.type == 'finishNeighbourhood') {
        // 完工小区
        title = ['序号', '小区名称', '小区地址', '录入人', '录入日期', '完工时期', '设计师', '面积', '户型结构', '备注']
    } else if (params.type == 'notNeighbourhood') {
        // 未装修小区
        title = ['序号', '小区名称', '小区地址', '录入人', '录入日期', '拿钥匙时间', '设计师', '面积', '户型结构', '设计意见', '备注']
    } else if (params.type == 'typicalHouse') {
        // 典型户型
        title = ['序号', '录入人', '录入日期', '面积', '户型结构', '户型特点', '装修建议', '备注'] 
    }

    data.push(title) // 添加完列名 下面就是添加真正的内容了

    res[1].forEach((element) => {
        let arrInner = []
        let keys = {
            finishNeighbourhood: ['id', 'neighbourhoodName', 'neighbourhoodAdress', 'operatePerson', 'createdAt', 'finishDate', 'designer', 'area', 'houseType', 'remark'],
            notNeighbourhood: ['id', 'neighbourhoodName', 'neighbourhoodAdress', 'operatePerson', 'createdAt', 'finishDate', 'designer', 'area', 'houseType', 'designIdea', 'remark'],
            typicalHouse: ['id', 'operatePerson', 'createdAt', 'area', 'houseType', 'houseFeature', 'decorationSuggestions', 'remark']
        }

        keys[params.type].forEach(v => {
            if(v == 'createdAt'){
                // 录入日期时间返回yyyy-MM-dd格式
                element[v] = formatTimeToStr(element[v], 'yyyy-MM-dd')
            }
            arrInner.push(element[v]);
        })

        data.push(arrInner)
    });
    writeXls(data);

    if (res[0]) {
        ctx.body = {
            code: -1,
            data: {},
            message: '导出失败！'
        }
    } else if (res[1]) {
        ctx.body = {
            code: 0,
            data: {
                path: 'http://localhost:3000/files/export.xlsx'
            },
            message: "导出成功！"
        }
    }
}

module.exports = {
    'POST /getList': fn_getList,
    'POST /updateRow': fn_updateRow,
    'POST /deleteRows': fn_deleteRows,
    'POST /addRow': fn_addRow,
    'POST /export': fn_export
};