const storage = {};

storage.read = function (key) {
    return JSON.parse(localStorage.getItem(key)); // null will be correctly parsed as null
};

storage.write = function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

storage.remove = function (key) {
    localStorage.removeItem(key);
};

storage.keys = function () {
    return Object.keys(localStorage);
};

export default storage;
