export const outputTableNamePatternTooltip = `This pattern extends the export table name. Supported:
- %UNIX_TS - unix timestamp
- %PERIOD - the length of the export period in seconds
- %ISO - unix timestamp as ISO time string
- all specifiers supported by the "strftime" function (e.g. %H, %M, %S, etc.)

  Default is "%UNIX_TS-%PERIOD".
  NB!: It has to set a unique table name, otherwise error will occur.`;

export const useUpperBoundForTableNamesTooltip = `"true" - output table will gather data to upper bound of frame. E.g. for %H pattern output table will be named 17:00 and has data from 16:00 to 17:00.
"false" - otherwise, formatting will be equal to the upper bound minus one export period. E.g. for %H data will be from 17:00 to 18:00.
NB: In any case, the table exported with an upper bound timestamp of T is not guaranteed to contain all data with timestamp <= T.
In case of delays, some of the data can end up in latter tables. You should be especially careful with commit_ordering=%false queues, since commit timestamp monotonicity within a tablet is not guaranteed for them.
`;
