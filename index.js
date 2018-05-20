const util = require('./js/util');
const Fields = require('./js/field');
const struct = require('./js/struct');
const format = require('./js/format');

module.exports = {
    /**
     * Mini报表数据格式化入口
     * @param data 数据描述
     *  {
     *      fields: 一维数组，类似于数据库字段
     *      data: 二维数组数据，类似于关系型数据库表数据
     *  }
     * @param fields 数据解析字段描述，JSON数组
     * @param options 附加配置项
     * 
     * eg:
     *  format({
     *      fields: ['name', 'subject', 'score'],
     *      data: [
     *          ['张三', '语文', '86'],
     *          ['李四', '语文', '92'],
     *          ['王五', '语文', '56'],
     *          ['张三', '数学', '100'],
     *          ['李四', '数学', '88']
     *      ]
     *  }, [{
     *      field: 'name'
     *  }, {}])
     */
    format: function (data, fields, options) {
        if (!data) return;
        options = options || {};
        let headers = data.fields,
            field = new Fields(fields, headers),
            stDatas = struct.format(data.data, field),
            fmDatas = formatData(stDatas, options, {}, 0),
            fmHeaders = fmDatas.headers;
        if (!fmHeaders) {
            fmHeaders = fmDatas.headers = [
                []
            ];
            formatHeader(fmHeaders[0], field.keyFields(), headers, 1, options);
        }
        formatHeader(fmHeaders[0], field.verticalFields(), headers, fmHeaders.length, options);
        let fmData = expandData([fmDatas], options);
        adornData(fmHeaders);
        adornData(fmData);
        return {
            header: fmHeaders,
            data: fmData
        };
    }
}

function formatHeader(header, fields, headers, rs, options) {
    for (let i = fields.length - 1; i >= 0; i--) {
        let fieldObj = fields[i],
            field = fieldObj.field();
        if (field !== -1) {
            let formula = fieldObj.formula();
            if (formula) {
                let formulas = formula.formulas();
                for (let k = formulas.length - 1; k >= 0; k--) {
                    let formula = formulas[k];
                    header.unshift({ $val: options[formula] || formula, $rs: rs });
                }
            }
            field = headers[field];
            header.unshift({ $val: options[field] || field, $rs: rs });
        }
    }
}

function adornData(datas) {
    for (let r = 0, rlen = datas.length; r < rlen; r++) {
        let rowData = datas[r];
        for (let c = 0, clen = rowData.length; c < clen; c++) {
            let data = rowData[c];
            if (util.isObject(data)) {
                let rs = data.$rs,
                    cs = data.$cs;
                if ((!rs || rs <= 1) && (!cs || cs <= 1)) {
                    rowData[c] = data.$val;
                }
            }
        }
    }
}

function collapseData(datas) {
    let result = [];
    for (let i = 0, len = datas.length; i < len; i++) {
        let rowData = datas[i];
        for (let c = 0, clen = rowData.length; c < clen; c++) {
            let data = rowData[c];
            if (data && data.$key) {
                (result[c] = result[c] || []).push(data.$val);
            }
        }
    }
    return result;
}

function expandData(datas, options) {
    let result = [];
    for (let r = 0, rlen = datas.length; r < rlen; r++) {
        let rowData = datas[r],
            cDatas = rowData.datas,
            hformula = rowData.hformula,
            vformula = rowData.vformula,
            firstRow = cDatas[0],
            empty = [];
        let count = cDatas.length;
        if (vformula) {
            let cs = empty.length;
            for (let i = 0, len = vformula.length; i < len; i++) {
                let vfm = vformula[i],
                    vfDatas = vfm.datas;
                if (i === 0) {
                    for (let c = 0, clen = vfDatas.length; c < clen; c++) {
                        if (!util.isNull(vfDatas[c])) break;
                        cs++;
                    }
                }
                for (let c = 0, clen = vfDatas.length; c < clen; c++) {
                    if (!util.isNull(vfDatas[c])) {
                        vfDatas[c] = { $val: vfDatas[c], $formula: true };
                    }
                }
                vfDatas.unshift.apply(vfDatas, empty);
                if (util.isFunction(vfm.formula)) {
                    vfm.formula(vfDatas);
                } else if (cs > 0) {
                    vfDatas[0] = { $val: options[vfm.formula] || vfm.formula, $cs: cs };
                }
                cDatas.push(vfDatas);
                count++;
            }
        }
        if (hformula) {
            for (let i = hformula.length - 1; i >= 0; i--) {
                firstRow.unshift({ $val: hformula[i], $rs: count });
                empty.push(undefined);
            }
        }
        if (rowData.value) {
            firstRow.unshift({ $val: rowData.value, $rs: count });
            empty.push(undefined);
            for (let i = 1; i < count; i++) {
                cDatas[i].unshift.apply(cDatas[i], empty);
            }
        }
        result.push.apply(result, cDatas);
    }
    return result;
}

