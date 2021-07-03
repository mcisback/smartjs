import Component from "./Component";

import log from "./Log";

export default class ComponentsRegister {
    static registerComponent(comp) {
        if(!window.___sj) {
            window.___sj = {}
        }

        if(!window.___sj.components) {
            window.___sj.components = new Map();
        }

        if(!(typeof comp === 'object' && comp instanceof Component)) {
            console.error('comp: ', comp)
            throw new Error('ComponentsRegister.registerComponent passed comp is not a component')
        }

        if(!window.___sj.components.has(comp.getName())) {
            log('ComponentsRegister registering component: ', comp.getName())

            window.___sj.components.set(comp.getName(), comp);
        } else {
            log(`ComponentsRegister component ${comp.getName()} already registered`)
        }
    }

    static getRegisteredComponent(name) {
        if(!window.___sj || !window.___sj.components) {
            throw new Error('No components registered')
        }

        if(!window.___sj.components.has(name.toLowerCase())) {
            throw new Error(`Component with key ${name.toLowerCase()} does not exist`);
        }

        return window.___sj.components.get(name.toLowerCase());
    }

    static isComponentRegistered(name) {
        if(!window.___sj || !window.___sj.components) {
            throw new Error('No components registered')
        }

        return window.___sj.components.has(name.toLowerCase());
    }

    static getAllRegisteredComponents() {
        return window.___sj.components;
    }

    static registerComponentsFromArray(components) {
        if(components.length <= 0) {
            return;
        }

        for(let i = 0; i < components.length; i++) {
            this.registerComponent(components[i]);
        }
    }
}