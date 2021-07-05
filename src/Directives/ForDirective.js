import SaferEval from "../SaferEval";
import BrowserEvent from "../BrowserEvent";

import Helper from "../Helper";
import log from "../Log";

// https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path

export default class ForDirective {
    constructor({ event, args }, $scope, $el) {
        /*if(window.for_debug === true) {
            debugger;
        }*/

        log('Called ForDirective')
        log('$el.tagName: ', $el.tagName)

        if(!$el.hasAttribute('id')) {
            $el.setAttribute('id', 'sj-for-' + Helper.uuid4());
        }

        if(!$el.___sj.hasOwnProperty('for_locked')) {
            $el.___sj['original_template'] = $el.innerHTML;
        }

        if($el.___sj['for_locked'] === false) {
            $el.innerHTML = $el.___sj['original_template'];
        }

        // const fieldsRegex = /\[\[([^\]]+)\]\]/gi;
        const fieldsRegex = /\{\{([^\}]+)\}\}/gi;

        const m = args.split(' ')

        if(m.length < 3) {
            throw new Error(`ForDirective Malformed For With Args: ${args}`)
        }

        const forVar = m[0];
        const prop = m[2];

        /*if(prop === 'coords') {
            debugger;
        }*/

        log(`ForDirective Processing forVar, prop: `, forVar, prop)

        if(!$scope.props.hasOwnProperty(prop)) {
            console.error(`ForDirective prop ${prop} not in $scope.props`);

            return;
        }

        log('ForDirective args: ', args, 'Matched: ', m, '$scope.props[prop]: ', $scope.props[prop]);

        /*if($scope.props[prop].length >= 10) {
            debugger;
        }*/

        if(!$el.___sj.hasOwnProperty('for_locked')) {
            $el.___sj['original_template_data'] = {
                prop: prop,
                data: Helper.cloneArray($scope.props[prop])
            };
        }

        const items = $scope.props[prop];

        if($el.___sj['for_locked'] === true) {
            log('ForDirective already processed');

            const { data: oldData, prop: oldProp } = $el.___sj['original_template_data'];

            if(oldProp !== prop) {
                log(`ForDirective ${oldProp} !== ${prop}`);
                return;
            }

            // let dataDiff = oldData.filter(x => !items.includes(x));
            // let dataDiff2 = items.filter(x => !oldData.includes(x));

            /*if(!$scope.props[prop] || !$scope.props[prop].hasOwnProperty('length')) {
                return;
            }

            if($scope.props[prop].length > 0) {
                return;
            }*/

            let dataDiff = Helper.diffArray(items, oldData);

            log('ForDirective already processed? oldData, newData: ', { oldData, newData: items, dataDiff/*, dataDiff2*/ });

            // Should be better to do a diff
            if(dataDiff.length === 0/* && dataDiff2.length === 0*/) {
                log('ForDirective already processed, same data length, skipping...');
                return;
            } else {
                log('ForDirective already processed, different data length, rendering...');

                $el.innerHTML = $el.___sj['original_template'];

                $el.___sj['original_template_data'] = {
                    prop: prop,
                    data: Helper.cloneArray(items)
                };
            }
        }

        let html = $el.innerHTML;
        $el.innerHTML = "";

        for(let i = 0; i < items.length; i++) {
            const item = items[i];

            /*if(i === 9) {
                debugger;
            }*/

            let fHtml = html;

            log(`ForDirective Processing item: `, item)

            let fields = null;

            while (fields = fieldsRegex.exec(html)){
                log('ForDirective fields: ', fields);

                const field = fields[1]
                    .replaceAll(forVar, `${prop}[$index]`)
                    .trim()
                ;
                // if(fields !== null) {
                const parts = field.split('.');

                // parts is like {{ item }}
                if(parts.length === 1) {
                    if(!parts[0].includes('$index')) {
                        log('ForDirective field: ', [field], 'Item: ', [item]);

                        if(typeof item === 'object') {
                            log('ForDirective field item is object, trying to get it from $scope');

                            const exprResult = SaferEval.exec(field, $scope.props);

                            fHtml = fHtml.replaceAll(fields[0], exprResult);
                        } else {
                            fHtml = fHtml.replaceAll(fields[0], item);
                        }
                    } else {
                        log(`ForDirective field contains $index`)

                        let newHtml = field.replaceAll('$index', i)

                        log('ForDirective newHtml: ', newHtml, ' fields[0]: ', fields[0]);

                        const exprResult = SaferEval.exec(newHtml, $scope.props);

                        fHtml = fHtml.replaceAll(fields[0], exprResult)

                        log('ForDirective field: ', [field], 'replacing with Index: ', i);
                        log('exprResult: ', exprResult);
                    }
                } else {
                    if(field.includes('$index')) {
                        log(`ForDirective field contains $index`)

                        let newHtml = field.replaceAll('$index', i)

                        log('ForDirective newHtml: ', newHtml, ' fields[0]: ', fields[0]);

                        const exprResult = SaferEval.exec(newHtml, $scope.props);

                        fHtml = fHtml.replaceAll(fields[0], exprResult)

                        log('ForDirective field: ', [field], 'replacing with Index: ', i);
                        log('exprResult: ', exprResult);
                    }/* else {
                        if(parts[0] === forVar) {
                            const key = parts[1];

                            if (item.hasOwnProperty(key)) {
                                fHtml = fHtml.replaceAll(fields[0], item[key])
                            } else {
                                log(`ForDirective key: ${key} not in item`)
                            }

                            log('ForDirective field: ', [field], 'Key: ', [key]);
                        } // else {}
                    }*/
                }

                log('ForDirective html: ', fHtml);
            }

            $el.innerHTML += fHtml;
        }

        $el.___sj['for_locked'] = true;

        /*BrowserEvent.dispatchCustomEvent(document, 'for-finished-rendering', {
            id: $el.getAttribute('id'),
            component: $scope
        });*/
    }
}