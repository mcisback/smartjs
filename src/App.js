import Router from "./Router";

import Helper from "./Helper.js";
import log from "./Log";

export default class App {

    constructor(opts) {

        if (!Helper.isSet(opts)) {
            throw new Error("SJ.App: Root Element is required for SmartJS Framework to work");
        } else if (!Helper.isObject(opts)) {
            throw new Error("SJ.App: opts must be an object")
        }

        if(typeof opts.rootElement === 'object' && opts.rootElement instanceof HTMLElement) {
            this.$root = rootElement
        } else if(typeof opts.rootElement === 'string') {
            this.$root = document.querySelector(opts.rootElement);
        } else if(typeof opts.rootElement === 'function') {
            this.$root = rootElement()
        }

        if(opts.router && typeof opts.router === 'object' && opts.router instanceof Router) {
            this.$router = opts.router;
            this.$router.setRootElement(this.$root)
        }
    }
}
