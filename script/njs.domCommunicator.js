NJS.DomCommunicator = NJS.define({
    superclass: NJS.Observable,
    constructor: function(config) {
        config.doNotForceEventDeclaration = true;
        NJS.DomCommunicator.superclass.constructor.call(this, config);
        
        this._listenerContext = config.listenerContext;
        this._senderContext = config.senderContext;
        
        if(config.startListeningOnInit) {
            this.startListening();
        }
    },
    startListening: function() {
        if(this._listening) {
            throw "Already listening";
        }
        this._listening = true;
        var listenerContext = this._listenerContext;
        this._getEl(listenerContext + "RelayElement", true);
        var me = this;
        document.addEventListener(listenerContext + "RelayEvent", function(e) {
            var el = e.srcElement || e.originalTarget;
            var event = el.getAttribute("event");
            var data = el.getAttribute("data");
            if(data == null || data == "") {
                data = {};
            } else {
                data = JSON.parse(data);
            }
            me.fire(event, data);
        }, false, true);
    },
    relay: function(event, data) {
        data = data || {};
        var senderContext = this._senderContext;
        var el = this._getEl(senderContext + "RelayElement");
        if(!el) {
            return false;
        }
        el.setAttribute("event", event);
        el.setAttribute("data", JSON.stringify(data));
        var evt = el.ownerDocument.createEvent("Events");
        evt.initEvent(senderContext + "RelayEvent", true, false);
        el.dispatchEvent(evt);
        return true;
    },
    _getEl: function(id, createIfNotFound) {
        var el = document.getElementById(id);
        if(el || !createIfNotFound) {
            return el;
        }
        el = document.createElement("NJSDOMCOMMUNICATOR");
        el.id = id;
        var par = window.document.body || window.document.head || window.document.documentElement;
        par.appendChild(el);
        return el;
    }
});
