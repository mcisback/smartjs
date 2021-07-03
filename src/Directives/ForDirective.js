import log from "../Log";

// https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path

export default class ForDirective {
    constructor({ event, args }, $scope, $el) {
        log('Called ForDirective')
        log('$el.tagName: ', $el.tagName)

        if($el.___sj['for_processed'] === true) {
            log('ForDirective already processed');

            return;
        }

        // const fieldsRegex = /\[\[([^\]]+)\]\]/gi;
        const fieldsRegex = /\{\{([^\}]+)\}\}/gi;

        const m = args.split(' ')

        if(m.length < 3) {
            throw new Error(`ForDirective Malformed For With Args: ${args}`)
        }

        log('ForDirective args: ', args, m)

        const prop = m[2];

        let html = $el.innerHTML;
        $el.innerHTML = "";

        log(`ForDirective Processing prop: `, prop)

        if(!$scope.props.hasOwnProperty(prop)) {
            console.error(`ForDirective prop ${prop} not in $scope.props`);

            return;
        }

        const items = $scope.props[prop];

        for(let i = 0; i < items.length; i++) {
            const item = items[i];

            let fHtml = html;

            log(`ForDirective Processing item: `, item)

            let fields = null;

            while (fields = fieldsRegex.exec(html)){
                log('ForDirective fields: ', fields);

                // if(fields !== null) {
                const field = fields[1].replace(/\s+/gi, '');
                const parts = field.split('.');

                // parts is like {{ item }}
                if(parts.length === 1) {
                    if(!parts[0].includes('$index')) {
                        fHtml = fHtml.replaceAll(fields[0], item)

                        log('ForDirective field: ', [field], 'Item: ', [item]);
                    } else {
                        log(`ForDirective field contains $index`)

                        let newHtml = field.replaceAll('$index', i)

                        log('ForDirective newHtml: ', newHtml, ' fields[0]: ', fields[0]);

                        const exprResult = (new Function(` return (${newHtml})`).bind($scope.props))();

                        fHtml = fHtml.replaceAll(fields[0], exprResult)

                        log('ForDirective field: ', [field], 'replacing with Index: ', i);
                        log('exprResult: ', exprResult);
                    }
                } else {
                    if(field.includes('$index')) {
                        log(`ForDirective field contains $index`)

                        let newHtml = field.replaceAll('$index', i)

                        log('ForDirective newHtml: ', newHtml, ' fields[0]: ', fields[0]);

                        const exprResult = (new Function(` return (${newHtml})`).bind($scope.props))();

                        fHtml = fHtml.replaceAll(fields[0], exprResult)

                        log('ForDirective field: ', [field], 'replacing with Index: ', i);
                        log('exprResult: ', exprResult);
                    } else {
                        const key = parts[1];

                        if (item.hasOwnProperty(key)) {
                            fHtml = fHtml.replaceAll(fields[0], item[key])
                        } else {
                            log(`ForDirective key: ${key} not in item`)
                        }

                        log('ForDirective field: ', [field], 'Key: ', [key]);
                    }
                }

                log('ForDirective html: ', fHtml);
            }

            $el.innerHTML += fHtml;
        }

        $el.___sj['for_processed'] = true;
    }
}