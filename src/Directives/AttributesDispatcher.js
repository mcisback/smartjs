import BrowserEventDispatcher from "./BrowserEventDispatcher";
import FormSubmit from "./FormSubmit";
import IfDirective from "./IfDirective";

import log from "../Log";
import IfClassDirective from "./IfClassDirective";
import BindModel from "./BindModel";

import Helper from '../Helper';

export default class AttributesDispatcher {
    static dispatch($node, $scope) {
        const $el = $node.el

        if(!$el.___sj) {
            $el.___sj = {
                id: Helper.uuid4()
            }
        }

        $node.attrs.forEach( attr => {
            log('Found SJ Attr: ', attr)

            const trigger = attr.name.split(':')[1]
            const triggerArgs = attr.nodeValue

            log("Trigger: ", trigger);
            log("Trigger Args: ", triggerArgs);


            if (!trigger || !triggerArgs) {
                throw new Error("Trigger: args or trigger empty");
            }

            // Dispatch
            switch (trigger) {
                case 'if': {
                    new IfDirective({event: trigger, args: triggerArgs}, $scope, $el)
                    break;
                }
                case 'if-class': {
                    new IfClassDirective({event: trigger, args: triggerArgs}, $scope, $el);
                    break;
                }
                case 'bind':
                case 'model': {
                    new BindModel({event: trigger, args: triggerArgs}, $scope, $el);
                    break;
                }
                case 'submit': {
                    new FormSubmit({event: trigger, args: triggerArgs}, $scope, $el);
                    break;
                }
                case 'for': {
                    console.error(`Directive ${trigger} Unimplemented`)
                    break;
                }
                default: {
                    new BrowserEventDispatcher({event: trigger, methodName: triggerArgs}, $scope, $el)
                }
            }
        })
    }
}
