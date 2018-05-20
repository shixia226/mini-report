module.exports = {
    indexOf(arr, value, name) {
        if (!name) {
            return arr.indexOf(value);
        } else {
            for (let i = 0, len = arr.length; i < len; i++) {
                if (arr[i][name] === value) return i;
            }
            return -1;
        }
    },
    isString(str) {
        return Object.prototype.toString.call(str) === '[object String]';
    },
    isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    isObject(arr) {
        return Object.prototype.toString.call(arr) === '[object Object]';
    },
    isFunction(arr) {
        return Object.prototype.toString.call(arr) === '[object Function]';
    },
    isNull(obj) {
        return obj === null || obj === undefined;
    },
    array(arr) {
        return this.isNull(arr) ? [] : (this.isArray(arr) ? arr : [arr]);
    },
    sum(arr) {
        let sum = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            sum += (parseFloat(arr[i], 10) || 0);
        }
        return sum;
    }
}