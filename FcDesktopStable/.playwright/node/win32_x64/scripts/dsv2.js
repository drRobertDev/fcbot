const fs = require("fs");
const process = require("process");

const ModuleEncoding = {
    0: "None",
    1: "Hexadecimal",
    2: "Base64",
    3: "Utf8",
    4: "Integer",
    None: 0,
    Hexadecimal: 1,
    Base64: 2,
    Utf8: 3,
    Integer: 4,
};

class Encoding {
    static stringLength(t) {
        if (!t) return 0
        for (var e = 0, i = 0; i < t.length; ++i) {
            var n = t.charCodeAt(i)
            55296 <= n &&
                n <= 57343 &&
                (n = (65536 + ((1023 & n) << 10)) | (1023 & t.charCodeAt(++i))),
                n <= 127 ? ++e : (e += n <= 2047 ? 2 : n <= 65535 ? 3 : 4)
        }
        return e
    }

    static stringToUtf8(t, e) {
        if (0 === e || !t) return []
        for (var i = new Array(e), n = 0, r = e, o = 0; o < t.length; ++o) {
            var a = t.charCodeAt(o)
            if (55296 <= a && a <= 57343)
                a = (65536 + ((1023 & a) << 10)) | (1023 & t.charCodeAt(++o))
            if (a <= 127) {
                if (r <= n) break
                i[n++] = a
            } else if (a <= 2047) {
                if (r <= n + 1) break
                    ; (i[n++] = 192 | (a >> 6)), (i[n++] = 128 | (63 & a))
            } else if (a <= 65535) {
                if (r <= n + 2) break
                    ; (i[n++] = 224 | (a >> 12)),
                        (i[n++] = 128 | ((a >> 6) & 63)),
                        (i[n++] = 128 | (63 & a))
            } else {
                if (r <= n + 3) break
                    ; (i[n++] = 240 | (a >> 18)),
                        (i[n++] = 128 | ((a >> 12) & 63)),
                        (i[n++] = 128 | ((a >> 6) & 63)),
                        (i[n++] = 128 | (63 & a))
            }
        }
        return i
    }

    static utf8ToString(t) {
        if (!t || 0 === t.length) return ''
        for (var e = t.length, i = '', n = 0; n < e;) {
            var r = t[n++]
            if (128 & r) {
                var o = 63 & t[n++]
                if (192 != (224 & r)) {
                    var a = 63 & t[n++]
                    if (
                        (r =
                            224 == (240 & r)
                                ? ((15 & r) << 12) | (o << 6) | a
                                : ((7 & r) << 18) | (o << 12) | (a << 6) | (63 & t[n++])) <
                        65536
                    )
                        i += String.fromCharCode(r)
                    else {
                        var s = r - 65536
                        i += String.fromCharCode(55296 | (s >> 10), 56320 | (1023 & s))
                    }
                } else i += String.fromCharCode(((31 & r) << 6) | o)
            } else i += String.fromCharCode(r)
        }
        return i
    }

    static hexToBuffer(hex) {
        const buffer = [];
        if (!hex) return buffer;
        for (let i = 0; i < hex.length; i += 2) {
            buffer.push(parseInt(hex.substr(i, 2), 16));
        }
        return buffer;
    }

    static bufferToHex(t) {
        if (!t || 0 === t.length) return ''
        for (var e = new Uint8Array(t.length), i = 0; i < t.length; i++) {
            var n = t[i]
            e[i] = n
        }
        return Array.prototype.map
            .call(new Uint8Array(e), function (t) {
                return ('00' + t.toString(16)).slice(-2)
            })
            .join('')
    }

    static intToBuffer(t) {
        return t
            ? [(t >> 24) & 255, (t >> 16) & 255, (t >> 8) & 255, 255 & t]
            : [0, 0, 0, 0]
    }

    static encodeBase64(t) {
        if (!t || 0 === t.length) return ''
        for (var e = new Uint8Array(t.length), i = 0; i < t.length; i++) {
            var n = t[i]
            e[i] = n
        }
        for (
            var r,
            o,
            a,
            s,
            l,
            c,
            u,
            p =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            d = '',
            h = 0;
            h < e.length;

        )
            (s = (r = e[h++]) >> 2),
                (l = ((3 & r) << 4) | ((o = e[h++]) >> 4)),
                (c = ((15 & o) << 2) | ((a = e[h++]) >> 6)),
                (u = 63 & a),
                isNaN(o) ? (c = u = 64) : isNaN(a) && (u = 64),
                (d += p.charAt(s) + p.charAt(l) + p.charAt(c) + p.charAt(u))
        return d
    }

