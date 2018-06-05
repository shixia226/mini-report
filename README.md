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
| 86      | '语文'     |
| 92      | '语文'     |
| 56      | '语文'     |
| 100     | '数学'     |
| 88      | '数学'     |
| 98      | '数学'     |
| 62      | '英语'     |
| 83      | '英语'     |

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

| 'name'  | 'subject' | 'score' |
|---------|-----------|---------|
| '张三'  | '语文'     | 86      |
| ''      | '数学'    | 100     |
| ''      | '英语'    | 62      |
| ''      | '总成绩'  | 248     |
| '李四'  | '语文'    | 92      |
| ''      | '数学'    | 88      |
| ''      | '英语'    | 83      |
| ''      | '总成绩'  | 263     |
| '王五'  | '语文'    | 56      |
| ''      | '数学'    | 98      |
| ''      | '总成绩'  | 154     |
| '总分'  | ''        | 665     |

#### 4. Cross Formula
```javascript
Report.format(data, [{
    field: 0,
    converge: 'v',
    formula: 'avg'
}, {
    field: 1,
    converge: 'h',
    formula: 'sum'
}, 2])
```

output:

| 'name' | '语文' | '数学' | '英语' | 'sum' |
|--------|-------|-------|--------|-------|
| '张三'   | 86   | 100   | 62     | 248   |
| '李四'   | 92   |	88    | 83     | 263   |
| '王五'   | 56   |	98    | 0      | 154   |
| 'avg'   | 78.00 |	95.33 | 48.33 | 221.67 |

#### 5. Cross Formula without Detail
```javascript
Report.format(data, [{
    field: 0,
    converge: 'v',
    formula: 'avg'
}, {
    field: 1,
    converge: 'h',
    formula: {
        detail: false,
        formula: 'sum'
    }
}, 2])
```

output:

| 'name' | 'sum' |
|--------|-------|
| '张三'  | 248   |
| '李四'  | 263   |
| '王五'  | 154   |
| 'avg'  | 221.67 |

