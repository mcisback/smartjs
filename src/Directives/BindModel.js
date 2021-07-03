import log from "../Log";

import BrowserEvent from "../BrowserEvent";

export default class BindModel {
    constructor({ event, args }, $scope, $el) {
        log('Called BindModel')
        log('$el.tag: ', $el.tagName)

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
                    $scope.props[args] = ev.target.value;
                }, 'setPropToInputValue');
            } else if(type === 'checkbox') {
                if($el.value !== $scope.props[args]) {
                    $el.checked = $scope.props[args];
                }

                BrowserEvent.attachEvent($el, 'change', function(ev) {
                    $scope.props[args] = ev.target.checked;
                }, 'setPropToCheckboxValue');
            }
        } else if(tag === 'select') {
            if($el.value !== $scope.props[args]) {
                $el.value = $scope.props[args];

                // $el.dispatchEvent(new Event('change'));
            }

            BrowserEvent.attachEvent($el, 'change', function(ev) {
                if($el.value !== $scope.props[args]) {
                    $scope.props[args] = ev.target.value;
                }
            }, 'setPropToSelectValue');
        }
    }
}