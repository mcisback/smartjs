import SaferEval from "../SaferEval";

import log from "../Log";

export default class RefDirective {
    constructor({ event, args }, $scope, $el) {
        log('Called RefDirective')
        log('$el.tagName: ', $el.tagName)
        log('RefDirective vars: ', { event, args }, $scope)

        if(!$scope.$refs.hasOwnProperty(args)) {
            log(`RefDirective setting $scope.$refs["${args}"] to `, $el);

            $scope.$refs[args] = $el;
        }
    }
}