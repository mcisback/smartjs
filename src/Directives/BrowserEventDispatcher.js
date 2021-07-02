import log from "../Log";
import Helper from "../Helper";

import BrowserEvent from "../BrowserEvent";

export default class BrowserEventDispatcher {
    constructor({ event, methodName }, $scope, $el, preventDefault=false) {

        log('$scope.methods: ', $scope.methods)

        const method = $scope.methods[methodName];

        if(!method) {
            throw new Error("BrowserEventDispatcher: Method, cannot find method: " + methodName);
        }

        if(Helper.isArrowFn(method)) {
            log(`${methodName} is an arrow function !`)
        }

        log("--- addEventListener ---");
        log(`${event} -> ${methodName}`)

        const eventHandler = (function(comp, method) {

            if(typeof method !== 'function') {
                throw new Error('SJ.BrowserEventDispatcher: eventHandler method is not a function')
            }

            return function (e) {
                log("Called eventHandler ! Calling object: ", e.target);

                if(preventDefault === true) {
                    log('Preventing default for: ', $el.tagName)

                    e.preventDefault()
                }

                let m = method;

                if(Helper.isArrowFn(method)) {

                    m = function(e) {
                        console.log('context: ', comp)

                        const arrowFn = eval(method.toString());
                        return arrowFn(e);
                    }.bind(comp)

                } else {
                    m = m.bind(comp);
                }

                return m(e);
            }

        })($scope, method);

        BrowserEvent.attachEvent($el, event, eventHandler, methodName);
    }
}