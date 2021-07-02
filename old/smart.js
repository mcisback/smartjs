
// var d$ = document;

var SJ = {}

SJ.debug = true;

SJ.log = function(s,o="") {
	if (SJ.debug === true) {
		console.log(s,o);
	}
}

SJ.Helper = class {
	
	static isPrimitive(o){return typeof o!=='object'||null}
	static isObject(o){return !this.isPrimitive(o)}
	static isNotSet(o) { return !o || o === undefined || o === false || o === null}
	static isSet(o) {return !this.isNotSet(o)}
	static uuid4() {
		const ho = (n, p) => n.toString(16).padStart(p, 0); /// Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
		const view = new DataView(new ArrayBuffer(16)); /// Create a view backed by a 16-byte buffer
		crypto.getRandomValues(new Uint8Array(view.buffer)); /// Fill the buffer with random data
		view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40); /// Patch the 6th byte to reflect a version 4 UUID
		view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80); /// Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
		return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`; /// Compile the canonical textual form from the array data
	}

}

SJ.App = class {
	
	constructor(bootstrapObject) {
		
		if (!SJ.Helper.isSet(bootstrapObject)) {
			throw new Error("SJ.App: Root Element is required for SmartJS Framework to work");
		} else if (!SJ.Helper.isObject(bootstrapObject)) {
			throw new Error("SJ.App: bootstrapObject must be an object")
		}
		  
		this.$el = document.getElementById(bootstrapObject.rootElement);
		this.$router = bootstrapObject.router;

		window.onpopstate = () => {
			SJ.log("window.onpopstate, window.location.pathname:", window.location.pathname);

			SJ.log("window.onpopstate, this.$router.popPath: ", this.$router.popPath());
			
			this.setContentFromPath(window.location.pathname);
		}

		let self = this;

		window.onload = function(e) {
			SJ.log("SJ.App window.onload fired: ", e);

			self.setContentFromPath(window.location.pathname)
		}

	}

	setContentFromPath(pathname) {
		SJ.log("SJ.App setContentFromPath fired, pathname: ", pathname);

		this.$router.pushPath(pathname);
		// this.$el.innerHTML = this.$router.get(pathname).template;

		let component = this.$router.getComponent(pathname);

		component.render();

		this.$el.innerHTML = "";
		this.$el.appendChild(component.$el);
	}

}

SJ.Router = class {
	
	constructor(routes){
		SJ.log("routes:", routes);

		if (!SJ.Helper.isObject(routes) || !SJ.Helper.isSet(routes)) {
			throw new Error("SJ.Router: Routes Definitions must be an object and not empty or false")
		}
		
		this.routes = routes;

		this.history = []

  	}

	getPathnameFromWindow() {
		let pathname = window.location.pathname;

		return this.filterPathname(pathname);
	}

	filterPathname(pathname) {
		if(pathname == "/") {
			pathname = "index";
		}

		return pathname;
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
		let r = this.get(pathname);
		return r.template;
	}

	getComponent(pathname) {
		let r = this.get(pathname);
		return r.component;
	}

	pushPath(pathname) {
		this.history.push(pathname);

		SJ.log("SJ.Router.pushPath, history: ", this.history);

		return this.historyPush(pathname);
	}

	popPath() {
		let path = this.history.pop();

		SJ.log("SJ.Router.pushPath, history: ", this.history);
		
		return path;
	}
	
}

SJ.Props = class Props {
	constructor(props) {
		this.props = props;
	}
}

SJ.Component = class {

	constructor(bootstrapObject) {
		if (!SJ.Helper.isSet(bootstrapObject)) {
			throw new Error("SJ.Component: Root Element is required for SmartJS Framework to work");
		} else if (!SJ.Helper.isObject(bootstrapObject)) {
			throw new Error("SJ.Component: bootstrapObject must be an object")
		}
		  
		this.$el = document.createElement("div");
		this.id = "sj-div-" + SJ.Helper.uuid4()
		this.$el.setAttribute("id", this.id);
		this.$el.style.border = "0";
		this.$el.style.margin = "0";
		this.$el.style.padding = "0";

		this.name = bootstrapObject.name;
		this._props = bootstrapObject.props;
		this.methods = bootstrapObject.methods;
		this.template = bootstrapObject.template;
		this.templateCopy = bootstrapObject.template;
		this.userRender = bootstrapObject.render.bind(this);

		//this.userRender = this._userRender.bind(this);

		this.props = new SJ.Props({});

		this.isInit = true;

		for(let p in this._props) {
			
			SJ.log(this.name + ", this.props: ", p);

			Object.defineProperty(this.props, p, {
				// value: this._props[p],
				// writable: true,
				get: () => {
					return this.props.props[p];
				},
				set: (v) => {

					let hasChanged = false;

					if(this.props.props[p]) {
						if (this.props.props[p] != v) {
							hasChanged = true;
						}
					}

					this.props.props[p] = v;

					if(!this.isInit && hasChanged) {
						this.onPropChanged(p, "pischello");
					}
				}
			});

			this.props[p] = this._props[p];

			delete this._props[p];

		}

		delete this._props;

		this.isInit = false;

		// this.render();

		this.$el.innerHTML = this.templateCopy;

	}

	onPropChanged(p, v) {
		SJ.log("SJ.Component.onPropChanged: ", p, v);

		this.render();
	}

	render() {

		SJ.log("render() this: ", this);

		this.userRender();

		this.matchVars();

		this.$el.innerHTML = this.templateCopy;

		this.matchMethods();

	}

	matchMethods() {
		var reg = /\@[^\=]+=\{[^\}]+\}/gi;
		
		SJ.log("SJ.Component.matchMethod, this.templateCopy: ", this.templateCopy);

		this.templateCopy = this.template;

		/*
		do {
			var m = reg.exec(this.templateCopy);

			if(!m) {
				break;
			}

			SJ.log("Matched Method: ", m);

			let x = m[0].split('=');

			let trigger = 'on' + x[0].replace('@', '');

			SJ.log("Method Trigger: ", trigger);

			let w = x[1].replace('{', '').replace('}', '');

			let z = w.split(',');

			let triggerID = z[0];
			let method = z[1];

			SJ.log("Method Trigger ID: ", triggerID);

			if(!triggerID) {
				throw new Error("Method Trigger ID empty");
			}

			SJ.log("Method Method: ", method);

			if(SJ.Helper.isNotSet(this.methods[method])) {
				throw new Error("SJ.Component, cannot find method: " + method);
			}

		} while(m);
		*/

		let eventNodes = this.$el.querySelectorAll("[sj-event]");

		SJ.log("document.querySelectorAll(\"[sj-event]\")", eventNodes);

		for(let i = 0; i < eventNodes.length; i++) {
			
			var n = eventNodes[i];

			SJ.log(n);

			let attr = n.getAttribute('sj-event');

			SJ.log("Method Attr: ", attr);

			let x = attr.replace('{', '').replace('}', '').split(',');

			let trigger = x[0].replace(' ', '');
			let methodName = x[1].replace(' ', '');

			SJ.log("Method Trigger: ", trigger);
			SJ.log("Method Method: ", methodName);

			if (!trigger || !methodName) {
				throw new Error("Method: method or trigger empty");
			}

			let method = this.methods[methodName];

			if(!method) {
				throw new Error("Method, cannot find method: " + methodName);
			}

			SJ.log("--- addEventListener ---");
			console.log(n);

			let eventHandler = (function(comp,method) {

				return function (e) {
					SJ.log("Called eventHandler ! Calling object: ", e.target);
					let m = method.bind(comp);
					m(e);
				}

			})(this, method);

			if (document.addEventListener) {              // For all major browsers, except IE 8 and earlier
				SJ.log("addEventListener is on");
				//console.log(n);
				n.addEventListener(trigger, eventHandler);
			} else if (document.attachEvent) {              // For IE 8 and earlier versions
				SJ.log("attachEvent is on");
				n.attachEvent('on' + trigger, eventHandler);
			}

			

			// n.addEventListener(trigger, );

		}

	}

	matchVars() {
		var reg = /\{\{([^\}]+)\}\}/gi;
		//var matches = [];

		SJ.log("SJ.Component.matchVars, this.templateCopy: ", this.templateCopy);

		this.templateCopy = this.template;

		do {
			var m = reg.exec(this.templateCopy);

			if(!m) {
				break;
			}

			SJ.log("Matched " + m[0] + ": ", m);

			if(SJ.Helper.isNotSet(this.props[m[1]])) {
				throw new Error("SJ.Component, cannot find: " + m[0]);
			}

			SJ.log(m[0] + " value: ", this.props[m[1]]);

			this.templateCopy = this.templateCopy.replace(m[0], this.props[m[1]]);

			SJ.log("SJ.Component.matchVars, this.templateCopy 2: ", this.templateCopy);

		}while(m);
	}
}


