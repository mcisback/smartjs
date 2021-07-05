import log from "./Log";
import Helper from "./Helper";

export default class SaferEval {
    static exec(expr, bindObject=null) {
        // let f = null;

        return (new Function(` with(this){ return (${expr}) }`).bind(bindObject))();
        //
        // if(bindObject !== null) {
        //     f = new Function(`with(this){ return (${expr}); }`);
        //     f.bind(bindObject);
        // } else {
        //     f = new Function(` return (${expr});`);
        // }
        //
        // return f();
    }

    static build(expr, bindObject=null) {
        return (new Function(` with(this){ return (${expr}) }`).bind(bindObject))
    }

    static buildJson(expr, bindObject=null) {
        return (new Function(` with(this){ return JSON.stringify(${expr}) }`).bind(bindObject))
    }

    static evaluateExpression(str, $scope, callback=null) {
        const reg = /{{([^}]+)}}/gi;

        const lines = str.split('\n');

        for (let i = 0; i < lines.length; i++) {
            var m = null

            while ( m = reg.exec(lines[i]) ) {
                const expr = m[1].trim()

                log("evaluateExpression Matched " + m[0] + ": ", m, "On Element str: ", str);

                var exprResult = null;

                if(!callback) {
                    exprResult = this.exec(expr, $scope.props);
                } else {
                    exprResult = callback(expr, $scope, this);
                }

                str = str.replace(m[0], exprResult);
            }
        }

        return str;
    }
}