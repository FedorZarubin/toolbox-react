var ITooLabs = {}
ITooLabs.CData = function() {
    var
    parseCObject = function(context) {
        for (; context.position < context.text.length; context.position++) {
            var c = context.text.charAt(context.position);
            if (c == '(') {
                return parseCArray(context);
            } else if (c == "\"") {
                return parseCString(context);
            } else if (c == "{") {
                return parseCDictionary(context);
            } else if (c == "#") {
                var c1 = context.text.charAt(context.position+1);
                if (c1 == 'T') {
                    return parseCTimestamp(context);
                } else if (c1 == 'I') {
                    return parseCInetAddr(context);
                } else if (c1 == 'N') {
                        return parseCNull(context);
                } else if (/[\d\-]/.test(c1)) {
                    return parseCNumber(context);
                }
            } else if (c == '[') {
                return parseCDatablock(context);
            } else if (/\s/.test(c)) {
                // skip a whitespace
            } else {
                var str = parseCString(context);
                if (str == 'YES') return true;
                else return str;
            }
        }
    },    
    parseCNull = function(context) {
        var ret = '';
        while (context.position < context.text.length) {
            var c = context.text.charAt(context.position);
            if (c != '#') {
                ret += c;
            } else {
                break;
            }
            context.position++;
        }  
        return null;            
    },    
    parseCString = function(context) {
        var ret = '',
        escapeFlag = false,
        quoted = false;
        while (context.position < context.text.length) {
            var c = context.text.charAt(context.position);
            if (!escapeFlag) {
                if (c == '"') {
                    if (quoted) {
                        return ret;
                    } else {
                        ret = '';
                        quoted = true;
                    }
                } else if (c == "\\") {
                    escapeFlag = true;
                } else if (/[^\s=\(\)\{\},;]/.test(c)) {
                    ret += c;
                } else {
                    if (quoted) {
                        ret += c;
                    } else if (/\S/.test(c)) {
                        break; 
                    }
                }
            } else {
                escapeFlag = false;
                var s1 = context.text.substring(context.position, context.position+3);
                if (/^\d+$/.test(s1)) {
                        ret += String.fromCharCode(Number(s1));
                    context.position += 2;
                } else if (c == 't') {
                        ret += String.fromCharCode(9);
                } else if (c == '"' || c == '\\') {
                        ret += c;
                } else if (c == 'e' || c == 'n') {
                        ret += String.fromCharCode(10);
                } else if (c == 'r') {
                        ret += String.fromCharCode(13);
                } else { // Error  - stay as is
                        ret += "\\" + c;
                } 
            }
            context.position++;
        }
        return ret;
    },    
    parseCNumber = function(context) {
        context.position++;
        var ret = '';
        while (context.position < context.text.length) {
            var c = context.text.charAt(context.position);
            if (c == '-' || /\d/.test(c)) {
                ret += c;
            } else {
                return ret * 1;
            }
            context.position++;
        }  
        return ret * 1;
    },      
    skipSpaces = function(context) {
        while (context.position < context.text.length && /\s/.test(context.text.charAt(context.position))) {
            context.position++;  
        }
    },    
    parseCArray = function(context) {
        context.position++;
        var ret = new Array();
        while (context.position < context.text.length) {
            skipSpaces(context);
            var c = context.text.charAt(context.position);
            if (c == ")") {
                context.position++;
                return ret;
            }
            ret[ret.length] = parseCObject(context);
            while (context.position < context.text.length) {
                var c = context.text.charAt(context.position++);
                if (c == ")") {
                    return ret;
                }
                if (c == ",") {
                    break;
                }
            }  
        }
        return ret; // error
    },    
    parseCDictionary = function(context) {
        context.position++;
        var ret = new Object();
        while (context.position < context.text.length) {
            skipSpaces(context);
            if (context.text.charAt(context.position) == "}") {
                context.position++;
                return ret;
            }
            var str = parseCString(context);
            while (context.text.charAt(context.position++) != '=' && context.position < context.text.length);
            var val = parseCObject(context);
            ret[str] = val;
            while (context.text.charAt(context.position++) != ';' && context.position < context.text.length);
        }  
        return ret; // error
    },    
    parseCTimestamp = function(context) {
        if (context.text.substring(context.position).indexOf("#TPAST") == 0) {
            context+=6;
            var ret = new Date();
            ret.setTime(0);
            return ret; 
        }
        context.position++;
        context.position++;
        var day = context.text.substring(context.position, context.position + 2);
        var month = context.text.substring(context.position + 3, context.position + 5) - 1;
        var year = context.text.substring(context.position + 6, context.position + 10);
        var hour = 0;
        var minute = 0;
        var sec = 0;
        if (context.text.charAt(context.position + 10) == '_') {
            hour = context.text.substring(context.position + 11, context.position + 13);
            minute = context.text.substring(context.position + 14, context.position + 16);
            sec = context.text.substring(context.position + 17, context.position + 19);
        }
        var ret = new Date(); 
        ret.setUTCFullYear(year, month, day);
        ret.setUTCHours(hour, minute, sec, 0);
        return ret;
    },    
    parseCDatablock = parseCString,
    parseCInetAddr = function(context) {
        context.position++;
        context.position++;
        var ret = '';
        for (; context.position < context.text.length; context.position++) {
            var c = context.text.charAt(context.position);
            if (c != ';') {
                ret += c;
            } else {
                break;
            }
        }
        return ret;
    },    
    m = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    s = {
        array: function (x) {
            var a = ['('], b, f, i, l = x.length, v;
            for (i = 0; i < l; i += 1) {
                v = x[i];
                f = s[typeof v];
                if (f) {
                    v = f(v);
                    if (typeof v == 'string') {
                        if (b) {
                            a[a.length] = ',';
                        }
                        a[a.length] = v;
                        b = true;
                    }
                }
            }
            a[a.length] = ')';
            return a.join('');
        },
        date: function (x) {
            var
            D = x.getDate(),
            M = x.getMonth() + 1,
            Y = x.getFullYear(),
            h = x.getHours(),
            m = x.getMinutes(),
            s = x.getSeconds(); 
            
            return '#T' + 
                (D > 9 ? String(D) : '0' + String(D)) + '-' +
                (M > 9 ? String(M) : '0' + String(M)) + '-' +
                (Y > 999 ? String(Y) : '0' +
                    (Y > 99 ? String(Y) : '0' +
                        (Y > 9 ? String(Y) : '0' + String(Y)))) + '_' +
                (h > 9 ? String(h) : '0' + String(h)) + ':' +
                (m > 9 ? String(m) : '0' + String(m)) + ':' +
                (s > 9 ? String(s) : '0' + String(s));
        },
        'boolean': function (x) {
            if(x) return "YES";
            return "#NULL#";
        },                
        'null': function (x) {
            return "#NULL#";
        },
        number: function (x) {
            return isFinite(x) ? "#" + String(x) : 'null';
        },                
        object: function (x) {      
            if (x) {
                if (x instanceof Array) {
                    return s.array(x);
                }
                if (x instanceof Date) {
                    return s.date(x);
                }
                var a = ['{'], f, i, v;
                for (i in x) {
                    if (!x.hasOwnProperty || x.hasOwnProperty(i)) {
                        v = x[i];
                        f = s[typeof v];
                        if (f) {
                            v = f(v);
                            if (typeof v == 'string') {
                                a.push(s.string(i), '=', v, ';');
                            }
                        }
                    }
                }
                a[a.length] = '}';
                return a.join('');
            }
            return '#NULL#';
        },
        string: function (x) {
            if (/["\\\x00-\x1f]/.test(x)) {
                x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                    var c = m[b];
                    if (c) {
                        return c;
                    }
                    c = '' + b.charCodeAt();
                    var c1 = c;
                    for (var i = 0; i < 3 - c.length; i++) {
                        c1 = '0' + c1;
                    }
                    return '\\' + c1;
                });
            }
            if (/^[A-Za-z0-9\.@_\-]+$/.test(x)) {
                return x;
            } else {
                return '"' + x + '"';
            }
        }
    };
    return {
        decode: function (text) {
            var context = { "text": text, "position": 0 };
            return parseCObject(context);
        },
        encode: function (v) {
            var f = s[typeof v];
            if (f) {
                v = f(v);
                if (typeof v == 'string') {
                    return v;
                }
            }
            return;
        }
    }
}();

export default ITooLabs