const util = require('./util');

/*
**************
datas:

[
    ['湖北', '收入', 10],
    ['湖北', '收入', 20],
    ['湖北', '支出', 26],
    ['湖南', '收入', 8],
    ['湖南', '收入', 3],
    ['湖南', '收入', 4],
    ['湖南', '支出', 12],
    ['湖南', '支出', 2]
]

**************
fields

**************
strctData:

[
    {
        $val: '湖北',
        $formula: [],
        $items: [
            {
                $val: '收入',
                $items: [[10, 20]]
            },
            {
                $val: '支出',
                $items: [[26]]
            }
        ]
    },
    {
        $val: '湖南',
        $formula: [],
        $items: [
            {
                $val: '收入',
                $items: [[8, 3, 4]]
            },
            {
                $val: '支出',
                $items: [[12, 2]]
            }
        ]
    }
]
*/
module.exports = {
    format(datas, fields) {
        let stDatas = [],
            horizonMap = {};
        for (let i = 0, len = datas.length; i < len; i++) {
            formatRowData(stDatas, datas[i], fields, horizonMap);
        }
        if (fields.isCross()) {
            completeData(stDatas, fields.verticalFields().length, horizonMap);
        }
        sortData(stDatas, {}, 0);
        return stDatas;
    }
}

function sortData(datas, sortInfo, idx) {
    let info = sortInfo[idx];
    if (!info) {
        info = sortInfo[idx] = [];
        for (let i = 0, len = datas.length; i < len; i++) {
            info.push(datas[i].$val);
        }
    } else {
        datas.sort(function (a, b) {
            let va = a.$val,
                vb = b.$val,
                ia = util.indexOf(info, va),
                ib = util.indexOf(info, vb);
            if (ia === -1) {
                info.push(va);
            }
            if (ib === -1) {
                info.push(vb);
            }
            return ia === -1 || ia > ib ? 1 : -1;
        });
    }
    if (datas.length && datas[0].$items && !util.isArray(datas[0].$items[0])) {
        for (let i = 0, len = datas.length; i < len; i++) {
            sortData(datas[i].$items, sortInfo, idx + 1);
        }
    }
}

function completeData(datas, count, horizonMap) {
    if (count > 0) {
        for (let i = 0, len = datas.length; i < len; i++) {
            let data = datas[i];
            completeData(data.$items, count - 1, horizonMap);
        }
    } else {
        completeDataRec(datas, horizonMap);
    }
}

function completeDataRec(datas, horizonMap) {
    let names = [];
    for (let name in horizonMap) {
        let idx = util.indexOf(datas, name, '$val');
        if (idx === -1) {
            names.push(name);
        } else {
            completeDataRec(datas[idx].$items, horizonMap[name]);
        }
    }
    for (let i = 0, len = names.length; i < len; i++) {
        let data = completeCloneData(datas[0]);
        data.$val = names[i];
        datas.push(data);
    }
}

function completeCloneData(data) {
    let obj = {
        $val: data.$val,
        $field: data.$field,
        $revert: data.$revert
    };
    let formula = data.$formula;
    if (formula) {
        obj.$formula = new Array(formula.length);
    }
    let items = data.$items,
        dItems = obj.$items = [];
    if (util.isArray(items[0])) {
        for (let i = 0, len = items.length; i < len; i++) {
            dItems[i] = [0];
        }
    } else {
        for (let i = 0, len = items.length; i < len; i++) {
            dItems[i] = completeCloneData(items[i]);
        }
    }
    return obj;
}

function formatFieldData(data, rData, fields, horizonMap) {
    for (let i = 0, len = fields.length; i < len; i++) {
        let fieldObj = fields[i],
            field = fieldObj.field(),
            dataObj, formula;
        if (field === -1) {
            data.push(dataObj = {
                $items: [],
                $field: fieldObj,
                $revert: horizonMap && !i
            });
        } else {
            let value = rData[field],
                idx = util.indexOf(data, value, '$val');
            formula = fieldObj.formula();
            if (idx === -1) {
                data.push(dataObj = {
                    $val: value,
                    $items: [],
                    $field: fieldObj,
                    $revert: horizonMap && !i
                });
            } else {
                dataObj = data[idx];
            }
            if (horizonMap) {
                horizonMap = horizonMap[value] = horizonMap[value] || {};
            }
        }
        if (formula) {
            dataObj.$formula = formula.collect(rData, dataObj.$formula, field);
        }
        data = dataObj.$items;
    }
    return data;
}

function formatRowData(data, rData, fields, horizonMap) {
    data = formatFieldData(data, rData, fields.verticalFields());
    data = formatFieldData(data, rData, fields.horizonFields(), horizonMap);
    let kfields = fields.keyFields();
    for (let i = 0, len = kfields.length; i < len; i++) {
        (data[i] = data[i] || []).push(rData[kfields[i].field()]);
    }
}