import React from 'react';

import Message from './Message';

jest.mock('../Button/Button', () => 'button');
jest.mock('../Icon/Icon', () => 'icon');
jest.mock('./i18n', () => () => 'translation');

describe('Message content', () => {
    it('renders each array entry as a paragraph without changing its content', () => {
        const question = <strong>Confirm?</strong>;
        const result = Message({content: ['Details', question]});
        const paragraphs = result.props.children[1];

        expect(paragraphs).toHaveLength(2);
        expect(paragraphs[0].type).toBe('p');
        expect(paragraphs[0].props.children).toBe('Details');
        expect(paragraphs[1].type).toBe('p');
        expect(paragraphs[1].props.children).toBe(question);
    });

    it('supports empty content', () => {
        const result = Message({content: []});

        expect(result.props.children[1]).toEqual([]);
    });
});
