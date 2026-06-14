export class EventsDispatcher {

    constructor(debug = false, activeStackReplay = false) {
        this._eventCallBack = [];
        this._eventDebug = debug;
        this._eventStackActive = activeStackReplay;
        this._eventStack = [];
    }

    addEventListener(event, callback) {
        if (Array.isArray(event)) {
            for (const e of event) {
                this.addEventListener(e, callback);
            }
        } else {
            this._eventCallBack.push({
                event: event,
                callback: callback
            });

            for(const e of this._eventStack) {
                if(event.toLowerCase() === e.event.toLowerCase() && typeof callback === "function") {
                    if(this._eventDebug) {
                        console.log("EventsDispatcher *DEBUG*", e.event, e.args);
                    }
                    callback.apply(this, e.args);
                } else if(event.toLowerCase() === "all" && typeof callback === "function") {
                    if(this._eventDebug) {
                        console.log("EventsDispatcher *DEBUG*", e.event, e.args);
                    }
                    callback.apply(this, [e.event.toLowerCase(), ...e.args]);
                }
            }
        }
        return this;
    }

    _dispatchEvent(event, ...args) {
        if(this._eventDebug) {
            console.trace("EventsDispatcher *DEBUG*", event, args);
        }
        if(this._eventStackActive) {
            this._eventStack.push({event: event, args: args});
        }
        let res;
        for(const cb of this._eventCallBack) {
            if(cb.event.toLowerCase() === event.toLowerCase() && typeof cb.callback === "function") {
                const tmp = cb.callback.apply(this, args);
                if(tmp !== undefined) {
                    res = tmp;
                }
            } else if(cb.event.toLowerCase() === "all" && typeof cb.callback === "function") {
                cb.callback.apply(this, [event.toLowerCase(), ...args]);
            }
        }
        return res;
    }
}
