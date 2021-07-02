const DEBUG = true;

export default function log (...args) {
    if (DEBUG === true) {
        console.log(...args);
    }
}