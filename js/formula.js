const util = require('./util');
const format = require('./format');
/**
 * sum 求和
 * avg 求平均，除数取按照下一分类个数，没有下一分类的取数据条数
 * cnt 求个数
 * lst 列表
 * fmt 格式化，默认直接输出
 */
const FORMULAS = ['sum', 'avg', 'cnt', 'lst', 'fmt'];

class Formula {
    constructor(formulas, headers) {
        let fms = this.fmls = [],
            wrapFmls = this.wrapFmls = [];
        formulas = util.array(formulas);
        for (let i = 0, len = formulas.length; i < len; i++) {
            let formula = formulas[i];
            if (!formula) continue;
            if (util.isString(formula)) {
                formula = {
                    formula: formula.toLowerCase(),
                    field: -1
                };
            } else {
                if (!util.isString(formula.formula)) continue;
                formula.formula = formula.formula.toLowerCase();
                formula.label = formula.label;
                let field = formula.field;
                if (util.isString(field)) {
                    formula.field = util.indexOf(headers, field); //field为-1时表示对下级作统计
                } else {
                    field = parseInt(field);
                    formula.field = field >= 0 && field < headers.length ? field : -1;
                }
            }
            if (util.indexOf(FORMULAS, formula.formula) !== -1) {
                if (formula.field !== -1) {
                    fms.push(formula);
                } else {
                    wrapFmls.push(formula);
                }
            }
        }
        this.empty = fms.length === 0;
    }
    formulas() {
        let fmls = [];
        for (let i = 0, len = this.fmls.length; i < len; i++) {
            let formula = this.fmls[i];
            fmls.push(formula.label || formula.formula);
        }
        return fmls;
    }
    collect(rData, datas, field) {
        if (!this.empty) {
            if (!datas) datas = [];
            for (let i = 0, len = this.fmls.length; i < len; i++) {
                (datas[i] = datas[i] || []).push(rData[this.fmls[i].field]);
            }
            return datas;
        }
    }
    export(datas, count) {
        let tmpData = [];
        for (let i = 0, len = this.wrapFmls.length; i < len; i++) {
            let formula = this.wrapFmls[i];
            tmpData.push({
                formula: formula.label || formula.formula,
                datas: format(datas, count, formula)
            });
        }
        return tmpData;
    }
    format(datas, count) {
        return format(datas, count, this.fmls);
    }
}

module.exports = Formula;