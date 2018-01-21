import util from './util';
/**
 * sum 求和
 * avg 求平均，除数取按照下一分类个数，没有下一分类的取数据条数
 * cnt 求个数
 * lst 列表
 * fmt 格式化，默认直接输出
 */
const FORMULAS = ['sum', 'avg', 'cnt', 'lst', 'fmt'];

const regNumber = /^\d+(\.\d+)?$/;

export default class Formula {
    constructor(formulas, headers) {
        var fms = this.formulas = [],
            wrapFms = this.wrapFormulas = [];
        formulas = util.array(formulas);
        for (var i = 0, len = formulas.length; i < len; i++) {
            var formula = formulas[i];
            if (!formula) continue;
            if (util.isString(formula)) {
                formula = {
                    formula: formula.toLowerCase(),
                    field: -1
                };
            } else {
                if (!util.isString(formula.formula)) continue;
                formula.formula = formula.formula.toLowerCase();
                formula.field = util.indexOf(headers, formula.field); //field为-1时表示对下级作统计
            }
            if (util.indexOf(FORMULAS, formula.formula) !== -1) {
                if (formula.field !== -1) {
                    fms.push(formula);
                } else {
                    wrapFms.push(formula);
                }
            }
        }
        this.empty = fms.length === 0;
    }
    collect(rData, datas, field) {
        if (!this.empty) {
            if (datas) datas = [];
            for (var i = 0, len = this.formulas.length; i < len; i++) {
                (datas[i] = datas[i] || []).push(rData[this.formulas[i].field]);
            }
            return datas;
        }
    }
    export (datas, count) {
        var tmpData = [];
        for (var i = 0, len = this.wrapFormulas.length; i < len; i++) {
            var formula = this.wrapFormulas[i];
            tmpData.push({
                formula: formula.formula,
                datas: format(datas, count, formula)
            });
        }
        return tmpData;
    }
    format(datas, count) {
        return format(datas, count, this.formulas);
    }
}

export function format(datas, count, formulas) {
    if (datas) {
        var result = [],
            isArray = util.isArray(formulas);
        for (var i = 0, len = datas.length; i < len; i++) {
            var data = datas[i];
            if (!util.isNull(data)) {
                var formula = (isArray ? formulas[i] : formulas) || {};
                data = formatPlainData(datas[i]);
                switch (formula.formula) {
                    case 'sum':
                        result[i] = util.sum(data);
                        break;
                    case 'avg':
                        result[i] = (util.sum(data) / (count || data.length)).toFixed(formula.fixed || 2);
                        break;
                    case 'cnt':
                        result[i] = count || data.length;
                        break;
                    case 'lst':
                        result[i] = data.join(formula.split || ',');
                        break;
                    case 'fmt':
                        result[i] = (formula.format || {})[data[0]] || data[0];
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
    var result = [];
    for (var i = 0, len = datas.length; i < len; i++) {
        var data = datas[i];
        if (data) {
            var val = data.$val;
            result[i] = util.isNull(val) ? data : val;
        } else {
            result[i] = data;
        }
    }
    return result;
}