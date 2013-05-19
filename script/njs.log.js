NJS.Log = {
    Level: {
        ALL: 100,
        TRACE: 70,
        DEBUG: 60,
        INFO: 50,
        LOG: 40,
        WARN: 30,
        ERROR: 20,
        FATAL: 10,
        OFF: 0
    }
};

NJS.Log.EmptyAppender = NJS.define({
    trace: NJS.emptyFn,
    debug: NJS.emptyFn,
    info: NJS.emptyFn,
    log: NJS.emptyFn,
    warn: NJS.emptyFn,
    error: NJS.emptyFn,
    fatal: NJS.emptyFn
});

NJS.Log.ConsoleAppender = NJS.define({
    extends: NJS.Log.EmptyAppender,
    trace: function() {
        console.trace.apply(console, arguments);
    },
    debug: function() {
        console.debug.apply(console, arguments);
    },
    info: function() {
        console.info.apply(console, arguments);
    },
    log: function() {
        console.log.apply(console, arguments);
    },
    warn: function() {
        console.warn.apply(console, arguments);
    },
    error: function() {
        console.error.apply(console, arguments);
    },
    fatal: function() {
        console.error.apply(console, arguments);
    }
});
NJS.Log.Logger = function() {
    var logLevels = NJS.Log.Level;
    var loggerFn = function(appenderMethod, level) {
        return (function() {
            if(this._level < level) {
                return;
            }
            var a = this._appender;
            try {
                a[appenderMethod].apply(a, arguments);
            } catch (ex) {} //sometime there are issue while converting objects to string.
        });  
    };
    return NJS.define({
        constructor: function(level, appender) {
            this.setLogLevel(level);
            this.setAppender(appender);
        },
        setLogLevel: function(level) {
            this._level = level || logLevels.OFF;
        },
        setAppender: function(appender) {
            this._appender = appender;
        },
        trace: loggerFn("trace", logLevels.TRACE),
        debug: loggerFn("debug", logLevels.DEBUG),
        info: loggerFn("info", logLevels.INFO),
        log: loggerFn("log", logLevels.LOG),
        warn: loggerFn("warn", logLevels.WARN),
        error: loggerFn("error", logLevels.ERROR),
        fatal: loggerFn("fatal", logLevels.FALTAL),
    });
}();
