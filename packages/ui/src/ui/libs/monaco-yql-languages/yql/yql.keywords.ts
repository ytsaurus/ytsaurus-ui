import {Position, editor, languages} from 'monaco-editor';
import {generateSuggestion} from '../helpers/generateSuggestions';
import {getRangeToInsertSuggestion} from '../helpers/getRangeToInsertSuggestion';

export const keywords =
    '$row|$rows|action|all|and|any|as|asc|assume|begin|bernoulli|between|by|case|columns|commit|compact|create|cross|cube|declare|define|delete|desc|dict|discard|distinct|do|drop|else|empty_action|end|erase|evaluate|exclusion|exists|export|flatten|for|from|full|group|grouping|having|if|ignore|ilike|import|in|inner|insert|into|is|join|left|like|limit|list|match|not|null|nulls|offset|on|only|optional|or|order|over|partition|pragma|presort|process|reduce|regexp|repeatable|replace|respect|result|return|right|rlike|rollup|sample|schema|select|semi|set|sets|stream|subquery|table|tablesample|then|truncate|union|update|upsert|use|using|values|view|when|where|window|with|without|xor'.split(
        '|',
    );
export const typeKeywords =
    'bool|date|datetime|decimal|double|float|int16|int32|int64|int8|interval|json|string|timestamp|tzdate|tzdatetime|tztimestamp|uint16|uint32|uint64|uint8|utf8|uuid|yson'.split(
        '|',
    );

export const builtinFunctions =
    'abs|aggregate_by|aggregate_list|aggregate_list_distinct|agg_list|agg_list_distinct|as_table|avg|avg_if|adaptivedistancehistogram|adaptivewardhistogram|adaptiveweighthistogram|addmember|addtimezone|aggregateflatten|aggregatetransforminput|aggregatetransformoutput|aggregationfactory|asatom|asdict|asdictstrict|asenum|aslist|asliststrict|asset|assetstrict|asstruct|astagged|astuple|asvariant|atomcode|bitcast|bit_and|bit_or|bit_xor|bool_and|bool_or|bool_xor|bottom|bottom_by|blockwardhistogram|blockweighthistogram|cast|coalesce|concat|concat_strict|correlation|count|count_if|covariance|covariance_population|covariance_sample|callableargument|callableargumenttype|callableresulttype|callabletype|callabletypecomponents|callabletypehandle|choosemembers|combinemembers|countdistinctestimate|currentauthenticateduser|currentoperationid|currentoperationsharedid|currenttzdate|currenttzdatetime|currenttztimestamp|currentutcdate|currentutcdatetime|currentutctimestamp|dense_rank|datatype|datatypecomponents|datatypehandle|dictaggregate|dictcontains|dictcreate|dicthasitems|dictitems|dictkeytype|dictkeys|dictlength|dictlookup|dictpayloadtype|dictpayloads|dicttype|dicttypecomponents|dicttypehandle|each|each_strict|emptydicttype|emptydicttypehandle|emptylisttype|emptylisttypehandle|endswith|ensure|ensureconvertibleto|ensuretype|enum|evaluateatom|evaluatecode|evaluateexpr|evaluatetype|expandstruct|filter|filter_strict|find|first_value|folder|filecontent|filepath|flattenmembers|forceremovemember|forceremovemembers|forcerenamemembers|forcespreadmembers|formatcode|formattype|frombytes|funccode|greatest|grouping|gathermembers|generictype|histogram|hll|hyperloglog|if|if_strict|instanceof|json_exists|json_query|json_value|jointablerow|just|lag|last_value|lead|least|len|length|like|likely|like_strict|lambdaargumentscount|lambdacode|linearhistogram|listaggregate|listall|listany|listavg|listcode|listcollect|listconcat|listcreate|listdistinct|listenumerate|listextend|listextendstrict|listextract|listfilter|listflatmap|listflatten|listfromrange|listhas|listhasitems|listhead|listindexof|listitemtype|listlast|listlength|listmap|listmax|listmin|listnotnull|listreplicate|listreverse|listskip|listskipwhile|listskipwhileinclusive|listsort|listsortasc|listsortdesc|listsum|listtake|listtakewhile|listtakewhileinclusive|listtype|listtypehandle|listunionall|listuniq|listzip|listzipall|loghistogram|logarithmichistogram|max|max_by|max_of|median|min|min_by|min_of|mode|multi_aggregate_by|nanvl|nvl|nothing|nulltype|nulltypehandle|optionalitemtype|optionaltype|optionaltypehandle|percentile|parsefile|parsetype|parsetypehandle|pickle|quotecode|range|range_strict|rank|regexp|regexp_strict|rfind|row_number|random|randomnumber|randomuuid|removemember|removemembers|removetimezone|renamemembers|replacemember|reprcode|resourcetype|resourcetypehandle|resourcetypetag|some|stddev|stddev_population|stddev_sample|substring|sum|sum_if|sessionstart|sessionwindow|setcreate|setdifference|setincludes|setintersection|setisdisjoint|setsymmetricdifference|setunion|spreadmembers|stablepickle|startswith|staticmap|streamitemtype|streamtype|streamtypehandle|structmembertype|structmembers|structtypecomponents|structtypehandle|subqueryextend|subqueryextendfor|subquerymerge|subquerymergefor|subqueryunionall|subqueryunionallfor|subqueryunionmerge|subqueryunionmergefor|top|topfreq|top_by|tablename|tablepath|tablerecordindex|tablerow|taggedtype|taggedtypecomponents|taggedtypehandle|tobytes|todict|tomultidict|toset|tosorteddict|tosortedmultidict|trymember|tupleelementtype|tupletype|tupletypecomponents|tupletypehandle|typehandle|typekind|typeof|udaf|unittype|unpickle|untag|unwrap|variance|variance_population|variance_sample|variant|varianttype|varianttypehandle|variantunderlyingtype|voidtype|voidtypehandle|way|worldcode'.split(
        '|',
    );

export const generateYqlOldSafariSuggestion = (
    model: editor.ITextModel,
    monacoCursorPosition: Position,
) => {
    const range = getRangeToInsertSuggestion(model, monacoCursorPosition);
    return {
        suggestions: [
            ...generateSuggestion({
                kind: languages.CompletionItemKind.Keyword,
                detail: 'Keyword',
                suggestionType: 'suggestKeywords',
                rangeToInsertSuggestion: range,
                items: [...keywords, ...typeKeywords],
            }),
            ...generateSuggestion({
                kind: languages.CompletionItemKind.Function,
                detail: 'Function',
                suggestionType: 'suggestFunctions',
                rangeToInsertSuggestion: range,
                items: builtinFunctions,
            }),
        ],
    };
};
