# Mini Report

Report Data Conversion

## Install

  - `npm install mini-report --save-dev`

## How to use

### Prepaire Data
```javascript
let data = {
    fields: ['name', 'subject', 'score'],
    data: [
        ['张三', '语文', 86],
        ['李四', '语文', 92],
        ['王五', '语文', 56],
        ['张三', '数学', 100],
        ['李四', '数学', 88],
        ['王五', '数学', 98],
        ['张三', '英语', 62],
        ['李四', '英语', 83]
    ]
}
```
* The data format is similar to the database table. The ```header``` attribute is the header field, and the ```data``` attribute is table data

### Require Library
```javascript
let Report = require('../index')
```

##### 1. List
```javascript
Report.format(data, [{ converge: 'v' }, 2, 1])
// The same way of calling: 
// Report.format(data, [{ converge: 'v' }, 'score', 'subject'])
// Report.format(data, [{ converge: 'v' }, { field: 'score' }, { field: 'subject' }])
```

output:

| 'score' | 'subject' |
|---------|-----------|
| '语文'   | 86        |
| '语文'   | 92        |
| '语文'   | 56        |
| '数学'   | 100       |
| '数学'   | 88        |
| '数学'   | 98        |
| '英语'   | 62        |
| '英语'   | 83        |

#### 2. Formula
```javascript
Report.format(data, [{
    converge: 'v',
    formula: 'sum'
}, 0, 1, 2], {
    name: '姓名',
    subject: '科目',
    score: '成绩'
})
```

output:

| '姓名' | '科目' | '成绩' |
|---------|-----------|--------|
| '张三'  | '语文'    | 86      |
| '李四'  | '语文'    | 92      |
| '王五'  | '语文'    | 56      |
| '张三'  | '数学'    | 100     |
| '李四'  | '数学'    | 88      |
| '王五'  | '数学'    | 98      |
| '张三'  | '英语'    | 62      |
| '李四'  | '英语'    | 83      |
| ''      | ''       | 665     |

#### 3. Multilevel Formula
```javascript
Report.format(data, [{
    field: 0,
    converge: 'v',
    formula: {
        formula: 'sum',
        label: '总分'
    }
}, {
    field: 1,
    converge: 'v',
    formula: {
        formula: 'sum',
        label: '总成绩'
    }
}, 2])
```

output:

| 'name' | 'subject' | 'score' |
|---------|-----------|--------|
| '张三'   | '语文'   | 86      |
| ''      | '数学'   | 100   |
| ''      | '英语'   | 62   |
| ''      | '总成绩'   | '248'   |
| '李四'   | '语文'   | 92      |
| ''      | '数学'   | '88      |
| ''      | '英语'   | '83      |
| ''      | '总成绩'   | '263      |
| '王五'   | '语文'   | 56      |
| ''      | '数学'   | '98      |
| ''      | '总成绩'   | '154      |
| '总分'   | ''      | '665      |

#### 4. Cross Formula
```javascript
Report.format(data, [{
    field: 0,
    converge: 'v',
    formula: 'avg'
}, {
    converge: 'h'
}, {
    field: 1,
    converge: 'h',
    formula: 'sum'
}, 2]
```

output:

| 'name' | '语文' | '数学' | '英语' | 'sum' |
|--------|-------|-------|--------|-------|
| '张三'   | 86      | 100      |	62      |	248      |
| '李四'   | 92      |	88      |	83      |	263      |
| '王五'   | 56      |	98      |	0      |	154      |
| 'avg'   | 78.00      |	95.33      |	48.33      |	221.67      |

#### 5. Flat Formula
```javascript
Report.format(data, [{
    converge: 'v'
}, {
    field: 1,
    converge: 'v',
    formula: {
        formula: 'sum',
        field: 2
    }
}, 2]
```

output:

| 'subject' | 'sum' | 'score' |
|---------|-----------|--------|
| '语文'   | 234 | 86      |
| ''       | ''    | 92 |
| ''      | ''     | 56 |
| '数学'   | 286 | 100      |
| ''      | ''  | 88 |
| ''      | ''  | 98 |
| '英语'   | 145 |	62      |
| ''       | '' | 83 |

### API
```
Report.format(data, fields, options)
```

#### data: Object
* fields
* data

#### fields: Array(Number/String/Object)
* Number: Field Index
* String: Field String
* Object
    * field(Number/String)
    * converge: 'h'/'v'
    * formula(String/Object)
        * String: 'sum', 'avg', 'lst'
        * Object
            * formula
            * label(String/Function)
            * field

#### options: Object

## LICENSE
MIT
