(function () {
    module.exports = {
        toPlainText: function (_serialize, input, format, settings) {
            settings = settings || {};

            settings.format = format;
            settings.asHTML = false;

            return _serialize(input, settings);
        },
        toHTMLText: function (_serialize, input, format, settings) {
            settings = settings || {};

            settings.format = format;
            settings.asHTML = true;

            return _serialize(input, settings);
        },
    };
})();
