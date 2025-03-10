import React from 'react';

import {UnipikaSettings} from '../components/Yson/StructuredYson/StructuredYsonTypes';

export const ErrorsYsonSettingsContext = React.createContext<UnipikaSettings | undefined>(
    undefined,
);

export function useErrorYsonSettings(): UnipikaSettings {
    return {...React.useContext(ErrorsYsonSettingsContext), asHTML: false};
}