    static decodeBase64(t) {
        if (!t) return []
        var e,
            i,
            n,
            r,
            o,
            a,
            s =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            l = [],
            c = 0,
            u = new RegExp('[^' + s.replace(/[[\]\\\-^$]/g, '\\$&') + ']', 'g')
        for (t = t.replace(u, ''); c < t.length;)
            (e =
                (s.indexOf(t.charAt(c++)) << 2) |
                ((r = -1 === (r = s.indexOf(t.charAt(c++) || '=')) ? 64 : r) >> 4)),
                (i =
                    ((15 & r) << 4) |
                    ((o = -1 === (o = s.indexOf(t.charAt(c++) || '=')) ? 64 : o) >>
                        2)),
                (n =
                    ((3 & o) << 6) |
                    (a = -1 === (a = s.indexOf(t.charAt(c++) || '=')) ? 64 : a)),
                l.push(e),
                64 !== o && l.push(i),
                64 !== a && l.push(n)
        return l
    }
}

class JSUtils {
    static isValid(value) {
        return value !== undefined && value !== null;
    }

    static isEmpty(value) {
        return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
    }

    static isString(value) {
        return typeof value === "string";
    }

    static isNumber(value) {
        return typeof value === "number" && isFinite(value);
    }

    static isBoolean(value) {
        return typeof value === "boolean";
    }

    static isObject(value) {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }

    static isFunction(value) {
        return typeof value === "function";
    }

    static valToArray(value) {
        return value === null || value === undefined ? [] : Array.isArray(value) ? value : [value];
    }

    static removeElementsFromArray(arr, elements) {
        const valuesToRemove = JSUtils.valToArray(elements);
        return arr.filter(el => !valuesToRemove.includes(el));
    }

