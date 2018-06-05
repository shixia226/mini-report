const util = require('./util'),
    fmtKey = require('./key');

const regNumber = /^\d+(\.\d+)?$/;

module.exports = function (datas, count, formulas) {
    if (datas) {
        let result = [],
            isArray = util.isArray(formulas);
        for (let i = 0, len = datas.length; i < len; i++) {
            let data = datas[i];
            if (!util.isNull(data)) {
                let formula = (isArray ? formulas[i] : formulas) || {};
                data = formatPlainData(datas[i]);
                switch (formula.formula) {
                    case 'sum':
                        result[i] = regNumber.test(data[0]) ? util.sum(data) : '';
                        break;
                    case 'avg':
                        result[i] = regNumber.test(data[0]) ? (util.sum(data) / (count || data.length)).toFixed(formula.fixed || 2) : '';
                        break;
                    case 'cnt':
                        result[i] = count || data.length;
                        break;
                    case 'lst':
                        result[i] = data.join(formula.split || ',');
                        break;
                    case 'fmt':
                        let fmt = util.call(formula.format, null, data);
                        result[i] = util.isNull(fmt) ? (formula.format || {})[data[0]] || '' : fmt;
                        break;
                    default:
                        result[i] = regNumber.test(data[0]) ? util.sum(data) : data[0];
                        break;
                }
            }
        }
        return result;
    }
}

function formatPlainData(datas) {
    let result = [];
    for (let i = 0, len = datas.length; i < len; i++) {
        let data = datas[i];
        if (data) {
            let val = data[fmtKey.VALUE];
            result[i] = util.isNull(val) ? data : val;
        } else {
            result[i] = data;
        }
    }
    return result;
}