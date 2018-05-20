const util = require('./util');
const Formula = require('./formula');

const FEILD_HORIZON = 'h',
    FEILD_VERTICAL = 'v',
    FEILD_KEY = 'k';

class Field {
    constructor(field, headers) {
        if (!util.isObject(field)) {
            field = { field: field };
        }
        let converge = field.converge;
        this.cvg = converge === FEILD_HORIZON || converge === FEILD_VERTICAL ? converge : FEILD_KEY;
        if (!util.isNull(field.field)) {
            if (util.isString(field.field)) {
                this.idx = util.indexOf(headers, field.field);
            } else {
                this.idx = parseInt(field.field);
                if (this.idx < 0 || this.idx >= headers.length) {
                    throw new Error('Invalid Field: ' + field.field);
                }
            }
            if (this.idx === -1) {
                throw new Error('Unknown Field: ' + field.field);
            }
        } else {
            this.idx = -1;
        }
        if (field.formula) {
            this.fm = new Formula(field.formula, headers);
        }
    }
    field() {
        return this.idx;
    }
    converge() {
        return this.cvg;
    }
    formula() {
        return this.fm;
    }
}

class Fields {
    /**
     * @param {*} fields 
     *  [{
     *      field: 'field1',
     *      formula: ['cnt']
     *  }, {
     *      field: 'field2',
     *      formula: ['sum', 'avg']
     *      converge: 'v'
     *  }, {
     *      field: 'field3',
     *      converge: 'h'
     *  }]
     * @param {*} headers
     *  ['field1', 'field2', 'field4', 'field3', 'field5']
     */
    constructor(fields, headers) {
        let fieldMap = this.fields = {
            [FEILD_HORIZON]: [],
            [FEILD_VERTICAL]: [],
            [FEILD_KEY]: []
        },
            idxs = {},
            emptyFields = {};
        for (let i = 0, len = fields.length; i < len; i++) {
            let field = new Field(fields[i], headers),
                idx = field.field(),
                cvg = field.converge();
            if (idx === -1) { //需要处理列表展示，此时field设置为空，表示不再分组
                emptyFields[cvg] = field;
            } else {
                if (idxs[idx]) continue;
                idxs[idx] = true;
                fieldMap[cvg].push(field);
            }
        }
        if (emptyFields[FEILD_VERTICAL]) {
            if (!fieldMap[FEILD_HORIZON].length) {
                fieldMap[FEILD_VERTICAL].push(emptyFields[FEILD_VERTICAL]);
            }
        }
        if (emptyFields[FEILD_HORIZON]) {
            if (!fieldMap[FEILD_VERTICAL].length) {
                fieldMap[FEILD_HORIZON].push(emptyFields[FEILD_HORIZON])
            }
        }
    }
    verticalFields() {
        return this.fields[FEILD_VERTICAL];
    }
    horizonFields() {
        return this.fields[FEILD_HORIZON];
    }
    keyFields() {
        return this.fields[FEILD_KEY];
    }
    isCross() {
        return this.verticalFields().length && this.horizonFields().length;
    }
}

module.exports = Fields;