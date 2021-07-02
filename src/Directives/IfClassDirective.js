import log from "../Log";

export default class IfClassDirective {
    constructor({ event, args }, $scope, $el) {
        log('Called IfClassDirective')
        log('$el.tagName: ', $el.tagName)
        log('IfClassDirective vars: ', { event, args }, $scope)

        const classMap = (new Function(` return ${args}`).bind($scope.props))();

        log('IfClassDirective classMap: ', classMap)

        Object.entries(classMap).forEach(([cssClass, prop]) => {
            log(`cssClass: '${cssClass} -> propValue: ${prop}'`)
            if(!prop) {
                log(`!prop`)
                if($el.classList.contains(cssClass)) {
                    log(`!prop and removing ${cssClass}`)
                    $el.classList.remove(cssClass)
                }
            } else {
                log(`prop -> yes`)
                if(!$el.classList.contains(cssClass)) {
                    log(`prop and adding ${cssClass}`)
                    $el.classList.add(cssClass)
                }
            }
        })
    }
}