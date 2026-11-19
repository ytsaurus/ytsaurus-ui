const {I18N} = require('@gravity-ui/i18n');

const en = require('./en.json');
const ru = require('./ru.json');

const instance = new I18N({lang: 'en', fallbackLang: 'en'});
const keyset = 'yt:interface-helpers';

instance.registerKeyset('en', keyset, en);
instance.registerKeyset('ru', keyset, ru);

function setLang(lang) {
    instance.setLang(lang);
}

module.exports = {setLang, i18n: instance.keyset(keyset)};
