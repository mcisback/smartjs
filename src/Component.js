import PropsProxy from "./PropsProxy";

import Helper from "./Helper";
import log from "./Log";
import AttributesDispatcher from "./Directives/AttributesDispatcher";
import Router from "./Router";

import { DiffDOM } from "diff-dom";
import md5 from "md5"

export default class Component {

    constructor(opts) {

        if (!Helper.isSet(opts)) {
            throw new Error("SJ.Component: Root Element is required for SmartJS Framework to work");
        } else if (!Helper.isObject(opts)) {
            throw new Error("SJ.Component: opts must be an object")
        }

        this.$el = document.createElement("div");
        this.id = "sj-div-" + Helper.uuid4()

        this.$el.setAttribute("id", this.id);
        this.$el.style.border = "0";
        this.$el.style.margin = "0";
        this.$el.style.padding = "0";

        this.wrappedVarsMap = new Map();

        this.name = opts.name;
        this.props = new PropsProxy(opts.props, this, this.render.bind(this));
        this.methods = opts.methods;

        this.count = 0

        if(opts.template instanceof HTMLElement) {
            this.templateOriginal = opts.template.innerHTML;
        } else if(typeof opts.template === 'string') {
            this.templateOriginal = opts.template;
        } else if(typeof opts.template === 'function') {
            this.templateOriginal = opts.template();
        } else {
            throw new Error('Unsupported template type')
        }

        this.templateCopy = this.templateOriginal;
        this.prevTemplate = this.templateCopy;
        this.userRender = opts.render.bind(this);

        // this.dd = new DiffDOM();

        this.$el.innerHTML = this.templateCopy;

        this.wrapVars()

        // this.startObserver()
    }

    setRouter(router) {
        if(router && typeof router === 'object' && router instanceof Router) {
            this.$router = router;
        }
    }

    startObserver() {
        console.log('Starting To Observe...')

        const targetNode = this.$el;

        const observerOptions = {
            childList: true,
            attributes: true,
            subtree: true,
        }

        const observer = new MutationObserver((mutations) => {
            /*if (this.pauseMutationObserver) return;*/

            for (let i=0; i < mutations.length; i++){
                if (mutations[i].addedNodes.length > 0) {
                    mutations[i].addedNodes.forEach(node => {
                        // Discard non-element nodes/*if(node.parentElement.hasAttribute('xcomp')) {

                        if (node.nodeType !== 1) return

                        console.log('Found node: ', node, "\n\nParent: ", node.parentElement)
                        console.log('Mutuation: ', mutations[i])

                        /*if(node.parentElement.hasAttribute('xcomp')) {
                            this.initComp(node.parentElement, true)
                        }*/

                        // Discard any changes happening within an existing component.
                        // They will take care of themselves.
                        // if (node.parentElement && node.parentElement.closest('[xcomp]')) return

                        /*this.discoverUninitializedComponents((el) => {
                            this.initializeComponent(el)
                        }, node.parentElement)*/

                        // this.initComp(node.parentElement)
                    })
                }
            }
        })

        observer.observe(targetNode, observerOptions)
    }

    render() {

        log('-------------- CALLED RENDER --------------')

        // log("render() this: ", this);

        this.userRender();

        this.matchWrappedVars();

        log('HASH this.prevTemplate: ', this.prevTemplate)

        const prevHash = md5(this.prevTemplate);
        const currentHash = md5(this.templateCopy);

        // let diff = this.dd.diff(this.prevTemplate, this.templateCopy);

        // log('DiffDOM diff: ', diff)
        // log('DiffDOM result: ', result)

        log(`prevHash: ${prevHash}`);
        log(`currentHash: ${currentHash}`);

        if(this.count === 0) {
            this.$el.innerHTML = this.templateCopy;
            this.prevTemplate = this.templateCopy

            this.count++;

        }

        if(currentHash !== prevHash && this.count > 0) {
            log('HASH Templates DIFFER !')
            log('HASH this.templateCopy: ', this.templateCopy)

            this.$el.innerHTML = this.templateCopy;

            this.count++;
        } else {
            log('Templates ARE IDENTICAL !')
        }

        this.matchMethods();

    }

    getDomElement() {
        return this.$el
    }

    matchMethods() {
        // const reg = /\@[^\=]+={[^}]+\}/gi;

        // log("SJ.Component.matchMethod, this.templateCopy: ", this.templateCopy);

        // this.templateCopy = this.templateOriginal;

        const eventNodes = Helper.attrStartsWith('sj:', this.$el)

        log("Helper.attrStartsWith('sj:')", eventNodes);

        for(let i = 0; i < eventNodes.length; i++) {

            const node = eventNodes[i];

            /*if(node.el.hasAttribute('sj-cloak')) {
                continue;
            }*/

            AttributesDispatcher.dispatch(node, this)
        }

    }

