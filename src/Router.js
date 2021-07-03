import ComponentsRegister from "./ComponentsRegister";
import Helper from "./Helper.js";

import log from "./Log";

export default class Router {

    constructor(routes, $root=null){
        log("routes:", routes);

        if (!Helper.isObject(routes) || !Helper.isSet(routes)) {
            throw new Error("SJ.Router: Routes Definitions must be an object and not empty or false")
        }

        this.routes = routes;

        for(const [path, opts] of this.routes.routes.entries()) {
            log(`Router Registering Component For path: ${path}, opts: `, opts)

            ComponentsRegister.registerComponent(opts.component)
        }

        this.history = []

        if($root) {
            this.$root = $root
        }

        window.onpopstate = () => {
            log("window.onpopstate, window.location.pathname:", window.location.pathname);

            log("window.onpopstate, this.popPath: ", this.popPath());

            this.loadComponentFromRoute(window.location.pathname);
        }

        const self = this;

        window.onload = function(e) {
            log("SJ.Router window.onload fired: ", e);

            if(self.$root) {
                self.loadComponentFromRoute(window.location.pathname)
            }
        }
    }

    setRootElement($root) {
        this.$root = $root
    }

    goTo(pathname) {
        return this.loadComponentFromRoute(pathname)
    }

    loadComponentFromRoute(pathname) {
        if(!this.$root) {
            throw new Error("Router Root Element is missing")
        }

        log('SJ.Router this.$root: ', this.$root)
        
        log("SJ.Router loadComponentFromRoute fired, pathname: ", pathname);

        this.pushPath(pathname);

        const component = this.getComponent(pathname);

        component.setRouter(this);

        component.render(true);

        this.$root.innerHTML = "";
        this.$root.appendChild(component.getDomElement());
    }

    getPathnameFromWindow() {
        let pathname = window.location.pathname;

        return this.filterPathname(pathname);
    }

    filterPathname(pathname) {
        return pathname === '/' ? 'index' : pathname;
    }

    historyPush(pathname) {
        return window.history.pushState({}, pathname, window.location.origin + pathname);
    }

    get(pathname) {
        return this.routes.routes.get(this.filterPathname(pathname));
    }

    getAll() {
        return this.routes;
    }

    getTemplate(pathname) {
        const r = this.get(pathname);
        return r.template;
    }

    getComponent(pathname) {
        log('Router pathname: ', pathname);

        const r = this.get(pathname);
        return r.component;
    }

    pushPath(pathname) {
        this.history.push(pathname);

        log("SJ.Router.pushPath, history: ", this.history);

        return this.historyPush(pathname);
    }

    popPath() {
        let path = this.history.pop();

        log("SJ.Router.pushPath, history: ", this.history);

        return path;
    }

}
