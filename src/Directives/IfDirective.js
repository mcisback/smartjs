import SaferEval from "../SaferEval";

import log from "../Log";

export default class IfDirective {
    constructor({ event, args }, $scope, $el) {
        // debugger;

        log('Called IfDirective')
        log('$el.tagName: ', $el.tagName)
        log('IfDirective vars: ', { event, args }, $scope)

        const exprResult = SaferEval.exec(args, $scope.props);

        if($el.style.display !== 'none') {
            $el.___sj.prevDisplay = $el.style.display;
        }

        log('IfDirective $el.___sj.prevDisplay: ', $el.___sj.prevDisplay)

        if(exprResult) {
            if(!$el.___sj.prevDisplay) {
                $el.style.display = 'block';
            } else {
                $el.style.display = $el.___sj.prevDisplay;
            }
        } else {
            $el.style.display = 'none';
        }
    }
}