    static flattenArray(arr) {
        return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? JSUtils.flattenArray(toFlatten) : toFlatten), []);
    }

    static parseNumber(str, locale) {
        if (str.length === 0) return 0;
        const decimalSeparator = (1.1).toLocaleString(locale).charAt(1);
        const cleanStr = str.replace(new RegExp(`[^-+0-9${decimalSeparator}]`, 'g'), '').replace(decimalSeparator, '.');
        return parseFloat(cleanStr);
    }

    static baseToBase(input, fromBase, toBase) {
        const num = !JSUtils.isNumber(input) ? parseInt(input, fromBase) : input;
        return num.toString(toBase).toUpperCase();
    }

    static inherits(childClass, parentClass) {
        childClass.prototype = Object.create(parentClass.prototype);
        Object.defineProperty(childClass.prototype, "constructor", {
            value: childClass,
            writable: false,
            enumerable: false
        });
    }

    static find(arr, callback) {
        if (!Array.isArray(arr) || !JSUtils.isFunction(callback)) throw new Error("Invalid arguments for find method");
        return arr.find(callback) || null;
    }

    static getObjectValues(obj) {
        return Object.values(obj);
    }

    static getSortedKeys(obj) {
        return Object.keys(obj).sort((a, b) => obj[b] - obj[a]);
    }

    static sortCompare(a, b, descending = false) {
        return a < b ? (descending ? 1 : -1) : a > b ? (descending ? -1 : 1) : 0;
    }

    static getRandomArrayValues(arr, count) {
        return arr.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    static createEvent(name) {
        try {
            return new Event(name);
        } catch (e) {
            const event = document.createEvent('Event');
            event.initEvent(name, false, false);
            return event;
        }
    }

    static assignPropertyValues(target, source) {
        for (let key in source) {
            if (source.hasOwnProperty(key) && target.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    static getApproxByteSize(value) {
        const getSize = (val) => {
            if (typeof val === "boolean") return 4;
            if (typeof val === "string") return val.length * 2;
            if (typeof val === "number") return 8;
            if (typeof val === "object") {
                const values = JSUtils.isValid(val) ? JSUtils.getObjectValues(val) : [];
                return values.reduce((sum, v) => sum + getSize(v), 0);
            }
            return 0;
        };
        return getSize(value);
    }

    static throttle(func, limit) {
        let inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static debounce(func, delay, immediate = false) {
        let timeout;
        return function (...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, delay);
            if (callNow) func.apply(context, args);
        };
    }
}

wasmInstance = null;

const importObject = {
    env: {
        print: (i, j) => { console.log("wasm echo " + new TextDecoder().decode(new Uint8Array(wasmInstance.instance.exports.memory.buffer, i, j))); },
        abort: () => console.error("abort"),
        emscripten_resize_heap: (i) => console.error("Unable to resize heap: " + i),
        emscripten_memcpy_big: (offsetStart, offsetEnd, rowSize) => {
            const m = new Uint8Array(wasmInstance.instance.exports.memory.buffer);
            m.copyWithin(offsetStart, offsetEnd, offsetEnd + rowSize);
        },
        type: () => 0, //2? mobile
        random: () => Math.floor(Math.random() * 2147483647) * 7347 % 2147483647, //Math.floor(0.5 * 2147483647) * 7347 % 2147483647; not random
        time: () => Date.now() //1639471161688 not ramdon
    }
};

async function main() {
    if (process.argv.length !== 3) {
        console.log("Please supply code");
        return;
    }

    const code = process.argv[2];

    const wasmBuffer = fs.readFileSync("./scripts/module.wasm");
    wasmInstance = await WebAssembly.instantiate(wasmBuffer, importObject);

    const push = (name) => {
        const stackSave = wasmInstance.instance.exports.stackSave();
        const memory = new Int8Array(wasmInstance.instance.exports.memory.buffer);
        var p = wasmInstance.instance.exports.stackAlloc(name.length);
        memory.set(name, p);
        wasmInstance.instance.exports.push(p, name.length);
        wasmInstance.instance.exports.stackRestore(stackSave);
    }

    const pull = () => {
        const stackSave = wasmInstance.instance.exports.stackSave();
        const memory = new Int8Array(wasmInstance.instance.exports.memory.buffer);
        const nrOfSamples = 32;
        const colStartSampleNr = wasmInstance.instance.exports.stackAlloc(nrOfSamples);
        wasmInstance.instance.exports.pull(colStartSampleNr, nrOfSamples);
        const arr = Array.from(memory.slice(colStartSampleNr, colStartSampleNr + nrOfSamples));
        return wasmInstance.instance.exports.stackRestore(stackSave), arr;
    }

    const write = (arrayInput, lenght, fcode) => {
        const stackSave = wasmInstance.instance.exports.stackSave();
        const memory = new Int8Array(wasmInstance.instance.exports.memory.buffer);
        const length = arrayInput.length;

        let allocatedPtr = 0;
        if (length !== 0) {
            allocatedPtr = wasmInstance.instance.exports.stackAlloc(length);
            memory.set(arrayInput, allocatedPtr);
        }

        let result = [];
        if (lenght !== 0) {
            const outputPtr = wasmInstance.instance.exports.stackAlloc(lenght);
            wasmInstance.instance.exports.get(allocatedPtr, length, outputPtr, fcode);
            result = Array.from(memory.slice(outputPtr, outputPtr + lenght));
        } else {
            wasmInstance.instance.exports.get(allocatedPtr, length, 0, fcode);
        }

        wasmInstance.instance.exports.stackRestore(stackSave);
        return result;
    }

    const modSet = (name) => {
        wasmInstance.instance.exports.set(name);
    }

    const get = (data, typeInput, typeOutput, lenght, fcode) => {
        fcode = fcode || 0;
        let buffer = [];
        if (JSUtils.isString(data)) {
            switch (typeInput) {
                case ModuleEncoding.Hexadecimal:
                    buffer = Encoding.hexToBuffer(data);
                    break;
                case ModuleEncoding.Utf8:
                    const utf8Length = Encoding.stringLength(data);
                    buffer = Encoding.stringToUtf8(data, utf8Length);
                    break;
                case ModuleEncoding.Base64:
                    buffer = Encoding.decodeBase64(data);
                    break;
            }
        } else if (JSUtils.isNumber(data) && typeInput === ModuleEncoding.Integer) {
            buffer = Encoding.intToBuffer(data).reverse();
        }

        const outputBuffer = write(buffer, lenght, fcode);
        switch (typeOutput) {
            case ModuleEncoding.Base64:
                return Encoding.encodeBase64(outputBuffer);
            case ModuleEncoding.Hexadecimal:
                return Encoding.bufferToHex(outputBuffer);
            case ModuleEncoding.Utf8:
                return Encoding.utf8ToString(outputBuffer);
            default:
                return "";
        }
    };

    //console.log(wasmInstance.instance.exports);
    push(pull());

    const m = `{"authCode":"${code}"}, {"sku":"FUT23IOS"}, {"custom":"657d"}`;
    console.log(m);
    /*
        // Module exports operations
        const setValues = [
            524288, 2147484672, 2147549184, 1107296256, 2147614720,
            2147484160, 262144, 32768, 3223322624, 1077936128,
            8388608, 16777216, 2147500032, 1048576, 3221233664
        ];
    
        setValues.forEach(value => set(value));
    */
    modSet(1073743872);
    modSet(3221229568);
    modSet(3221233664);
    modSet(2147500032);
    modSet(2147614720);
    modSet(32768);
    modSet(2147614720);
    modSet(1048576);
    modSet(2147614720);
    modSet(2147549184);
    modSet(2147614720);
    modSet(2147614720);
    modSet(262144);
    modSet(2147614720);
    modSet(2147484160);
    modSet(1048576);
    modSet(524288);

    console.log(`${get(m, ModuleEncoding.Utf8, ModuleEncoding.Hexadecimal, 32, 10)}/${get(0, ModuleEncoding.Integer, ModuleEncoding.Utf8, 4, 3221225732)}`)
}

main();