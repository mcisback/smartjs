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

            log(this.$component.name + ", this.props: ", prop);

            Object.defineProperty(this, prop, {
                // value: this._props[prop],
                // writable: true,
                get: () => {
/*                    log(`Getting prop: ${prop}`)

                    if(this.$component.hasMethod(prop)) {
                        return this.$component.methods[prop];
                    }*/

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

        log('PropsProxy methods: ', this.$component.methods);

        Object.entries(this.$component.methods).forEach(([ methodName, method ]) => {
            log('PropsProxy: ', { methodName, method });

            Object.defineProperty(this, methodName, {
                // value: this._props[prop],
                // writable: true,
                get: () => {
                    log(`Getting prop: ${methodName}`)

                    if(this.$component.hasMethod(methodName)) {
                        return this.$component.methods[methodName];
                    }

                    // return this.props[prop];
                }/*,
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
                }*/
            })
        })

        this.isInit = false;
    }

    addProp({name, value}) {
        log(`PropsProxy: adding prop "${name}" => "${value}"`)

        if(!this.hasProp(name)) {
            Object.defineProperty(this, name, {
                // value: this._props[prop],
                // writable: true,
                get: () => {
                    return this.props[prop];
                },
                set: (v) => {

                    let hasChanged = false;

                    if (this.props.hasOwnProperty(prop)) {
                        if (this.props[prop] !== v) {
                            hasChanged = true;
                        }
                    }

                    this.props[prop] = v;

                    if (!this.isInit && hasChanged) {
                        this.onPropChanged(prop, v);
                    }
                }
            });
        }

        this.props[name] = value;
    }

    hasProp(name) {
        return this.props.hasOwnProperty(name);
    }

    setCallback(callback) {
        if(typeof callback === 'function') {
            this.callback = callback
        } else {
            throw new Error('SJ.Props: Callback is not a function')
        }
    }

    triggerPropChanged(opts) {
        const { prop, value } = opts;

        const eventDetails = {
            prop: prop,
            newValue: value,
            component: this.$component
        }

        BrowserEvent.dispatchCustomEvent(document, 'component-prop-changed', eventDetails);

        if(this.callback) {
            this.callback();
        }
    }

    onPropChanged(prop, value) {
        log("SJ.Component.onPropChanged: ", prop, value);

        this.triggerPropChanged({ prop, value });
    }

    /*genObject(args) {
        return (new Function(` return ${args}`).bind(this))();
    }*/
}