    wrapVars() {
        const reg = /{{([^}]+)}}/gis;
        //var matches = [];

        // log("SJ.Component.matchVars, this.templateCopy: ", this.templateCopy);

        if(this.count === 0) {
            const $children = this.$el.querySelectorAll('*');

            for(let i = 0; i < $children.length; i++) {
                const $child = $children[i];

                // log('wrapVars $child: ', $child)
                // log('wrapVars $child.parentElement: ', $child.parentElement)

                if($child.hasAttribute('sj:for')) {
                    log('wrapVars $child has attribute "sj:for"', $child.tagName)
                    continue;
                } else if($child.parentElement && $child.parentElement.hasAttribute('sj:for')) {
                    log('wrapVars $child.parentElement has attribute "sj:for"', $child.tagName, $child.parentElement.tagName)

                    continue;
                }

                let lines = $child.innerHTML.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    var m = reg.exec(lines[i]);

                    if (m) {
                        const prop = m[1].replace(/\s*/g, '')

                        log("wrapVars Matched " + m[0] + ": ", m, "On Element $child: ", $child);

                        const childId = "sj-var-" + Helper.uuid4()

                        $child.innerHTML = $child.innerHTML.replace(m[0], `<div id="${childId}" style="display: inline;">${m[0]}</div>`);

                        if (this.wrappedVarsMap.has(prop)) {
                            this.wrappedVarsMap.get(prop).push(childId);
                        } else {
                            this.wrappedVarsMap.set(prop, [childId]);
                        }

                        log('wrapVars $child.innerHTML: ', $child.innerHTML);
                    }
                }

            }

            this.templateOriginal = this.$el.innerHTML;
        }

        this.templateCopy = this.templateOriginal;

        // this.matchVarsWithRegex();

        document.addEventListener('DOMContentLoaded', (event) => {
            console.log('DOM fully loaded and parsed');

            setTimeout(() =>{
                this.render()

                const cloakEl = this.$el.querySelector('[sj-cloak]');

                if(cloakEl && cloakEl.hasAttribute('sj-cloak')) {
                    cloakEl.removeAttribute('sj-cloak')
                }
            }, 1000)

        });

        this.listenToPropChanges();
    }

    listenToPropChanges() {
        document.addEventListener('component-prop-changed', (ev) => {
            console.log('component-prop-changed ev: ', ev.detail);
            const { prop, newValue, component } = ev.detail;

            if(component.wrappedVarsMap.has(prop)) {
                component.wrappedVarsMap.get(prop).forEach(id => {
                    log(`Setting ${prop} on ${id} to ${newValue}`);

                    const $child = component.$el.querySelector(`#${id}`);

                    if ($child) {
                        $child.innerHTML = newValue;
                    }
                })
            }
        })
    }

    matchWrappedVars() {

        // const reg = /{{([^}]+)}}/gi;
        //var matches = [];

        // log("SJ.Component.matchVars, this.templateCopy: ", this.templateCopy);

        this.templateCopy = this.templateOriginal;

        for (const [prop, childId] of this.wrappedVarsMap.entries()) {
            log(`Setting ${prop} on `, childId);

            childId.forEach(id => {
                const $child = this.$el.querySelector(`#${id}`);

                if($child) {
                    if(this.props.hasOwnProperty(prop)) {
                        const newValue = this.props[prop];
                        if($child.innerHTML !== newValue) {
                            log(`Setting ${prop} on ${childId} to ${newValue}`);

                            $child.innerHTML = this.props[prop];
                        } else {
                            log(`Same Value For ${prop} on ${childId} to ${newValue}`);
                        }
                    }
                }
            })
        }

    }

    matchVarsWithRegex() {
        const reg = /{{([^}]+)}}/gi;
        //var matches = [];

        // log("SJ.Component.matchVars, this.templateCopy: ", this.templateCopy);

        this.templateCopy = this.templateOriginal;

        do {
            var m = reg.exec(this.templateCopy);

            if(!m) {
                break;
            }

            const prop = m[1].replace(/\s*/g, '')

            log("Matched " + m[0] + ": ", m);

            console.log('this.props: ', this.props)

            if(!this.props.hasOwnProperty(prop)) {
                throw new Error("SJ.Component, cannot find: " + m[0]);
            }

            log(m[0] + " value: ", this.props[ prop ]);

            this.templateCopy = this.templateCopy.replace(m[0], this.props[ prop ]);

            log("SJ.Component.matchVars, this.templateCopy 2: ", this.templateCopy);

        } while(m);

    }
}
