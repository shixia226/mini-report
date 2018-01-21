import util from './js/util';
import Fields from './js/field';
import struct from './js/struct';
import { format } from './js/formula';

module.exports = {
    /**
     * Mini报表数据格式化入口
     * @param datas 二维数组数据，类似于关系型数据库表数据
     * @param fields
     * @param headers
     * @param options
     */
    format: function(datas, fields, headers, options) {
        var stDatas = struct.format(datas, new Fields(fields, headers));
        var fmDatas = formatData(stDatas, options || {}, {}, 0);
        adornData(fmDatas.datas, options);
        return fmDatas;
    }
}

function adornData(datas) {
    for (var r = 0, rlen = datas.length; r < rlen; r++) {
        var rowData = datas[r];
        for (var c = 0, clen = rowData.length; c < clen; c++) {
            var data = rowData[c];
            if (util.isObject(data)) {
                var rs = data.$rs,
                    cs = data.$cs;
                if ((!rs || rs <= 1) && (!cs || cs <= 1)) {
                    rowData[c] = data.$val;
                }
            }
        }
    }
}

function collapseData(datas) {
    var result = [];
    for (var i = 0, len = datas.length; i < len; i++) {
        var rowData = datas[i];
        for (var c = 0, clen = rowData.length; c < clen; c++) {
            var data = rowData[c];
            if (data && data.$key) {
                (result[c] = result[c] || []).push(data.$val);
            }
        }
    }
    return result;
}

function expandData(datas, options) {
    var result = [];
    for (var r = 0, rlen = datas.length; r < rlen; r++) {
        var rowData = datas[r],
            cDatas = rowData.datas,
            hformula = rowData.hformula,
            vformula = rowData.vformula,
            firstRow = cDatas[0],
            empty = [];
        var count = cDatas.length;
        if (hformula) {
            for (var i = hformula.length - 1; i >= 0; i--) {
                firstRow.unshift({ $val: hformula[i], $rs: count });
                empty.push(undefined);
            }
        }
        if (rowData.value) {
            firstRow.unshift({ $val: rowData.value, $rs: count });
            empty.push(undefined);
        }
        for (var i = 1; i < count; i++) {
            cDatas[i].unshift.apply(cDatas[i], empty);
        }
        if (vformula) {
            var cs = empty.length;
            for (var i = 0, len = vformula.length; i < len; i++) {
                var vfm = vformula[i],
                    vfDatas = vfm.datas;
                if (i === 0) {
                    for (var c = 0, clen = vfDatas.length; c < clen; c++) {
                        if (!util.isNull(vfDatas[c])) break;
                        cs++;
                    }
                }
                for (var c = 0, clen = vfDatas.length; c < clen; c++) {
                    if (!util.isNull(vfDatas[c])) {
                        vfDatas[c] = { $val: vfDatas[c], $formula: true };
                    }
                }
                vfDatas.unshift.apply(vfDatas, empty);
                vfDatas[0] = { $val: options[vfm.formula] || vfm.formula, $cs: cs };
                cDatas.push(vfDatas);
            }
        }
        result.push.apply(result, cDatas);
    }
    return result;
}

/**
 * 
 * @param {*} datas 

 [
     ['收入', { $val: 20, $key: true }, { $val: 15, $key: true }]
     ['支出', { $val: 16, $key: true }, { $val: 12, $key: true }]
 ]

 ==>

 [
     [{ $val: '收入', $cs: 2 }, undefined, { $val: '支出', $cs: 2 }, undefined],
     [{ $val: 20, $key: true }, { $val: 15, $key: true }, { $val: 16, $key: true }, { $val: 12, $key: true }]
 ]


 */
function revertFormatData(datas) {
    var idxs = [],
        firstRow = datas[0];
    for (var c = 0, clen = firstRow.length; c < clen; c++) {
        if (firstRow[c].$key) {
            idxs.push(c);
        }
    }
    datas = revertData(datas);
    var count = idxs.length,
        actIdx = idxs[0];
    if (count > 1) {
        for (var r = 0, rlen = datas.length; r < rlen; r++) {
            if (util.indexOf(idxs, r) === -1) {
                var rowData = datas[r];
                for (var c = rowData.length - 1; c >= 0; c--) {
                    var data = rowData[c];
                    if (data !== undefined) {
                        if (!util.isObject(data)) {
                            data = { $val: data };
                        }
                        var cs = data.$cs || 1,
                            ncs = cs * count,
                            empty = new Array(ncs - cs + 2);
                        data.$cs = ncs;
                        empty[0] = c;
                        empty[1] = 0;
                        rowData.splice.apply(rowData, empty);
                    }
                }
            }
            var keyRow = datas[actIdx];
            for (var c = keyRow.length - 1; c >= 0; c--) {
                var empty = [c + 1, 0];
                for (var i = 1, len = idxs.length; i < len; i++) {
                    empty.push(datas[idxs[i]][c]);
                }
                keyRow.splice.apply(keyRow, empty);
            }
            datas.splice(idxs[1], count - 1);
        }
    }
    var reData = datas[actIdx];
    for (var i = 0, len = reData.length; i < len; i++) {
        var data = reData[i];
        if (data && data.$formula) {
            data.$key = true;
        }
    }
    return {
        headers: datas.slice(0, actIdx),
        datas: [reData],
        count: 1
    };
}

function revertData(datas) {
    var result = [];
    for (var r = 0, rlen = datas.length; r < rlen; r++) {
        var rowData = datas[r];
        for (var c = 0, clen = rowData.length; c < clen; c++) {
            var data = rowData[c];
            if (data) {
                var rs = data.$rs,
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
        for (var i = 0, len = stDatas.length; i < len; i++) {
            stDatas[i] = { $val: stDatas[i], $key: true };
        }
        return { datas: [stDatas], count: 1 };
    }
    var datas = [],
        count = 0,
        revert = false;
    for (var i = 0, len = stDatas.length; i < len; i++) {
        var data = stDatas[i];
        var items = data.$items,
            value = data.$val;
        if (data.$revert) {
            revert = true;
            if (!indexs.$idx) {
                indexs.$idx = idx;
            }
        }
        var cDatas = formatData(items, options, indexs, idx + 1),
            cCount = cDatas.count,
            formula = data.$field.formula(),
            rData = {
                value: value,
                datas: cDatas.datas
            };
        count += cCount;
        if (formula) {
            rData.hformula = formula.format(data.$formula, cCount);
            rData.vformula = formula.export(collapseData(rData.datas), cCount);
        }
        if (value) {
            if (indexs.$idx < idx) {
                var cols = indexs[idx] = indexs[idx] || [],
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
    var fmDatas = expandData(datas, options);
    return revert ? revertFormatData(fmDatas) : { datas: fmDatas, count: count };
}