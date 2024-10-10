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
}

let Encoding = function() {
    function Encoding() {}
    return Encoding.stringLength = function(t) {
        if (!t) return 0;
        for (var e = 0, i = 0; i < t.length; ++i) {
            var r = t.charCodeAt(i);
            55296 <= r && r <= 57343 && (r = 65536 + ((1023 & r) << 10) | 1023 & t.charCodeAt(++i)), r <= 127 ? ++e : e += r <= 2047 ? 2 : r <= 65535 ? 3 : 4
        }
        return e
    }, Encoding.stringToUtf8 = function(t, e) {
        if (0 === e || !t) return [];
        for (var i = new Array(e), r = 0, n = e, o = 0; o < t.length; ++o) {
            var s = t.charCodeAt(o);
            if (55296 <= s && s <= 57343) s = 65536 + ((1023 & s) << 10) | 1023 & t.charCodeAt(++o);
            if (s <= 127) {
                if (n <= r) break;
                i[r++] = s
            } else if (s <= 2047) {
                if (n <= r + 1) break;
                i[r++] = 192 | s >> 6, i[r++] = 128 | 63 & s
            } else if (s <= 65535) {
                if (n <= r + 2) break;
                i[r++] = 224 | s >> 12, i[r++] = 128 | s >> 6 & 63, i[r++] = 128 | 63 & s
            } else {
                if (n <= r + 3) break;
                i[r++] = 240 | s >> 18, i[r++] = 128 | s >> 12 & 63, i[r++] = 128 | s >> 6 & 63, i[r++] = 128 | 63 & s
            }
        }
        return i
    }, Encoding.utf8ToString = function(t) {
        if (!t || 0 === t.length) return "";
        for (var e = t.length, i = "", r = 0; r < e;) {
            var n = t[r++];
            if (128 & n) {
                var o = 63 & t[r++];
                if (192 != (224 & n)) {
                    var s = 63 & t[r++];
                    if ((n = 224 == (240 & n) ? (15 & n) << 12 | o << 6 | s : (7 & n) << 18 | o << 12 | s << 6 | 63 & t[r++]) < 65536) i += String.fromCharCode(n);
                    else {
                        var a = n - 65536;
                        i += String.fromCharCode(55296 | a >> 10, 56320 | 1023 & a)
                    }
                } else i += String.fromCharCode((31 & n) << 6 | o)
            } else i += String.fromCharCode(n)
        }
        return i
    }, Encoding.hexToBuffer = function(t) {
        var e = [];
        if (!t) return e;
        for (var i = 0; i < t.length; i += 2) e.push(parseInt(t.substr(i, 2), 16));
        return e
    }, Encoding.bufferToHex = function(t) {
        if (!t || 0 === t.length) return "";
        for (var e = new Uint8Array(t.length), i = 0; i < t.length; i++) {
            var r = t[i];
            e[i] = r
        }
        return Array.prototype.map.call(new Uint8Array(e), function(t) {
            return ("00" + t.toString(16)).slice(-2)
        }).join("")
    }, Encoding.intToBuffer = function(t) {
        return t ? [t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, 255 & t] : [0, 0, 0, 0]
    }, Encoding.encodeBase64 = function(t) {
        if (!t || 0 === t.length) return "";
        for (var e = new Uint8Array(t.length), i = 0; i < t.length; i++) {
            var r = t[i];
            e[i] = r
        }
        for (var n, o, s, a, l, c, u, p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", h = "", d = 0; d < e.length;) a = (n = e[d++]) >> 2, l = (3 & n) << 4 | (o = e[d++]) >> 4, c = (15 & o) << 2 | (s = e[d++]) >> 6, u = 63 & s, isNaN(o) ? c = u = 64 : isNaN(s) && (u = 64), h += p.charAt(a) + p.charAt(l) + p.charAt(c) + p.charAt(u);
        return h
    }, Encoding.decodeBase64 = function(t) {
        if (!t) return [];
        var e, i, r, n, o, s, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            l = [],
            c = 0,
            u = new RegExp("[^" + a.replace(/[[\]\\\-^$]/g, "\\$&") + "]", "g");
        for (t = t.replace(u, ""); c < t.length;) e = a.indexOf(t.charAt(c++)) << 2 | (n = -1 === (n = a.indexOf(t.charAt(c++) || "=")) ? 64 : n) >> 4, i = (15 & n) << 4 | (o = -1 === (o = a.indexOf(t.charAt(c++) || "=")) ? 64 : o) >> 2, r = (3 & o) << 6 | (s = -1 === (s = a.indexOf(t.charAt(c++) || "=")) ? 64 : s), l.push(e), 64 !== o && l.push(i), 64 !== s && l.push(r);
        return l
    }, Encoding
}();

var JSUtils = function() {
    function a() {}
    return a["isValid"] = function(b) {
        return b !== undefined && b !== null;
    }, a["isEmpty"] = function(b) {
        return b === undefined || b === null || typeof b === "string" && b["trim"]() === "";
    }, a["isString"] = function(b) {
        return typeof b === "string";
    }, a["isNumber"] = function(b) {
        return typeof b === "number" && isFinite(b);
    }, a["isBoolean"] = function(b) {
        return typeof b === "boolean";
    }, a["isObject"] = function(b) {
        return typeof b === "object" && b !== null && !Array["isArray"](b);
    }, a["isFunction"] = function(b) {
        return typeof b === "function";
    }, a["valToArray"] = function(b) {
        if (b === null || b === undefined) return [];
        return Array["isArray"](b) ? b : [b];
    }, a["removeElementsFromArray"] = function(c, d) {
        var e = a["valToArray"](d);
        return c["filter"](function(f) {
            return e["indexOf"](f) < 0;
        });
    }, a["flattenArray"] = function(b) {
        return b["reduce"](function(c, d) {
            return c["concat"](Array["isArray"](d) ? a["flattenArray"](d) : d);
        }, []);
    }, a["parseNumber"] = function(b, c) {
        if (b["length"] === 0) return 0;
        var d = 1.1["toLocaleString"](c),
            e = new RegExp("[^-+0-9$" + d["charAt"](1) + "]", "g");
        return parseFloat(b["replace"](e, "")["replace"](d["charAt"](1), "."));
    }, a["baseToBase"] = function(b, c, d) {
        var e = !a["isNumber"](d) ? parseInt(!a["isEmpty"](d) ? d : "0", b) : d;
        return e["toString"](c)["toUpperCase"]();
    }, a["inherits"] = function(b, c) {
        b["prototype"] = Object["create"](c["prototype"]), Object["defineProperty"](b["prototype"], "constructor", {
            value: b,
            writable: ![],
            enumerable: ![]
        });
    }, a["find"] = function(b, c) {
        var d;
        DebugUtils["Assert"](Array["isArray"](b), "Array find method called without a valid array."), DebugUtils["Assert"](typeof c === "function", "Array finds method called without a valid callback function.");
        if (a["isFunction"]([]["find"])) return (d = b["find"](c)) !== null && d !== void 0 ? d : null;
        for (var e = 0; e < b["length"]; e++) {
            if (c(b[e], e, b)) return b[e];
        }
        return null;
    }, a["getObjectValues"] = function(b) {
        if (a["isFunction"](Object["values"])) return Object["values"](b);
        var c = [];
        for (var d in b) {
            b["hasOwnProperty"](d) && c["push"](b[d]);
        }
        return c;
    }, a["getSortedKeys"] = function(b) {
        var c = [];
        for (var d in b) {
            b["hasOwnProperty"](d) && c["push"](d);
        }
        return c["sort"](function(e, f) {
            return b[f] - b[e];
        });
    }, a["sortCompare"] = function(c, d, e) {
        e === void 0 && (e = ![]);
        if (c < d) return e ? 1 : -1;
        else {
            if (c > d) return e ? -1 : 1;
        }
        return 0;
    }, a["getRandomArrayValues"] = function(b, c) {
        return b["sort"](function(d, e) {
            return .5 - Math["random"]();
        })["slice"](0, c);
    }, a["createEvent"] = function(b) {
        var c;
        try {
            c = new Event(b);
        } catch (d) {
            c = document["createEvent"]("Event"), c["initEvent"](b, ![], ![]);
        }
        return c;
    }, a["assignPropertyValues"] = function(b, c) {
        for (var d in c) {
            c["hasOwnProperty"](d) && b["hasOwnProperty"](d) && (c[d] = b[d]);
        }
    }, a["getApproxByteSize"] = function(b) {
        function c(d) {
            if (typeof d === "boolean") return 4;
            else {
                if (typeof d === "string") return d["length"] * 2;
                else {
                    if (typeof d === "number") return 8;
                    else {
                        if (typeof d === "object") {
                            var e = a["isValid"](d) ? a["getObjectValues"](d) : [];
                            return e["reduce"](function(f, g) {
                                return f + c(g);
                            }, 0);
                        }
                    }
                }
            }
            return 0;
        }
        return c(b);
    }, a["throttle"] = function(b, c) {
        var d = ![];
        return function() {
            var e = [];
            for (var f = 0; f < arguments["length"]; f++) {
                e[f] = arguments[f];
            }!d && (d = !![], b["apply"](this, e), setTimeout(function() {
                return d = ![];
            }, c));
        };
    }, a["debounce"] = function(b, c, d) {
        d === void 0 && (d = ![]);
        var e, f;
        return function() {
            var g = [];
            for (var h = 0; h < arguments["length"]; h++) {
                g[h] = arguments[h];
            }
            f = this;
            var i = function() {
                    e = null, !d && b["apply"](f, g);
                },
                j = d && !e;
            e && clearTimeout(e), e = window["setTimeout"](i, c), j && b["apply"](f, g);
        };
    }, a;
}();

function authCode() {
    function c(g) {
        return g["toString"](36)["toLowerCase"]();
    }

    function d(g, h) {
        return g["split"]("")["map"](function(i) {
            return String["fromCharCode"](i["charCodeAt"](0) + h);
        })["join"]("");
    }

    function e(g) {
        var h, i = [];
        for (var j = 1; j < arguments["length"]; j++) {
            i[j - 1] = arguments[j];
        }
        var k = Array["prototype"]["slice"]["call"](i),
            l = (h = k["shift"]()) !== null && h !== void 0 ? h : 0;
        return k["reverse"]()["map"](function(m, n) {
            return String["fromCharCode"](m - l - g - n);
        })["join"]("");
    }

    function f() {
        var g = globalThis["Math"]["ceil"](globalThis["Math"]["random"]() * 65535),
            h = (g * 6466 % 65535)["toString"](16);
        while (h["length"] < 4) {
            h = "0" + h;
        }
        return h;
    }
    return d(c(10), 26) + d(c(18), -71) + c(506501) + d(c(19), -39) + e(48, 24, 113, 124, 204, 112, 111, 134, 109, 175, 173, 183) + d(c(10), 26) + d(c(18), -71) + c(37038) + d(c(18), -71) + d(c(10), -39) + d(c(666), -71) + d(c(12), 26) + d(c(1024), -71) + d(c(10), 26) + d(c(18), -71) + c(777327430) + e(4, 62, 102, 125, 100) + f() + d(c(18), -71) + e(43, 44, 212);
}

const f = {};
f["print"] = function(i, j) {}, f["abort"] = function() {
    console["error"]("abort");
}, f["emscripten_resize_heap"] = function(i) {
    console["error"]("Unable to resize heap: " + i);
}, f["emscripten_memcpy_big"] = function(i, j, k) {
    var l = d["getModuleInstance"](),
        m = new Uint8Array(l["exports"]["memory"]["buffer"]);
    m["copyWithin"](i, j, j + k);
}, f["type"] = function() {
    return 0;
}, f["random"] = function() {
    return Math["floor"](Math["random"]() * 2147483647) * 7347 % 2147483647;
}, f["time"] = function() {
    return Date["now"]();
};


function main() {
    if (process.argv.length != 3) {
        console.log("Please supply code");
        return;
    }

    const code = process.argv[2];
    const wasmBuffer = fs.readFileSync("./scripts/module.wasm");
    const instance = WebAssembly.instantiate(wasmBuffer, {
        "env": f
    }).then(module => {
        const write = function(c, d, e) {
            var g = module.instance.exports["stackSave"](),
                h = new Int8Array(module.instance.exports["memory"]["buffer"]),
                i = 0,
                j = c["length"];
            j !== 0 && (i = module.instance.exports["stackAlloc"](j), h["set"](c, i));
            var k = [];
            if (d !== 0) {
                var l = module.instance.exports["stackAlloc"](d);
                module.instance.exports["get"](i, j, l, e), k = Array["from"](h["slice"](l, l + d));
            } else module.instance.exports["get"](i, j, 0, e);
            return module.instance.exports["stackRestore"](g), k;
        };
        const get = function(c, d, e, f, g) {
            var h = g || 0,
                i = [];
            if (JSUtils["isString"](c)) {
                if (d === ModuleEncoding["Hexadecimal"]) i = Encoding["hexToBuffer"](c);
                else {
                    if (d === ModuleEncoding["Utf8"]) {
                        var j = Encoding["stringLength"](c);
                        i = Encoding["stringToUtf8"](c, j);
                    } else d === ModuleEncoding["Base64"] && (i = Encoding["decodeBase64"](c));
                }
            } else JSUtils["isNumber"](c) && d === ModuleEncoding["Integer"] && (i = Encoding["intToBuffer"](c)["reverse"]());
            var k = write(i, f, h);
            if (e === ModuleEncoding["Base64"]) return Encoding["encodeBase64"](k);
            else {
                if (e === ModuleEncoding["Hexadecimal"]) return Encoding["bufferToHex"](k);
                else {
                    if (e === ModuleEncoding["Utf8"]) return Encoding["utf8ToString"](k);
                }
            }
            return "";
        };

        //console.log(module.instance.exports);

        const m = `{"authCode":"${code}"}, {"sku":"FUT23IOS"}, {"custom":"657d"}`;
        console.log(m);

        module.instance.exports.set(524288);
        module.instance.exports.set(2147484672)
        module.instance.exports.set(2147549184)
        module.instance.exports.set(1107296256)
        module.instance.exports.set(2147614720)
        module.instance.exports.set(2147484160)
        module.instance.exports.set(262144);
        module.instance.exports.set(32768)
        module.instance.exports.set(3223322624)
        module.instance.exports.set(1077936128)
        module.instance.exports.set(8388608);
        module.instance.exports.set(16777216);
        module.instance.exports.set(2147500032);
        module.instance.exports.set(1048576);
        module.instance.exports.set(3221233664);
        console.log(get(m, ModuleEncoding["Utf8"], ModuleEncoding["Hexadecimal"], 32, 10) + "/" + get(0, ModuleEncoding["Integer"], ModuleEncoding["Utf8"], 4, 3221225732));
    });
}

main();