import React from 'react';
import {useSelector} from '../../store/redux-hooks';

import {ErrorsYsonSettingsContext} from '../../hooks/useErrorYsonSettings';
import {selectErrorsYsonSettings} from '../../store/selectors/thor/unipika';

export function ErrorYsonSettingsProvider({children}: {children: React.ReactNode}) {
    const settings = useSelector(selectErrorsYsonSettings);
    return (
        <ErrorsYsonSettingsContext.Provider value={settings}>
            {children}
        </ErrorsYsonSettingsContext.Provider>
    );
}
