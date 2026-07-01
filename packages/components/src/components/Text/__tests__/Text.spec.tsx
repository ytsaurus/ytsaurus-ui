import ReactDOMServer from 'react-dom/server';

import {YTText} from '../Text';

it('renders as span by default', () => {
    const html = ReactDOMServer.renderToString(<YTText>test</YTText>);

    expect(html).toMatch(/^<span\b/);
});

it('renders as the specified tag', () => {
    const html = ReactDOMServer.renderToString(<YTText as="div">test</YTText>);

    expect(html).toMatch(/^<div\b/);
});
