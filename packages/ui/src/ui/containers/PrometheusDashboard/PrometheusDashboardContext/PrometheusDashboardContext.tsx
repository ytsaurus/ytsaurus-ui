import React from 'react';

type PrometheusDashboardContextData = {
    expandedId?: string;
    toggleExpanded: (id: string) => void;
};

const PrometheusDashboardContext = React.createContext<PrometheusDashboardContextData>({
    expandedId: undefined,
    toggleExpanded: () => {
        throw new Error(
            `Please make sure you are using <PrometheusDashboardContext.Provider /> in parents.`,
        );
    },
});

export function PrometheusDashboardProvider({children}: {children: React.ReactNode}) {
    const [expandedId, setExpandedId] = React.useState<string>();

    const value = React.useMemo(() => {
        return {
            expandedId,
            toggleExpanded: (id: string) => {
                if (id === expandedId) {
                    setExpandedId(undefined);
                } else {
                    setExpandedId(id);
                }
            },
        };
    }, [expandedId]);

    return (
        <PrometheusDashboardContext.Provider value={value}>
            {children}
        </PrometheusDashboardContext.Provider>
    );
}

export function usePrometheusDashboardContext() {
    return React.useContext(PrometheusDashboardContext);
}
