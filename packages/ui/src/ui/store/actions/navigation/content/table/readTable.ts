export const tableReadSetup = {
    transformResponse({
        parsedData,
        rawResponse,
    }: {
        parsedData: string;
        rawResponse: Record<string, string>;
    }) {
        return {
            data: parsedData,
            headers: rawResponse?.headers,
        };
    },
};

export const tableReadParameters = {
    dump_error_into_response: true,
    omit_inaccessible_columns: true,
};
