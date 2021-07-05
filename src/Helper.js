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

    static cloneArray(arr) {
        return JSON.parse(JSON.stringify(arr));
    }

    static diffArray1(arr1, arr2) {
        let diff = [];
        let countDiff = 0;

        // console.log("\n------------------- diffArray ------------");

        if(arr1.length >= arr2.length) {
            for(let i = 0; i < arr1.length; i++) {
                if(i < arr2.length) {
                    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
                        diff.push(arr1[i]);
                        countDiff++;
                    }
                } else {
                    diff.push(arr1[i]);
                }
            }

            // if(countDiff === arr2.length) {
            //     console.log('They Both Different', arr1, arr2)
            // }
        } else {
            // arr2.length > arr1.length
            for(let i = 0; i < arr2.length; i++) {
                if(i < arr1.length) {
                    if (JSON.stringify(arr2[i]) !== JSON.stringify(arr1[i])) {
                        diff.push(arr2[i]);
                        countDiff++;
                    }
                } else {
                    diff.push(arr2[i]);
                }
            }
            // if(countDiff === arr1.length) {
            //     console.log('They Both Different', arr1, arr2)
            // }
        }

        // console.log('Array countDiff: ', countDiff);

        return [diff, countDiff];
    }

    static diffArray(arr1, arr2) {
        if(arr1.length === 0) {
            return arr2;
        }

        if(arr2.length === 0) {
            return arr1;
        }

        let [ diff, countDiff ] = this.diffArray1(arr1, arr2);

        if(arr1.length >= arr2.length) {
            if(countDiff === arr2.length) {
                // console.log('They Both Different', arr1, arr2)
                diff = [...diff, ...this.diffArray1(arr2, arr1)[0]]
            }
        } else {
            if(countDiff === arr1.length) {
                // console.log('They Both Different', arr1, arr2)
                diff = [...diff, ...this.diffArray1(arr2, arr1)[0]]
            }
        }

        return diff;
    }

    static getIfItIsJson(str) {
        if (typeof str !== 'string') return false;

        try {
            const result = JSON.parse(str);
            const type = Object.prototype.toString.call(result);
            if (type === '[object Object]' || type === '[object Array]') {
                return result;
            }
        } catch (err) {
            return false;
        }
    }

    static isValidHTMLElement(element) {
        return document.createElement(element.tagName.toUpperCase()).toString() !== "[object HTMLUnknownElement]";
    }

    static create___sj(element) {
        if(!element.___sj) {
            element.___sj = {
                id: Helper.uuid4()
            }
        }
    }

    static isArrowFn(f) {
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