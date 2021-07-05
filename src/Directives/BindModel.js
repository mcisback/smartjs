import log from "../Log";

import BrowserEvent from "../BrowserEvent";

export default class BindModel {
    constructor({ event, args }, $scope, $el) {
        log('Called BindModel')
        log('$el.tag: ', $el.tagName)

        this.typeDelay = 200;

        const tag = $el.tagName.toLowerCase();

        if (tag !== 'input'
            && tag !== 'select'
            && tag !== 'textarea') {
            throw new Error(`Unsupported tag: ${tag} for BindModel, supported tags are: input,select,textarea,checkbox,radio`);
        }

        if(tag === 'input') {
            const type = $el.getAttribute('type');

            if(type === 'text' || type === 'password' || type ===' email' || type === 'phone') {
                if($el.value !== $scope.props[args]) {
                    $el.value = $scope.props[args];
                }

                BrowserEvent.attachEvent($el, 'input', function(ev) {
                    setTimeout(function() {
                        $scope.props[args] = ev.target.value;
                    }, this.typeDelay);
                }, 'setPropToInputValue');
            } else if(type === 'checkbox') {
                if($el.value !== $scope.props[args]) {
                    $el.checked = $scope.props[args];
                }

                BrowserEvent.attachEvent($el, 'change', function(ev) {
                    $scope.props[args] = ev.target.checked;
                }, 'setPropToCheckboxValue');
            } else if(type === 'radio') {

                $scope.getDomElement().querySelectorAll(`input[type="radio"][sj\\3A model="${args}"]`).forEach(radio => {
                    if(radio.value === $scope.props[args]) {
                        radio.checked = true;
                    }
                })

                BrowserEvent.attachEvent($el, 'change', function(ev) {
                    if(ev.target.checked) {
                        // log('BindModel $scope.props[args]: ', $scope.props[args], 'ev.target.value: ', ev.target.value);
                        $scope.props[args] = ev.target.value;
                    }
                }, 'setPropToRadioValue');
            }
        } else if(tag === 'select') {
            /*if($el.hasAttribute(':key')) {
                var key = $el.getAttribute(':key');
            }*/

            // log(`BindModel SELECT: key:${key} - ${$el.value} - ${$scope.props[args]} - ${$scope.props[args][key]}`)

            if($el.value !== $scope.props[args]) {
                // if(!key) {
                    $el.value = $scope.props[args];
                /*} else {
                    $el.value = $scope.props[args][key];
                }*/
                // $el.dispatchEvent(new Event('change'));
            }

            BrowserEvent.attachEvent($el, 'change', function(ev) {
                // log(`BindModel SELECT onchange: key:${key} - ${$el.value} - `, $scope.props[args],` - ${$scope.props[args][key]}`)

                if($el.value !== $scope.props[args]) {
                    // if(!key) {
                        $scope.props[args] = ev.target.value;
                    /*} else {
                        $scope.props[args] = $scope.props[args]
                        $scope.props[args][key] = ev.target.value;
                    }*/
                }
            }, 'setPropToSelectValue');
        } else if(tag === 'textarea') {
            if($el.value !== $scope.props[args]) {
                $el.value = $scope.props[args];
            }

            BrowserEvent.attachEvent($el, 'input', function(ev) {
                setTimeout(function() {
                    $scope.props[args] = ev.target.value;
                }, this.typeDelay);
            }, 'setPropToTextAreaValue'); //
        }
    }
}