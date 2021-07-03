import ComponentsRegister from "./ComponentsRegister";
import PropsProxy from "./PropsProxy";
import AttributesDispatcher from "./Directives/AttributesDispatcher";
import Router from "./Router";
import SaferEval from "./SaferEval";

import Helper from "./Helper";

import log from "./Log";

export default class Component {

    constructor(opts) {

        if (!Helper.isSet(opts)) {
            throw new Error("SJ.Component: Root Element is required for SmartJS Framework to work");
        } else if (!Helper.isObject(opts)) {
            throw new Error("SJ.Component: opts must be an object")
        }

        this.$el = document.createElement("div");
        this.id = "sj-comp-" + Helper.uuid4()

        this.$el.setAttribute("id", this.id);
        this.$el.style.border = "0";
        this.$el.style.margin = "0";
        this.$el.style.padding = "0";

        this.wrappedVarsMap = new Map();
        this.childComponentsMap = new Map();

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

        ComponentsRegister.registerComponent(this);

        this.$el.innerHTML = this.templateOriginal;

        // this.templateCopy = this.templateOriginal;
        // this.prevTemplate = this.templateCopy;
        this.userRender = opts.render.bind(this);

        // this.dd = new DiffDOM();

        // this.$el.innerHTML = this.templateCopy;

        this.childComponents = opts.childComponents || [];

        ComponentsRegister.registerComponentsFromArray(this.childComponents)

        this.wrapVars()

        // this.startObserver()
    }

    getName() {
        return this.name.toLowerCase();
    }

    isRenderable() {
        log(`${this.name}: this.$el.parentElement: `, this.$el.parentElement)
        return typeof this.$el.parentElement === 'object' && this.$el.parentElement instanceof HTMLElement;
    }

    setRouter(router) {
        if(router && typeof router === 'object' && router instanceof Router) {
            this.$router = router;
        }
    }


    /*startObserver() {
        console.log('Starting To Observe...')

        const targetNode = this.$el;

        const observerOptions = {
            childList: true,
            attributes: true,
            subtree: true,
        }

        const observer = new MutationObserver((mutations) => {
            /!*if (this.pauseMutationObserver) return;*!/

            for (let i=0; i < mutations.length; i++){
                if (mutations[i].addedNodes.length > 0) {
                    mutations[i].addedNodes.forEach(node => {
                        // Discard non-element nodes/!*if(node.parentElement.hasAttribute('xcomp')) {

                        if (node.nodeType !== 1) return

                        console.log('Found node: ', node, "\n\nParent: ", node.parentElement)
                        console.log('Mutuation: ', mutations[i])

                        /!*if(node.parentElement.hasAttribute('xcomp')) {
                            this.initComp(node.parentElement, true)
                        }*!/

                        // Discard any changes happening within an existing component.
                        // They will take care of themselves.
                        // if (node.parentElement && node.parentElement.closest('[xcomp]')) return

                        /!*this.discoverUninitializedComponents((el) => {
                            this.initializeComponent(el)
                        }, node.parentElement)*!/

                        // this.initComp(node.parentElement)
                    })
                }
            }
        })

        observer.observe(targetNode, observerOptions)
    }
*/

    render(forceRendering=false) {

        if(!this.isRenderable() && !forceRendering) {
            log(`Component ${this.name} is not renderable, skipping render`)

            return;
        }

        log('-------------- CALLED RENDER --------------')

        this.userRender();

        this.matchWrappedVars();

        this.matchMethods();

        this.renderChildComponents();

    }

    getDomElement() {
        return this.$el
    }

    getHtml() {
        return this.$el.innerHTML;
    }

    matchMethods() {

        const eventNodes = Helper.attrStartsWith('sj:', this.$el)

        log("Helper.attrStartsWith('sj:')", eventNodes);

        for(let i = 0; i < eventNodes.length; i++) {

            const node = eventNodes[i];

            AttributesDispatcher.dispatch(node, this)
        }

    }

    isSkippableElement($child) {
        if($child.hasAttribute('sj:for')) {
            log('wrapVars $child has attribute "sj:for"', $child.tagName)

            return true;
        } else if($child.parentElement && $child.parentElement.hasAttribute('sj:for')) {
            log('wrapVars $child.parentElement has attribute "sj:for"', $child.tagName, $child.parentElement.tagName)

            return true;
        }

        if($child.children.length > 0) {
            return true;
        }
    }

    processInvalidHTMLElements($child) {
        const tagName = $child.tagName.toLowerCase();

        console.error(`${tagName} is not a valid HTML Element`);

        if(ComponentsRegister.isComponentRegistered(tagName)) {
            log(`${tagName} can be linked to component ${tagName}`);

            const wrapDiv = document.createElement("div");
            wrapDiv.setAttribute('id', "sj-child-comp-" + Helper.uuid4())

            wrapDiv.style.border = "0";
            wrapDiv.style.margin = "0";
            wrapDiv.style.padding = "0";

            log(`wrapVars $child['${tagName}'].parentElement: `, $child.parentElement)

            // insert wrapper before el in the DOM tree
            $child.parentElement.insertBefore(wrapDiv, $child);
            // move el into wrapper
            wrapDiv.appendChild($child);

            log(`wrapVars $child['${tagName}'] wrapDiv: `, wrapDiv)

            this.childComponentsMap.set(wrapDiv.id, tagName)

        } else {
            log(`${tagName}: cannot find component ${tagName}`);
        }
    }

