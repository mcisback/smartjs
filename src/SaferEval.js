export default class SaferEval {
    static exec(expr, bindObject=null) {
        // let f = null;

        return (new Function(` with(this){ return ${expr} }`).bind(bindObject))();
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
}