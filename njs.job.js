//State 0: init
//State 1: running
//State 2: paused
//State 3: terminated
NJS.Job = NJS.define({
    startOnInit: false,
    startPaused: false,
    superclass: NJS.Observable,
    events: ["init", "start", "end", "pause", "resume"],
    constructor: function(config) {
        NJS.Job.superclass.constructor.call(this, config);
        if (config) {
            NJS.applyIf(this, config);
        }
        this.id = this.id || NJS.unique("job");
        this.init();
    },
    init: function() {
        if (this._state != undefined) {
            throw "Can not initialize. Job " + this.id + ".";
        }
        this._state = 0;
        this.onInit();
        this.fire("init", this);
        if (this.startOnInit || this.startPaused) {
            this.start();
            if (this.startPaused) {
                this.pause();
            }
        }
    },
    start: function() {
        if (this._state != 0) {
            throw "Can not start. Job " + this.id + " is not in initialized state.";
        }
        this._state = 1;
        this.onStart();
        this.fire("start", this);
    },
    end: function() {
        if (this._state == 3 || this._state == 0) {
            throw "Can not end. Job " + this.id + " already ended or was never started.";
        }
        this._state = 3;
        this.onEnd();
        this.fire("end", this);
    },
    pause: function() {
        if (this._state != 1) {
            throw "Can not pause. Job " + this.id + " is not running.";
        }
        this._state = 2;
        this.onPause();
        this.fire("pause", this);
    },
    resume: function() {
        if (this._state != 2) {
            throw "Can not resume. Job " + this.id + " is not in paused state.";
        }
        this._state = 1;
        this.onResume();
        this.fire("resume", this);
    },
    getState: function() {
        return this._state;
    },
    onInit: NJS.emptyFn,
    onStart: NJS.emptyFn,
    onEnd: NJS.emptyFn,
    onPause: NJS.emptyFn,
    onResume: NJS.emptyFn
});
NJS.JobQueue = NJS.define({
    superclass: NJS.Job,
    constructor: function(config) {
        NJS.JobQueue.superclass.constructor.call(this, config);
    },
    maxJobs: Number.MAX_VALUE,
    onInit: function() {
        this._queue = [];
        this._runningJobs = [];
    },
    onStart: function() {
        this._check();
    },
    onPause: function() {
        for (var i = 0; i < this._runningJobs.length; i++) {
            this._runningJobs.pause();
        }
    },
    onResume: function() {
        for (var i = 0; i < this._runningJobs.length; i++) {
            this._runningJobs.resume();
        }
        this._check();
    },
    onEnd: function() {
        for (var i = 0; i < this._runningJobs.length; i++) {
            this._runningJobs.end();
        }
    },
    queue: function(job) {
        if (this._state == 3) {
            throw "Can queue. Job queue " + this.id + " already ended.";
        }
        if (job.getState() != 0) {
            throw "Can queue. Job " + job.id + " is not in init state.";
        }
        job.on("end", this._registerFinish, this);
        this._queue.push(job);
        if (this._state == 1) {
            this._check();
        }
    },
    _check: function() {
        var runningJobs = this._runningJobs;
        var queue = this._queue;
        if (queue.length == 0) {
            return;
        }
        if (runningJobs.length >= this.maxJobs) {
            return;
        }
        var o = NJS.removeIndex(queue, 0);
        runningJobs.push(o);
        o.start();
        this._check();
    },
    _registerFinish: function(job) {
        if (this._state == 0) {
            throw "unexpected register finish";
        }
        if (this._state == 3) {
            return;
        }
        var i = NJS.removeItem(this._runningJobs, job);
        if (i == -1) {
            throw "unknown job ended";
        }
        if (this._state == 1) {
            this._check();
        }
    }
});