    wrapVars() {

        if(this.count === 0) {
            const $children = this.$el.querySelectorAll('*');

            for(let i = 0; i < $children.length; i++) {
                const $child = $children[i];

                // Check for child components
                if(!Helper.isValidHTMLElement($child)) {

                    this.processInvalidHTMLElements($child);

                    continue;
                }

                if(this.isSkippableElement($child)) {
                    continue;
                }

                this.mapAttributes($child);

                this.mapVars($child);

            }

            // this.templateOriginal = this.$el.innerHTML;
        }

        // this.templateCopy = this.templateOriginal;

        this.removeSjCloak();

        this.listenToPropChanges();
    }

    removeSjCloak() {
        document.addEventListener('DOMContentLoaded', (event) => {
            console.log('DOM fully loaded and parsed');

            setTimeout(() =>{
                this.render()

                const cloakEl = this.$el.querySelector('[sj-cloak]');

                if(cloakEl && cloakEl.hasAttribute('sj-cloak')) {
                    cloakEl.removeAttribute('sj-cloak')
                }
            }, 500)

        });
    }

    mapAttributes($child) {
        for(let i = 0; i < Array.from($child.attributes); i++) {
            const attr = $child.attributes[i];

            log(`wrapVars attr $child.attributes[${i}]: `, attr)
        }
    }

    mapVars($child) {
        const reg = /{{([^}]+)}}/gis;

        const lines = $child.innerHTML.split('\n');

        for (let i = 0; i < lines.length; i++) {
            // var m = reg.exec(lines[i]);
            var m = null

            while ( m = reg.exec(lines[i]) ) {
                const prop = m[1].replace(/\s*/g, '')

                log("wrapVars Matched " + m[0] + ": ", m, "On Element $child: ", $child);

                const childId = "sj-var-" + Helper.uuid4()

                $child.innerHTML = $child.innerHTML.replace(m[0], `<div id="${childId}" style="display: inline;">${m[0]}</div>`);

                if (this.wrappedVarsMap.has(prop)) {
                    this.wrappedVarsMap.get(prop).push(childId);
                } else {
                    this.wrappedVarsMap.set(prop, [childId]);
                }

                // log('wrapVars $child.innerHTML: ', $child.innerHTML);
            }
        }
    }

    listenToPropChanges() {
        document.addEventListener('component-prop-changed', (ev) => {
            console.log('component-prop-changed ev: ', ev.detail);
            const { prop, newValue, component } = ev.detail;

            if(component.wrappedVarsMap.has(prop)) {
                component.wrappedVarsMap.get(prop).forEach(id => {
                    log(`listenToPropChanges Setting ${prop} on ${id} to ${newValue}`);

                    const $child = component.$el.querySelector(`#${id}`);

                    if ($child) {
                        $child.innerHTML = newValue;
                    }
                })
            }
        })
    }

    renderChildComponents() {
        for(const [wrapDivId, compName] of this.childComponentsMap.entries()) {
            log(`renderChildComponents rendering: ${compName}, id: ${wrapDivId}`)

            var wrapDiv = document.getElementById(wrapDivId);

            if(!wrapDiv) {
                console.error(`renderChildComponents Cannot Find element div#${wrapDivId}, trying to create it`)

                continue;
/*
                wrapDiv = document.createElement("div");
                wrapDiv.setAttribute('id', wrapDivId)

                wrapDiv.style.border = "0";
                wrapDiv.style.margin = "0";
                wrapDiv.style.padding = "0";

                const $child = this.$el.querySelector(compName);

                if(!$child) {
                    console.error(`renderChildComponents Cannot Find <${compName}>, cannot render it`)

                    return;
                }

                if(!$child.parentElement) {
                    console.error(`renderChildComponents <${compName}> has not parent element, cannot render it`)

                    return;
                }
                // insert wrapper before el in the DOM tree
                $child.parentElement.insertBefore(wrapDiv, $child);
                // move el into wrapper
                wrapDiv.appendChild($child);*/
            }

            const component = ComponentsRegister.getRegisteredComponent(compName);

            component.render(true);

            wrapDiv.innerHTML = "";
            wrapDiv.appendChild(component.getDomElement())
        }
    }

    matchWrappedVars() {

        // this.templateCopy = this.templateOriginal;

        for (const [prop, childId] of this.wrappedVarsMap.entries()) {
            log(`matchWrappedVars Setting ${prop} on `, childId);

            childId.forEach(id => {
                const $child = this.$el.querySelector(`#${id}`);

                log(`matchWrappedVars Element: `, $child, $child.parentElement);

                if($child) {
                    // if(this.props.hasOwnProperty(prop)) {
                    //     const newValue = this.props[prop];

                        // const newValue = (new Function(` with(this){ return ${prop} }`).bind(this.props.props))();
                        try {
                            var newValue = SaferEval.exec(prop, this.props.props);
                        } catch (e) {
                            console.error(`SaferEval error: `, e);
                        }

                        // const expr = eval(prop);

                        log(`matchWrappedVars expr: `, newValue);

                        if($child.innerHTML !== newValue) {
                            log(`matchWrappedVars Setting ${prop} on ${childId} to ${newValue}`);

                            $child.innerHTML = newValue;
                        } else {
                            log(`Same Value For ${prop} on ${childId} to ${newValue}`);
                        }
                    // }
                }
            })
        }

    }
}
