import {MemoryRouter} from 'react-router-dom';
import {Decorator} from '@storybook/react';

export const WithRouter: Decorator = (Story) => {
    return (
        <MemoryRouter initialEntries={['/']}>
            <Story />
        </MemoryRouter>
    );
};