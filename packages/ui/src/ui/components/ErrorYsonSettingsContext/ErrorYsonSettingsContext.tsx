import React from 'react';

import {UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';

export const ErrorsYsonSettingsContext = React.createContext<UnipikaSettings | undefined>(
    undefined,
);

export function useErroYsonSettings(): UnipikaSettings {
    return {...React.useContext(ErrorsYsonSettingsContext), asHTML: false};
}
