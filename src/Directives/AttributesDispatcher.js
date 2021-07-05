import BrowserEventDispatcher from "./BrowserEventDispatcher";
import FormSubmit from "./FormSubmit";
import IfDirective from "./IfDirective";
import RenderIfDirective from "./RenderIfDirective";
import IfClassDirective from "./IfClassDirective";
import BindModel from "./BindModel";
import ForDirective from "./ForDirective";
import RefDirective from "./RefDirective";

import Helper from '../Helper';
import log from "../Log";

export default class AttributesDispatcher {
    static dispatch($node, $scope) {
        const $el = $node.el

        Helper.create___sj($el);

        if($el.hasAttribute('sj:skip')) {
            $el.removeAttribute('sj:skip');

            return;
        }

        $node.attrs.forEach( attr => {
            log('Found SJ Attr: ', attr)

            const trigger = attr.name.split(':')[1]
            const triggerArgs = attr.nodeValue

            log("Trigger: ", trigger);
            log("Trigger Args: ", triggerArgs);


            if (!trigger || !triggerArgs) {
                // debugger;
                throw new Error("Trigger: args or trigger empty");
            }

            // Dispatch
            switch (trigger) {
                case 'for': {
                    new ForDirective({event: trigger, args: triggerArgs}, $scope, $el);
                    break;
                }
                case 'if': {
                    new IfDirective({event: trigger, args: triggerArgs}, $scope, $el)
                    break;
                }
                case 'render-if': {
                    new RenderIfDirective({event: trigger, args: triggerArgs}, $scope, $el)
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
                case 'ref': {
                    new RefDirective({event: trigger, args: triggerArgs}, $scope, $el);
                    break;
                }
                case 'skip':
                case 'cloak': {
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
