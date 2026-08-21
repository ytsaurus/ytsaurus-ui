/** @jest-environment jsdom */
import React from 'react';
import {render, screen} from '@testing-library/react';

jest.mock('../Icon/Icon', () => ({__esModule: true, default: () => <span />}));
jest.mock('../ModalWrapper/ModalWrapper', () => ({
    ModalWrapper: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));
jest.mock('../../hocs/components/Modal/withHandledScrollBar', () => ({
    __esModule: true,
    default: (Component: React.ComponentType) => Component,
}));
jest.mock('./i18n', () => ({__esModule: true, default: (key: string) => key}));

import SimpleModal from './SimpleModal';

it('gives the icon-only close button a localized accessible name', () => {
    render(
        <SimpleModal visible title="Details" onCancel={() => {}}>
            Content
        </SimpleModal>,
    );

    const close = screen.getByRole('button', {name: 'action_close'});
    expect(close.getAttribute('title')).toBe('action_close');
});
