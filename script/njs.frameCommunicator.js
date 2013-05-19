NJS.FrameCommunicator = NJS.define({
    superclass: NJS.Observable,
    constructor: function(config) {
        config = config || {};
        config.doNotForceEventDeclaration = true;
        NJS.FrameCommunicator.superclass.constructor.call(this, config);
        
        this._ns = NJS.array(config.ns || ["njs"]);
        
        if(config.startListeningOnInit) {
            this.startListening();
        }
    },
    startListening: function() {
        if(this._listening) {
            throw "Already listening";
        }
        this._listening = true;
        var me = this;
        window.addEventListener("message", function(e) {
            var data = e.data;
            if(typeof data != "string") {
                return;
            }
            var toks = data.split("::");
            if (me._ns.indexOf(toks[0]) == -1) {
                return;
            }
            var command = toks[1];
            var data = toks[2];
            me.fire(command, (data) ? JSON.parse(data) : {});
        });
    },
    relay: function(to, message, data, targetOrigin) {
        targetOrigin = targetOrigin || "*";
        data = data || {};
        to.postMessage(this._ns + "::" + message + "::" + JSON.stringify(data), targetOrigin);
    }
});
