export default class Helper {

    static isPrimitive(o){return typeof o!=='object'||null}
    static isObject(o){return !this.isPrimitive(o)}
    static isNotSet(o) { return o === undefined || o === false || o === null}
    static isSet(o) {return !this.isNotSet(o)}
    static uuid4() {
        const ho = (n, p) => n.toString(16).padStart(p, 0); /// Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
        const view = new DataView(new ArrayBuffer(16)); /// Create a view backed by a 16-byte buffer
        crypto.getRandomValues(new Uint8Array(view.buffer)); /// Fill the buffer with random data
        view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40); /// Patch the 6th byte to reflect a version 4 UUID
        view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80); /// Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
        return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`; /// Compile the canonical textual form from the array data
    }

    static async sha256(message) {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);
        // hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // convert bytes to hex string
        return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    }

    static isArrowFn(f) {
        // log('f.toString: ', f.toString())

        return typeof f === 'function' && (/^([^{=]+|\(.*\)\s*)?=>/).test(f.toString().replace(/\s/, ''))
    }

    static attrStartsWith (prefix, parent=null) {
        if(!parent) {
            parent = document
        }

        let elements = []

        Array.from(parent.querySelectorAll('*'))
            .forEach(el => {
                const attrs = Array.from(el.attributes).filter(
                    ({name, value}) => name.startsWith(prefix))

                if (attrs.length > 0) {
                    elements.push({
                        el: el,
                        attrs: attrs
                    })
                }
            })
            /*.filter(
                (el) => Array.from(el.attributes).filter(
                    ({name, value}) => name.startsWith(prefix)).length
            )*/

        return elements;
    }
}