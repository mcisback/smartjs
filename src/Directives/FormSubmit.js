import log from "../Log";
import BrowserEventDispatcher from "./BrowserEventDispatcher";

export default class FormSubmit {
    constructor({ event, args }, $scope, $el) {
        log('Called FormSubmit')
        log('$el.tagName: ', $el.tagName)

        if($el.tagName.toLowerCase() !== 'form') {
            throw new Error('FormSubmit: element is not a form')
        }

        return new BrowserEventDispatcher({ event, methodName: args }, $scope, $el, true)
    }
}