NJS.Event = NJS.define({
    constructor: function(name) {
        this.name = name;
        this._listeners = [];
    },
    on: function(fn, scope) {
        this._listeners.push({
            fn: fn,
            scope: scope
        });
    },
    un: function(fn) {
        var ls = this._listeners;
        var f = -1;
        for (var i = 0; i < ls.length; i++) {
            var l = ls[i];
            if (l.fn == fn) {
                f = i;
                break;
            }
        }
        if (f != -1) {
            ls.splice(f, 1);
        }
    },
    fire: function() {
        if (this._suspended) {
            if (this._queue) {
                this._queue.push(Array.prototype.splice.call(arguments, 0, arguments.length));
            }
            return;
        }
        var ls = [].concat(this._listeners);
        for (var i = 0; i < ls.length; i++) {
            var l = ls[i];
            if (l.fn.apply(l.scope || window, arguments) === false) {
                return;
            }
        }
    },
    purgeListeners: function() {
        this._listeners = [];
    },
    hasListeners: function() {
        return this._listeners.length > 0;
    },
    suspend: function(queue) {
        if (this._suspended) {
            return;
        }
        this._suspended = true;
        if (queue) {
            this._queue = [];
        }
    },
    resume: function(disragardQueue) {
        if (!this._suspended) {
            return;
        }
        this._suspended = false;

        var q = this._queue;
        delete this._queue;

        if (disragardQueue) {
            return;
        }
        if (!q) {
            return;
        }
        for (var i = 0; i < q.length; i++) {
            this.fire.apply(this, q[i]);
        }
    }
});
NJS.Observable = NJS.define({
    doNotForceEventDeclaration: false,
    constructor: function(config) {
        config = config || {};
        
        this._events = {};
        var events = config.events || this.events;
        if (events) {
            this.addEvents(events);
        }
        var listeners = config.listeners || this.listeners;
        if (listeners) {
            this.on(listeners);
        }
        if(config.doNotForceEventDeclaration) {
            this.doNotForceEventDeclaration = config.doNotForceEventDeclaration;
        }
    },
    addEvents: function(eventNames, suspended) {
        if (suspended == null) {
            suspended = this._suspended;
        }
        if (typeof eventNames == "string") {
            eventNames = [eventNames];
        }
        for (var i = 0; i < eventNames.length; i++) {
            var eventName = eventNames[i];
            if (this._events[eventName] != null) {
                continue;
            }
            var event = this._events[eventName] = new NJS.Event(eventName);
            if (suspended) {
                event.suspend();
            }
        }
    },
    fire: function(eventName, args) {
        var event = this.getEvent(eventName);
        var len = arguments.length;
        event.fire.apply(event, len > 1 ? Array.prototype.splice.call(arguments, 1, len - 1) : []);
    },
    on: function(listeners, fn, scope) {
        if (listeners instanceof Array) {
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                this.on(listener);
            }
            return;
        }
        if (typeof listeners != "string") {
            this.on(listeners.event, listeners.fn, listeners.scope);
            return;
        }
        this.getEvent(listeners).on(fn, scope);
    },
    getEvent: function(eventName) {
        var event = this._events[eventName];
        if(event != null) {
            return event;
        }
        if(!this.doNotForceEventDeclaration) {
            throw "Event " + eventName + " not found.";
        }
        this.addEvents([eventName]);
        return this._events[eventName];
    },
    un: function(eventName, fn) {
        this.getEvent(eventName, true).un(fn);
    },
    hasListeners: function(eventNames) {
        if (typeof eventNames == "string") {
            eventNames = [eventNames];
        }
        var events = this._events;
        eventNames = eventNames || events;
        for(var eventName in eventNames) {
            if (events[eventName].hasListeners()) {
                return true;
            }
        }
        return false;
    },
    purgeListeners: function(eventNames) {
        if (typeof eventNames == "string") {
            eventNames = [eventNames];
        }
        var events = this._events;
        eventNames = eventNames || events;
        for(var eventName in eventNames) {
            events[eventName].purgeListeners();
        }
    },
    suspendEvent: function(eventName, queue) {
        this.getEvent(eventName).suspend(queue);
    },
    suspendAllEvents: function(queue) {
        if (this._suspended) {
            return;
        }
        this._suspended = true;
        var events = this._events;
        for(var eventName in events) {
            events[eventName].suspend(queue);
        }
    },
    resumeEvent: function(eventName, disragardQueue) {
        this.getEvent(eventName).resume(disragardQueue);
    },
    resumeAllEvents: function(disragardQueue) {
        if (!this._suspended) {
            return;
        }
        this._suspended = false;
        var events = this._events;
        for (var eventName in events) {
            events[eventName].suspend(disragardQueue);
        }
    },
    mimicMe: function(who) {
        if (who.events) {
            this.addEvents(who.events);
        }
        NJS.mimicIf(who, this, {
            includes: ["addEvents", "hasEvent", "fire", "on", "un", "hasListeners", "purgeListeners", "suspendEvent", "suspendAllEvents", "resumeEvent", "resumeAllEvents"]
        });
    }
});
