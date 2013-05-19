var NJS = {
    emptyFn: function() { return (function() {});},
    _apply: function(to, from, ignore) {
        var applyProperty = function(prop, to, from, ignore, isIf) {
                if ((isIf && to.hasOwnProperty(prop)) || ignore.indexOf(prop) > -1) {
                    return;
                }
                to[prop] = from[prop];
            };
        return (function(to, from, ignore) {
            if (!from) {
                return to;
            }
            var isIf = this.isIf;
            ignore = ignore || [];
            for (var i in from) {
                if (from.hasOwnProperty(i)) {
                    applyProperty(i, to, from, ignore, isIf);
                }
            }
            if (from.hasOwnProperty("toString")) {
                applyProperty("toString", to, from, ignore, isIf);
            }
            if (from.hasOwnProperty("valueOf")) {
                applyProperty("valueOf", to, from, ignore, isIf);
            }
            return to;
        });
    }(),
    apply: function(to, from, ignore) {
        return this._apply.call({
            isIf: false
        }, to, from, ignore);
    },
    applyIf: function(to, from, ignore) {
        return this._apply.call({
            isIf: true
        }, to, from, ignore);
    },
    Marker: function(name, properties) {
        this.name = name;
    },
    define: function(config) {
        var cons = config.hasOwnProperty("constructor") ? config.constructor : null;
        var superclass = config.superclass;
        if (!cons) {
            if (!superclass) {
                cons = function() {};
            } else {
                cons = function() {
                    superclass.apply(this, arguments);
                };
            }
        }
        var proto = null;
        if (superclass) {
            var fn = function() {};
            fn.prototype = superclass.prototype;
            proto = new fn();
        } else {
            proto = {};
            superclass = this.emptyFn;
        }
        this.apply(proto, config, ["superclass", "constructor"]);
        var superclassPrototype = superclass.prototype;
        if (superclassPrototype.constructor == Object.prototype.constructor) {
            superclassPrototype.constructor = superclass;
        }
        proto.constructor = cons;
        proto.superclass = superclassPrototype;
        cons.superclass = superclassPrototype;
    
        cons.prototype = proto;
        return cons;
    },
    unique: function(seed) {
        var uniques = this._uniques = this._uniques || {};
        seed = seed || "njsUnique";
        var counter = uniques[seed] = uniques[seed] || 0;
        counter++;
        uniques[seed] = counter;
        return seed + counter;
    },
    ns: function(str, scope) {
        scope = scope || window;
        var toks = str.split(".");
        for (var i = 0; i < toks.length; i++) {
            var t = toks[i];
            if (scope.hasOwnProperty(t)) {
                scope = scope[t];
                continue;
            }
            scope = scope[t] = {};
        }
    },
    createDelegate: function(fn, scope) {
        return (function() {
            fn.apply(scope || this, arguments);
        });
    },
    _mimic: function(obj, as, config, isIf) {
        var includes = config.includes,
            i;
        if (!includes) {
            includes = [];
            for (i in as) {
                if (as.hasOwnProperty(i)) {
                    includes.push(i);
                }
            }
            if (as.hasOwnProperty("toString")) {
                includes.push("toString");
            }
            if (as.hasOwnProperty("valueOf")) {
                includes.push("valueOf");
            }
        }
        var excludes = config.excludes || [];
        for (i = 0; i < includes.length; i++) {
            var p = includes[i];
            if (excludes.indexOf(p) > -1) {
                continue;
            }
            if (isIf) {
                if (obj.hasOwnProperty[i]) {
                    continue;
                }
                if (!config.overridePrototype && obj[i]) {
                    continue;
                }
            }
            var fn = as[p];
            if (typeof fn != "function") {
                continue;
            }
            obj[p] = NJS.createDelegate(fn, as);
        }
    },
    mimic: function(obj, as, config) {
        config = config || {};
        this._mimic(obj, as, config, false);
    },
    mimicIf: function(obj, as, config) {
        config = config || {};
        this._mimic(obj, as, config, true);
    },
    arrayEach: function(array, fn, config) {
        if (!(array instanceof Array)) {
            this.arrayEach.call(this, [array], fn, config);
            return;
        }
        config = config || {};
        var scope = config.scope || window;
        var baseArgs = config.args;
        for (var i = 0; i < array.length; i++) {
            var z = [array[i]];
            var args = baseArgs ? z.concat(baseArgs) : z;
            if (fn.apply(scope, args) === false) {
                return;
            }
        }
    },
    each: function(obj, fn, config) {
        config = config || {};
        var scope = config.scope || window;
        var baseArgs = config.args;
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) {
                continue;
            }
            var z = [i, obj[i]];
            var args = baseArgs ? z.concat(baseArgs) : z;
            if (fn.apply(scope, args) === false) {
                return;
            }
        }
    },
    filterArray: function(array, fn, config) {
        var o = [];
        config = config || {};
        var scope = config.scope || window;
        var baseArgs = config.args;
        var b = config.breakOnFirst;
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var z = [item];
            var args = baseArgs ? z.concat(baseArgs) : z;
            if (fn.apply(scope, args) === true) {
                o.push(item);
                if (b) {
                    return o;
                }
            }
        }
        return o;
    },
    createBuffered: function(fn, delay, scope) {
        var newFn = function() {
                if (newFn.timeoutId) {
                    try {
                        window.clearTimeout(newFn.timeoutId);
                    } catch (ex) {}
                }
                var callee = function(me, args) {
                        return (function() {
                            fn.apply(scope || me, args);
                        });
                    }(this, Array.prototype.slice.call(arguments, 0));
                newFn.timeoutId = window.setTimeout(function() {
                    callee();
                }, delay);
            };
        return newFn;
    },
    isNullOrEmpty: function(o) {
        if (o == null) {
            return true;
        }
        return this.isEmpty(o);
    },
    isEmpty: function(o) {
        if (o instanceof Array) {
            return o.length === 0;
        }
        return o === "";
    },
    isBlank: function(o) {
        return this.trim(o) == "";
    },
    isNullOrBlank: function(o) {
        return o == null || this.trim(o) == "";
    },
    lTrim: function(str) {
        var re = /\s*((\S+\s*)*)/;
        return str.replace(re, "$1");
    },
    rTrim: function(str) {
        var re = /((\s*\S+)*)\s*/;
        return str.replace(re, "$1");
    },
    trim: function(str) {
        return this.lTrim(this.rTrim(str));
    },
    removeIndex: function(array, index) {
        var val = array[index];
        array.splice(index, 1);
        return val;
    },
    removeItem: function(array, obj) {
        var i = array.indexOf(obj);
        if (i == -1) {
            return -1;
        }
        array.splice(i, 1);
        return i;
    },
    setCookie: function(name, value, expires_in_days, path, domain) {
        var cookie = name + "=" + value + ";";
        expires_in_days = expires_in_days || 0;
        if(expires_in_days === 0) {
            cookie += " expires=0";
        } else {
            expires_in_days = expires_in_days || 3650;
            var date = new Date();
            date.setTime(date.getTime() + (expires_in_days * 24 * 60 * 60 * 1000));
            cookie += " expires=" + date.toGMTString() + ";";
        }
        cookie += " path=" + (path || "/") + ";";
        if(domain) {
            cookie += " domain=" + domain + ";";
        }
        document.cookie = cookie;
    },
    deleteCookie: function(name, path, domain) {
        this.setCookie(name, "", -1, path, domain);
    },
    getCookie: function(name) {
        var cookies =document.cookie.split(";");
        for (var i=0 ; i<cookies.length; i++)
        {
            var n = cookies[i].substr(0, cookies[i].indexOf("="));
            n = n.replace(/^\s+|\s+$/g,"");
            if(n == name) {
                return unescape(cookies[i].substr(cookies[i].indexOf("=") + 1));
            }
        }
        return null;
    },
    hook: function (parent, toks, fn) {
        if(toks.length == 0) {
            return;
        }
        toks = toks.slice(0);
    
        var tok = toks.shift();
        var hookedFor = parent._njsHookedFor = parent._njsHookedFor || {};
        var origs = parent._njsOrigs =  parent._njsOrigs || {};
    
        if(hookedFor[tok]) {
            return;
        }
    
        var handleValue = function(val) {
            if(toks.length == 0) {
                val = fn(val, parent);
                origs[tok] = val;
                return;
            }
    
            origs[tok] = val;
            if(!val || !(val instanceof Object)) {
                return;
            }
            NJS.hook(val, toks, fn);
        };
    
        if(parent[tok] != null) {
            handleValue(parent[tok]);
        }
    
        try {
            parent.__defineSetter__(tok, function(val) {
                handleValue(val);
            });
    
            parent.__defineGetter__(tok, function() {
                return origs[tok];
            });
        } catch (ex) {
            logger.error("Could not hook settter/getter", ex);
        }
    },
    safeFunction: function(fn, scope) {
        return (function() {
            try {
                fn.apply(scope || window, arguments);
            } catch (ex) {}
        });
    },
    isArray: function(obj) {
        return obj != null && Object.prototype.toString.call(obj) === '[object Array]';
    },
    array: function(obj) {
        if(this.isArray(obj)) {
            return obj;
        }
        return [obj];
    }
};
