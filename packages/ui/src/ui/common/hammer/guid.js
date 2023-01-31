// Broofa's guid implementation, see http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export default function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line no-bitwise
        const r = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
