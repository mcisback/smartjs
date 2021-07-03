import SaferEval from "../SaferEval";

import log from "../Log";

export default class IfDirective {
    constructor({ event, args }, $scope, $el) {
        log('Called IfDirective')
        log('$el.tagName: ', $el.tagName)
        log('IfDirective vars: ', { event, args }, $scope)

        const exprResult = SaferEval.exec(args, $scope.props);

        if(exprResult) {
            $el.style.display = 'block';
        } else {
            $el.style.display = 'none';
        }
    }
}