#### 6. Flat Formula
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
}, 2])
```

output:

| 'subject' | 'sum' | 'score' |
|---------|-----------|--------|
| '语文'   | 234     | 86      |
| ''      | ''      | 92       |
| ''      | ''      | 56       |
| '数学'   | 286     | 100     |
| ''      | ''      | 88       |
| ''      | ''      | 98       |
| '英语'   | 145     | 62      |
| ''      | ''      | 83       |

#### 7. Multilevel Cross Formula
```javascript
Report.format({
    fields: ['province', 'city', 'count', 'industry', 'type'],
    data: [
        ["湖北", "武汉", 18000, "房地产", "收入"],
        ["湖北", "武汉", 10000, "房地产", "收入"],
        ["湖北", "武汉", 2000, "卫生", "支出"],
        ["湖北", "武汉", 1200, "卫生", "支出"],
        ["湖北", "武汉", 8000, "卫生", "收入"],
        ["湖北", "武汉", 12000, "房地产", "支出"],
        ["湖北", "黄石", 1500, "卫生", "支出"],
        ["湖北", "黄石", 3500, "卫生", "收入"],
        ["湖北", "襄阳", 15800, "房地产", "收入"],
        ["湖北", "襄阳", 5800, "卫生", "收入"],
        ["湖北", "襄阳", 11800, "房地产", "支出"],
        ["湖北", "襄阳", 1800, "卫生", "支出"],
        ["湖南", "长沙", 16000, "房地产", "收入"],
        ["湖南", "长沙", 6000, "卫生", "收入"],
        ["湖南", "长沙", 11500, "房地产", "支出"],
        ["湖南", "长沙", 1500, "卫生", "支出"],
        ["湖南", "岳阳", 13600, "房地产", "收入"],
        ["湖南", "岳阳", 3600, "卫生", "收入"],
        ["湖南", "岳阳", 11000, "房地产", "支出"],
        ["湖南", "岳阳", 1000, "卫生", "支出"],
        ["江西", "南昌", 15400, "房地产", "收入"],
        ["江西", "南昌", 5400, "卫生", "收入"],
        ["江西", "南昌", 11800, "房地产", "支出"],
        ["江西", "南昌", 1800, "卫生", "支出"],
        ["江西", "九江", 14800, "房地产", "收入"],
        ["江西", "九江", 4800, "卫生", "收入"],
        ["江西", "九江", 11600, "房地产", "支出"],
        ["江西", "九江", 1600, "卫生", "支出"]
    ]
}, [{
    field: 0,
    formula: [{ formula: 'sum', label: '全国合计' }],
    converge: 'v'
}, {
    field: 1,
    formula: [{ formula: 'sum', label: '省合计' }],
    converge: 'v'
}, {
    field: 3,
    formula: [{
        formula: 'fmt',
        label: '总利润',
        format: function(data) {
            let fmt = 0;
            for (let i = 0, len = data.length; i < len; i += 2) {
                fmt += (data[i] - data[i + 1]);
            }
            return fmt;
        }
    }],
    converge: 'h'
}, {
    field: 4,
    formula: [{
        formula: 'fmt',
        label: '利润',
        format: function(data) {
            return data[0] - data[1];
        }
    }],
    converge: 'h'
}, {
    field: 2
}], { province: '省', city: '市' })
```

output:

| 省     | 市     | 房地产 | ''     | ''      | 卫生  | ''     | ''    | 总利润  | 
|--------|-------|-------|--------|---------|-------|--------|-------|-------|
| ''     | ''    | 收入   | 支出    | 利润    | 收入  | 支出    | 利润   | ''     |
| 湖北    | 武汉  | 28000  | 12000  | 16000  | 8000  | 3200   | 4800  | 20800  |
| ''     | 黄石   | 0     | 0      | 0      | 3500  | 1500   | 2000  | 2000   |
| ''     | 襄阳   | 15800 | 11800  | 4000   | 5800  | 1800   | 4000  | 8000   |
| ''     | 省合计  | 43800 | 23800  | 20000  | 17300 | 6500  | 10800  | 30800  |
| 湖南   | 岳阳   | 13600  | 11000  | 2600   | 3600  | 1000   | 2600  | 5200   |
| ''     | 长沙   | 16000 | 11500  | 4500   | 6000  | 1500   | 4500  | 9000   |
| ''     | 省合计  | 29600 | 22500  | 7100  | 9600   | 2500  | 7100  | 14200   |
| 江西   | 九江   | 14800  | 11600  | 3200   | 4800  | 1600   | 3200  | 6400   |
| ''     | 南昌   | 15400  | 11800 | 3600   | 5400  | 1800   | 3600  | 7200   |
| ''     | 省合计  | 30200 | 23400  | 6800   | 10200 | 3400  | 6800   | 13600  |
| 全国合计 | ''    | 103600 | 69700 | 33900  | 37100 | 12400  | 24700 | 58600  |

### API
#### 1. Conversion Of Data
```
Report.format(data, fields, options)
```

##### data: Object
* fields
* data

##### fields: Array(Number/String/Object)
* Number: Field Index
* String: Field String
* Object
    * field(Number/String)
    * converge: 'h'/'v'
    * formula(String/Object)
        * String: 'sum', 'avg', 'cnt', 'lst', 'fmt'
        * Object
            * formula(String)
            * label(String/Function)
            * field(Number/String)
            * format(Function/Object)
            * detail(Boolean)

##### options: Object
* {field}(String)
* {formula}(String)

#### 2. Configuring Conversion Parameters
```
Report.config(options)
```

##### options
* VALUE(String): The result of the value key in the result data, the default is '$val'
* ROWSPAN(String): The result of the rowspan key in the result data, the default is '$rs'
* COLSPAN(String): The result of the colspan key in the result data, the default is '$cs'
* {field}(String)
* {formula}(String)

## LICENSE
MIT
