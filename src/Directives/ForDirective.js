import log from "../Log";

export default class ForDirective {
    constructor({ event, args }, $scope, $el) {
        log('Called ForDirective')
        log('$el.tagName: ', $el.tagName)
    }
}