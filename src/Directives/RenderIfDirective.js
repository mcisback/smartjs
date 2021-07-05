import SaferEval from "../SaferEval";

import log from "../Log";

export default class RenderIfDirective {
    constructor({ event, args }, $scope, $el) {
        // debugger;

        log('Called RenderIfDirective')
        log('$el.tagName: ', $el.tagName)
        log('RenderIfDirective vars: ', { event, args }, $scope)

        if(!$el.___sj['original_template']) {
            $el.___sj['original_template'] = $el.innerHTML;
        }

        const exprResult = SaferEval.exec(args, $scope.props);

        /*if($el.style.display !== 'none') {
            $el.___sj.prevDisplay = $el.style.display;
        }*/

        // log('RenderIfDirective $el.___sj.prevDisplay: ', $el.___sj.prevDisplay)

        if(exprResult) {
            $el.innerHTML = $el.___sj['original_template'];

            // $scope.render();
        } else {
            $el.innerHTML = '';
        }
    }
}