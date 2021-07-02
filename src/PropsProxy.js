import log from "./Log";
import BrowserEvent from "./BrowserEvent";

export default class PropsProxy {
    constructor(props, $component, callback=null) {
        this.props = {};
        this._props = props;
        this.$component = $component;
        this.callback = callback;

        this.isInit = true;

        for(let prop in this._props) {

            log(this.name + ", this.props: ", prop);

            Object.defineProperty(this, prop, {
                // value: this._props[prop],
                // writable: true,
                get: () => {
                    return this.props[prop];
                },
                set: (v) => {

                    let hasChanged = false;

                    if(this.props.hasOwnProperty(prop)) {
                        if (this.props[prop] !== v) {
                            hasChanged = true;
                        }
                    }

                    this.props[prop] = v;

                    if(!this.isInit && hasChanged) {
                        this.onPropChanged(prop, v);
                    }
                }
            });

            this.props[prop] = this._props[prop];

            delete this._props[prop];

        }

        delete this._props;

        this.isInit = false;
    }

    setCallback(callback) {
        if(typeof callback === 'function') {
            this.callback = callback
        } else {
            throw new Error('SJ.Props: Callback is not a function')
        }
    }

    onPropChanged(prop, v) {
        log("SJ.Component.onPropChanged: ", prop, v);

        const eventDetails = {
            prop: prop,
            newValue: v,
            component: this.$component
        }

        BrowserEvent.dispatchCustomEvent(document, 'component-prop-changed', eventDetails);

        if(this.callback) {
            this.callback();
        }
    }

    /*genObject(args) {
        return (new Function(` return ${args}`).bind(this))();
    }*/
}