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
        // this.attrsVarMap = new Map();
        this.$refs = {};

        this.name = opts.name;
        this.methods = opts.methods;

        this.props = new PropsProxy(opts.props, this, this.render.bind(this));

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

        if(opts.init && typeof opts.init === 'function') {
            const init = opts.init.bind(this);

            init();
        }

        if(opts.mounted && typeof opts.mounted === 'function') {
            this.mounted = opts.mounted.bind(this);
        }
    }

    getName() {
        return this.name.toLowerCase();
    }

    isRenderable() {
        // log(`${this.name}: this.$el.parentNode: `, this.$el.parentNode)
        return typeof this.$el.parentNode === 'object' && (this.$el.parentNode instanceof HTMLElement || this.$el.parentNode instanceof ShadowRoot);
    }

    setRouter(router) {
        if(router && typeof router === 'object' && router instanceof Router) {
            this.$router = router;
        }
    }

    render(forceRendering=false) {

        if(!this.isRenderable() && !forceRendering) {
            log(`Component ${this.name} is not renderable, skipping render`)

            return;
        }

        log('-------------- CALLED RENDER --------------')

        this.userRender();

        this.renderWrappedVars();

        this.matchMethods();

        this.renderChildComponents();

    }

    getDomElement() {
        return this.$el
    }

    /*getHtml() {
        return this.$el.innerHTML;
    }*/

    hasMethod(methodName) {
        return this.methods && this.methods.hasOwnProperty(methodName);
    }

    matchMethods($el=null) {

        if(!$el) {
            $el = this.$el;
        }

        const eventNodes = Helper.attrStartsWith('sj:', $el)

        log("Helper.attrStartsWith('sj:')", eventNodes);

        for(let i = 0; i < eventNodes.length; i++) {

            const node = eventNodes[i];

            /*if(!node.el) {
                continue;
            }*/
            /*if(node.el && (node.el.parentNode && node.el.parentNode.hasAttribute('sj:for') || node.el.hasAttribute('sj:for'))) {
                debugger;
                log('matchMethods skipping: node.el.parentElement has attribute "sj:for"', node.el, node.el.parentElement)

                continue;
            }*/

            /*if(node.el && node.el.closest('[sj\\3A for]')) {
                continue;
            }*/

            // sj:skip is used to avoid conflicts in rendering togheter multiple attributes like sj:for and sj:if

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

        if($child.closest('[sj\\3A for]')) {
            return true;
        }

        if($child.hasAttribute('id') && $child.getAttribute('id').startsWith('sj-child-comp')) {
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

            const attributes = Array.from($child.attributes).map(item => {
                return { name: item.nodeName, value: item.nodeValue }
            });

            const wrapDiv = document.createElement("div");
            wrapDiv.setAttribute('id', "sj-child-comp-" + Helper.uuid4())

            wrapDiv.style.border = "0";
            wrapDiv.style.margin = "0";
            wrapDiv.style.padding = "0";

            const shadow = wrapDiv.attachShadow({mode: 'open'});
            shadow.appendChild(document.createElement("div"));

            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                // log(`shadow: `, shadow, newLink);

                shadow.appendChild(link.cloneNode(true));
            })

            log(`wrapVars $child['${tagName}'].parentElement: `, $child.parentElement)

            // insert wrapper before el in the DOM tree
            $child.parentElement.insertBefore(wrapDiv, $child);
            // move el into wrapper
            // shadow.appendChild(wrapDiv);
            // wrapDiv.appendChild($child);

            shadow.querySelector('div').appendChild($child);

            log(`wrapVars $child['${tagName}'] wrapDiv: `, wrapDiv)

            this.childComponentsMap.set(wrapDiv.id, { tagName, attributes })

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

        this.listenToEvents();
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

                /*document.addEventListener('for-finished-rendering', (ev) => {
                    console.log('for-finished-rendering ev: ', ev.detail);
                    const { id, component } = ev.detail;

                    component.render(true);
                })*/
            }, 500)

            if(this.mounted){
                log(`Running mounted()`);

                this.mounted();
            }
        });
    }

    mapAttributes($child) {
        const reg = /{{([^}]+)}}/gi;
        // Array.from($child.attributes).forEach(attr => log(`mapAttributes attr $child.attributes[]: `, attr))

        for(let i = 0; i < $child.attributes.length; i++) {
            const { name, value } = $child.attributes[i];

            if(value.match(reg)) {
                log(`mapAttributes attr $child.attributes[${i}]: `, { name, value, $child })

                $child.setAttribute('data-has-attr-var', true);

                Helper.create___sj($child);

                if(!$child.___sj.attrsVarMap) {
                    $child.___sj.attrsVarMap = [];
                }

                if(!$child.___sj.attrsVarMap.includes(name)) {
                    $child.___sj.attrsVarMap.push({
                        attrName: name,
                        template: value
                    });
                }
            }

            // log(`mapAttributes attr $child.attributes[${i}]: `, { name, value })
        }
    }

    mapVars($child) {
        const reg = /{{([^}]+)}}/gis;

        const lines = $child.innerHTML.split('\n');

        for (let i = 0; i < lines.length; i++) {
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
            }
        }
    }

    listenToEvents() {
        document.addEventListener('component-prop-changed', (ev) => {
            console.log('component-prop-changed ev: ', ev.detail);
            const { prop, newValue, component } = ev.detail;

            if(component.wrappedVarsMap.has(prop)) {
                component.wrappedVarsMap.get(prop).forEach(id => {
                    log(`listenToEvents Setting ${prop} on ${id} to ${newValue}`);

                    const $child = component.$el.querySelector(`#${id}`);

                    if ($child) {
                        $child.innerHTML = newValue;
                    }
                })
            }/* else {
                const fors = this.$el.querySelectorAll(`[sj\\3A for~="${prop}"]`);

                fors.forEach(forElement => {
                    if(forElement.___sj['for_processed'] === true) {
                        forElement.___sj['for_processed'] = false;
                    }
                })
            }*/
        })
    }

    renderChildComponents() {
        for(const [wrapDivId, childData] of this.childComponentsMap.entries()) {
            const { tagName: compName, attributes } = childData;

            log(`renderChildComponents rendering: ${compName}, id: ${wrapDivId}, attributes: `, attributes);

            var wrapDiv = document.getElementById(wrapDivId);

            if(!wrapDiv) {
                console.error(`renderChildComponents Cannot Find element div#${wrapDivId}, trying to create it`)

                continue;
            }

            const component = ComponentsRegister.getRegisteredComponent(compName);

            for(let i = 0; i < attributes.length; i++) {
                const { name, value } = attributes[i];

                let newValue = SaferEval.evaluateExpression(value, this);

                // newValue is object
                if(newValue === ({}.toString())) {
                    newValue = SaferEval.evaluateExpression(value, this, (expr, $scope, $eval) => {
                        return $eval.buildJson(expr, $scope.props);
                    })
                }

                log(`renderChildComponents Parsing attribute: ${name} => ${value} => `, newValue);

                component.addProp({ name, value: newValue })
            }

            component.render(true);

            wrapDiv.shadowRoot.querySelector('div').innerHTML = "";
            wrapDiv.shadowRoot.querySelector('div').appendChild(component.getDomElement())
        }
    }

    addProp({name, value}) {
        let parsedValue = Helper.getIfItIsJson(value);

        parsedValue = parsedValue === false ? value : parsedValue;

        this.props.addProp({name, value: parsedValue})
    }

    /*addProps(props) {
        props.forEach(({name, value}) => {
            this.addProp({name, value});
        })
    }*/

    renderMappedAttributes() {
        const reg = /{{([^}]+)}}/gi;

        this.$el.querySelectorAll('[data-has-attr-var]').forEach(node => {
            for(let i = 0; i < node.___sj.attrsVarMap.length; i++) {
                const { attrName, template } = node.___sj.attrsVarMap[i];

                let attrValue = node.getAttribute(attrName);

                log(`renderMappedAttributes found `, { attrName, attrValue, template })

                var fields = null;

                while(fields = reg.exec(template)) {
                    const expr = fields[1].replace(/\s*/gi, '');

                    log(`renderMappedAttributes matched `, { fields, expr });

                    // const exprResult = SaferEval.exec(expr, this.props.props);
                    // log(`renderMappedAttributes this: `, this);

                    const exprResult = SaferEval.exec(expr, this.props);

                    /*try {
                        var exprResult = SaferEval.exec(expr, this.props.props);
                    } catch (e) {
                        console.error(`renderMappedAttributes SaferEval error: `, e);
                    }*/

                    attrValue = template.replace(fields[0], exprResult);

                    node.setAttribute(attrName, attrValue);
                }
            }
        })
    }

    renderWrappedVars() {

        // this.templateCopy = this.templateOriginal;

        for (const [prop, childId] of this.wrappedVarsMap.entries()) {
            log(`renderWrappedVars Setting ${prop} on `, childId);

            childId.forEach(id => {
                const $child = this.$el.querySelector(`#${id}`);

                log(`renderWrappedVars Element: `, $child, $child.parentElement);

                if($child) {
                    // if(this.props.hasOwnProperty(prop)) {
                    //     const newValue = this.props[prop];

                        // const newValue = (new Function(` with(this){ return ${prop} }`).bind(this.props.props))();
                        try {
                            var newValue = SaferEval.exec(prop, this.props);
                        } catch (e) {
                            console.error(`renderWrappedVars SaferEval error: `, e);
                        }

                        // const expr = eval(prop);

                        log(`renderWrappedVars expr: `, newValue);

                        if($child.innerHTML !== newValue) {
                            log(`renderWrappedVars Setting ${prop} on ${childId} to ${newValue}`);

                            $child.innerHTML = newValue;
                        } else {
                            log(`Same Value For ${prop} on ${childId} to ${newValue}`);
                        }
                    // }
                }
            })
        }

        this.renderMappedAttributes();

    }
}
