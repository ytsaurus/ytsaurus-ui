# interface-helpers

JavaScript helpers for YTsaurus platform UI

## Install

`npm install --save @ytsaurus/interface-helpers`

## Example

hammer.format\['Bytes'\](123456789) ----> "117.74 MiB"

## Localization

Formatters use English by default and support Russian. Set the language when
initializing the application and whenever its language changes:

```js
const {setLang} = require('@ytsaurus/interface-helpers/lib/i18n');
const {format} = require('@ytsaurus/interface-helpers/lib/hammer');

setLang('ru');
format.NumberPerSecond(1250, {measure: 'строк'}); // '1 250 строк/с'
format.NumberPerSecond(12.5, {measure: 'Мбит', digits: 1}); // '12.5 Мбит/с'
format.BytesPerSecond(2048); // '2.00 КиБ/с'

setLang('en');
format.NumberPerSecond(1250, {measure: 'rows'}); // '1 250 rows/s'
```

`measure` is a display label supplied by the caller. Translate it in the
application, for example `{measure: i18n('rows')}`. `NumberPerSecond` localizes
the per-second suffix without translating the label or converting the value.
The value must already be expressed in the supplied unit.

The language also controls the labels in `Bytes`, `TimeDuration`, `vCores`, and
`RowsPerSecond`. Numeric formatting, scale selection, and handling of missing
values remain unchanged. Date localization is configured separately through
`@gravity-ui/date-utils`.
