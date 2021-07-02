import log from "./Log";

export default class BrowserEvent {

    static attachEvent($el, event, eventHandler, callbackName='') {
        if($el.___sj.browser_event_dispatcher === undefined) {

            $el.___sj['browser_event_dispatcher'] = new Map();
        }

        const eventId = `${$el.___sj.id}:${event}:${callbackName}`;

        if(!$el.___sj.browser_event_dispatcher.has(eventId)) {
            log('Adding event: ', eventId, 'to: ', $el.tagName)

            if (document.addEventListener) {              // For all major browsers, except IE 8 and earlier
                log("addEventListener is on");
                //console.log(n);
                $el.addEventListener(event, eventHandler);
            } else if (document.attachEvent) {              // For IE 8 and earlier versions
                log("attachEvent is on");
                $el.attachEvent('on' + event, eventHandler);
            }

            $el.___sj.browser_event_dispatcher.set(eventId, true);
        } else {
            log('Event already added: ', eventId, 'to: ', $el.tagName)
        }

        log('$el.___sj.browser_event_dispatcher: ', $el.___sj.browser_event_dispatcher)
    }

    static dispatchCustomEvent($el, eventName, eventDetails) {
        $el.dispatchEvent (
            new CustomEvent(eventName, {'detail': eventDetails})
        )
    }
}