function revertFormatData(datas) {
    let firstRow = datas[0],
        count = firstRow.length,
        idx = 0;
    for (; idx < count; idx++) {
        if (firstRow[idx].$key) {
            break;
        }
    }
    datas = revertData(datas);
    let reData = datas.slice(idx);
    for (let r = 0, rlen = reData.length; r < rlen; r++) {
        let rowData = reData[r];
        for (let c = 0, clen = rowData.length; c < clen; c++) {
            let data = rowData[c];
            if (data && data.$formula) {
                data.$key = true;
            }
        }
    }
    return {
        headers: datas.slice(0, idx),
        datas: reData,
        count: count - idx
    }
}

function revertData(datas) {
    let result = [];
    for (let r = 0, rlen = datas.length; r < rlen; r++) {
        let rowData = datas[r];
        for (let c = 0, clen = rowData.length; c < clen; c++) {
            let data = rowData[c];
            if (data) {
                let rs = data.$rs,
                    cs = data.$cs;
                if (rs || cs) {
                    data.$rs = cs || 1;
                    data.$cs = rs || 1;
                }
            }
            (result[c] = result[c] || []).push(data);
        }
    }
    return result;
}

function formatData(stDatas, options, indexs, idx) {
    if (util.isArray(stDatas[0])) { //到了最后一层
        stDatas = format(stDatas);
        for (let i = 0, len = stDatas.length; i < len; i++) {
            stDatas[i] = { $val: stDatas[i], $key: true };
        }
        return { datas: [stDatas], count: 1 };
    }
    let datas = [],
        count = 0,
        revert = false,
        headers;
    for (let i = 0, len = stDatas.length; i < len; i++) {
        let data = stDatas[i];
        let items = data.$items,
            value = data.$val;
        if (data.$revert) {
            revert = true;
            if (!indexs.$idx) {
                indexs.$idx = idx;
            }
        }
        let cDatas = formatData(items, options, indexs, idx + 1),
            cCount = cDatas.count,
            formula = data.$field.formula(),
            rData = {
                value: value,
                datas: cDatas.datas,
                vformula: cDatas.vformula
            };
        if (i === 0) {
            headers = cDatas.headers;
        }
        count += cCount;
        if (formula) {
            rData.hformula = formula.format(data.$formula, cCount);
        }
        if (value) {
            if (indexs.$idx < idx) {
                let cols = indexs[idx] = indexs[idx] || [],
                    cidx = util.indexOf(cols, value);
                if (cidx === -1) {
                    cols.push(value);
                    datas.push(rData);
                } else {
                    datas[cidx] = rData;
                }
            } else {
                datas.push(rData);
            }
        } else {
            datas.push(rData);
        }
    }
    let fmDatas = expandData(datas, options);
    let formula = stDatas[0].$field.formula(),
        vformula;
    if (formula) {
        vformula = formula.export(collapseData(fmDatas), count);
    }
    if (revert) {
        return revertFormatData(expandData([{ datas: fmDatas, vformula: vformula }], options));
    } else {
        return { datas: fmDatas, count: count, headers: headers, vformula: vformula };
    }
}