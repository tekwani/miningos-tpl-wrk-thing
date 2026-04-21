/**
 * A manageable entity in MiningOS (device, sensor, miner, etc.)
 */
export type Thing = {
    /**
     * - Unique identifier (UUID)
     */
    id: string;
    /**
     * - Human-readable code (e.g., "MINER-0001")
     */
    code: string;
    /**
     * - Thing type identifier
     */
    type: string;
    /**
     * - Array of tags for filtering and categorization
     */
    tags: string[];
    /**
     * - Metadata about the thing
     */
    info: ThingInfo;
    /**
     * - Connection and configuration options
     */
    opts: ThingOpts;
    /**
     * - User comments attached to the thing
     */
    comments?: ThingComment[];
    /**
     * - Last known status from snapshot collection
     */
    last?: ThingStatus;
    /**
     * - Rack identifier this thing belongs to
     */
    rack: string;
};
/**
 * Thing metadata and state information
 */
export type ThingInfo = {
    /**
     * - Unix timestamp of creation
     */
    createdAt: number;
    /**
     * - Unix timestamp of last update
     */
    updatedAt: number;
    /**
     * - Position identifier within a container/rack
     */
    pos?: string;
    /**
     * - Container identifier (or 'maintenance' for offline)
     */
    container?: string;
    /**
     * - ID of the last action performed
     */
    lastActionId?: string;
};
/**
 * Connection and configuration options for a thing
 */
export type ThingOpts = {
    /**
     * - Host address for connection
     */
    host?: string;
    /**
     * - Port number for connection
     */
    port?: number;
};
/**
 * User comment attached to a thing
 */
export type ThingComment = {
    /**
     * - Comment unique identifier
     */
    id: string;
    /**
     * - Unix timestamp when comment was created
     */
    ts: number;
    /**
     * - Comment text content
     */
    comment: string;
    /**
     * - Username of comment author
     */
    user: string;
    /**
     * - Optional position reference
     */
    pos?: string;
};
/**
 * Last known status from snapshot collection
 */
export type ThingStatus = {
    /**
     * - Timestamp of last status update
     */
    ts: number;
    /**
     * - Snapshot data from device
     */
    snap?: any;
    /**
     * - Error message if last collection failed
     */
    err?: string;
    /**
     * - Active alerts for this thing
     */
    alerts?: Alert[];
};
/**
 * Alert generated from thing monitoring
 */
export type Alert = {
    /**
     * - Alert unique identifier
     */
    uuid: string;
    /**
     * - Unix timestamp when alert was created
     */
    createdAt: number;
    /**
     * - Alert type identifier
     */
    type: string;
    /**
     * - Alert message
     */
    message?: string;
};
/**
 * Rack information
 */
export type Rack = {
    /**
     * - Rack identifier
     */
    id: string;
    /**
     * - RPC server public key (hex encoded)
     */
    rpcPubKey: string;
};
/**
 * MongoDB-style query object for filtering things
 */
export type MongoQuery = any;
/**
 * Field projection for query results
 */
export type FieldProjection = {
    [x: string]: 0 | 1;
};
/**
 * Sort criteria for query results
 */
export type SortCriteria = {
    [x: string]: 1 | -1;
};
/**
 * Parameters for `registerThing` RPC method
 */
export type RegisterThingParams = {
    /**
     * - Device ID (auto-generated UUID if not provided)
     */
    id?: string;
    /**
     * - Device code (auto-generated if not provided, must match pattern *-NNNN)
     */
    code?: string;
    /**
     * - Device connection options (required)
     */
    opts: ThingOpts;
    /**
     * - Device metadata
     */
    info?: ThingInfo;
    /**
     * - Additional tags
     */
    tags?: string[];
    /**
     * - Registration comment
     */
    comment?: string;
    /**
     * - User making the request (required if comment provided)
     */
    user?: string;
};
/**
 * Parameters for `updateThing` RPC method
 */
export type UpdateThingParams = {
    /**
     * - Device ID (required)
     */
    id: string;
    /**
     * - Updated connection options
     */
    opts?: ThingOpts;
    /**
     * - Updated metadata
     */
    info?: ThingInfo;
    /**
     * - Updated tags
     */
    tags?: string[];
    /**
     * - If true, replace instead of merge
     */
    forceOverwrite?: boolean;
    /**
     * - Update comment
     */
    comment?: string;
    /**
     * - User making the request
     */
    user?: string;
    /**
     * - Action identifier for tracking
     */
    actionId?: string;
};
/**
 * Parameters for `listThings` RPC method
 */
export type ListThingsParams = {
    /**
     * - MongoDB-style query filter
     */
    query?: MongoQuery;
    /**
     * - Field projection
     */
    fields?: FieldProjection;
    /**
     * - Sort criteria
     */
    sort?: SortCriteria;
    /**
     * - Number of records to skip
     */
    offset?: number;
    /**
     * - Maximum records to return
     */
    limit?: number;
    /**
     * - Include last status information
     */
    status?: boolean;
};
/**
 * Parameters for `getThingsCount` RPC method
 */
export type GetThingsCountParams = {
    /**
     * - MongoDB-style query filter
     */
    query?: MongoQuery;
};
/**
 * Parameters for `forgetThings` RPC method
 */
export type ForgetThingsParams = {
    /**
     * - Query to select things to remove
     */
    query?: MongoQuery;
    /**
     * - If true, remove all things
     */
    all?: boolean;
};
/**
 * Parameters for `queryThing` RPC method
 */
export type QueryThingParams = {
    /**
     * - Thing ID
     */
    id: string;
    /**
     * - Method name to execute on thing controller
     */
    method: string;
    /**
     * - Parameters to pass to the method
     */
    params: any[];
};
/**
 * Parameters for `applyThings` RPC method
 */
export type ApplyThingsParams = {
    /**
     * - Method to execute on each thing
     */
    method: string;
    /**
     * - Query to select things (default: all)
     */
    query?: MongoQuery;
    /**
     * - Parameters to pass to the method
     */
    params?: any[];
    /**
     * - Field projection for selection
     */
    fields?: FieldProjection;
    /**
     * - Sort criteria for selection
     */
    sort?: SortCriteria;
    /**
     * - Number of things to skip
     */
    offset?: number;
    /**
     * - Maximum things to process
     */
    limit?: number;
};
/**
 * Parameters for `saveThingComment` RPC method
 */
export type SaveThingCommentParams = {
    /**
     * - Thing ID to add comment to
     */
    thingId: string;
    /**
     * - Comment text
     */
    comment: string;
    /**
     * - Username of comment author
     */
    user: string;
    /**
     * - Optional position reference
     */
    pos?: string;
};
/**
 * Parameters for `editThingComment` RPC method
 */
export type EditThingCommentParams = {
    /**
     * - Thing ID
     */
    thingId: string;
    /**
     * - Comment ID (preferred)
     */
    id?: string;
    /**
     * - Comment timestamp (fallback if id not provided)
     */
    ts?: number;
    /**
     * - New comment text
     */
    comment: string;
    /**
     * - Username (must match original author)
     */
    user: string;
};
/**
 * Parameters for `deleteThingComment` RPC method
 */
export type DeleteThingCommentParams = {
    /**
     * - Thing ID
     */
    thingId: string;
    /**
     * - Comment ID (preferred)
     */
    id?: string;
    /**
     * - Comment timestamp (fallback if id not provided)
     */
    ts?: number;
    /**
     * - Username (must match original author)
     */
    user: string;
};
/**
 * Parameters for `tailLog` RPC method
 */
export type TailLogParams = {
    /**
     * - Log type identifier (e.g., 'thing-5m', 'stat-H')
     */
    key: string;
    /**
     * - Thing tag or identifier
     */
    tag: string;
    /**
     * - Log file offset
     */
    offset?: number;
    /**
     * - Maximum entries (default 100 if no time range)
     */
    limit?: number;
    /**
     * - Start timestamp for time range
     */
    start?: number;
    /**
     * - End timestamp for time range
     */
    end?: number;
    /**
     * - Field projection
     */
    fields?: FieldProjection;
    /**
     * - Group logs by time range
     */
    groupRange?: string;
    /**
     * - Calculate averages when grouping
     */
    shouldCalculateAvg?: boolean;
};
/**
 * Parameters for `getHistoricalLogs` RPC method
 */
export type GetHistoricalLogsParams = {
    /**
     * - Type of historical logs to retrieve
     */
    logType: "alerts" | "info";
    /**
     * - Starting offset
     */
    offset?: number;
    /**
     * - Maximum entries
     */
    limit?: number;
    /**
     * - Start timestamp
     */
    start?: number;
    /**
     * - End timestamp
     */
    end?: number;
    /**
     * - Field projection (for 'info' type)
     */
    fields?: FieldProjection;
};
/**
 * Parameters for `getReplicaConf` RPC method
 */
export type GetReplicaConfParams = any;
/**
 * Parameters for `getRack` RPC method
 */
export type GetRackParams = any;
/**
 * Parameters for `rackReboot` RPC method
 */
export type RackRebootParams = any;
/**
 * Parameters for `getWrkExtData` RPC method
 */
export type GetWrkExtDataParams = any;
/**
 * Parameters for `getWrkConf` RPC method
 */
export type GetWrkConfParams = {
    /**
     * - Field projection for config
     */
    fields?: FieldProjection;
};
/**
 * Parameters for `getThingConf` RPC method
 */
export type GetThingConfParams = {
    /**
     * - Type of configuration to retrieve
     */
    requestType: "nextAvailableCode";
};
/**
 * Parameters for `getWrkSettings` RPC method
 */
export type GetWrkSettingsParams = any;
/**
 * Parameters for `saveWrkSettings` RPC method
 */
export type SaveWrkSettingsParams = {
    /**
     * - Settings entries to save
     */
    entries: any;
};
/**
 * Log entry from tailLog
 */
export type LogEntry = {
    /**
     * - Timestamp
     */
    ts: number;
    /**
     * - Snapshot data
     */
    snap?: any;
    /**
     * - Error message if collection failed
     */
    err?: string;
};
/**
 * Historical alert entry
 */
export type HistoricalAlert = {
    /**
     * - Alert unique identifier
     */
    uuid: string;
    /**
     * - Unix timestamp
     */
    createdAt: number;
    /**
     * - Alert type
     */
    type: string;
    /**
     * - Associated thing (partial)
     */
    thing: Thing;
};
/**
 * Historical info change entry
 */
export type HistoricalInfoChange = {
    /**
     * - Timestamp of change
     */
    ts: number;
    /**
     * - Object describing what changed
     */
    changes: any;
    /**
     * - Associated thing (partial)
     */
    thing: Thing;
};
/**
 * Replica configuration
 */
export type ReplicaConf = {
    /**
     * - Mapping of log names to replica keys
     */
    keys: {
        [x: string]: string;
    };
};
/**
 * Worker settings
 */
export type WrkSettings = any;
/**
 * Result for `getRack` RPC method.
 */
export type GetRackResult = Rack;
/**
 * Result for `queryThing` RPC method. Polymorphic: the `method` parameter
 * dispatches to a controller method on the target thing, so the response
 * shape depends entirely on that controller. Intentionally untyped.
 */
export type QueryThingResult = any;
/**
 * Result for `listThings` RPC method.
 */
export type ListThingsResult = Thing[];
/**
 * Result for `getThingsCount` RPC method. Count of things matching the query.
 */
export type GetThingsCountResult = number;
/**
 * Result for `registerThing` RPC method. Returns 1 on success.
 */
export type RegisterThingResult = number;
/**
 * Result for `updateThing` RPC method. Returns 1 on success.
 */
export type UpdateThingResult = number;
/**
 * Result for `saveThingComment` RPC method. Returns 1 on success.
 */
export type SaveThingCommentResult = number;
/**
 * Result for `editThingComment` RPC method. Returns 1 on success.
 */
export type EditThingCommentResult = number;
/**
 * Result for `deleteThingComment` RPC method. Returns 1 on success.
 */
export type DeleteThingCommentResult = number;
/**
 * Result for `forgetThings` RPC method. Returns 1 on success.
 */
export type ForgetThingsResult = number;
/**
 * Result for `applyThings` RPC method. Number of successful operations.
 */
export type ApplyThingsResult = number;
/**
 * Result for `tailLog` RPC method.
 */
export type TailLogResult = LogEntry[];
/**
 * Result for `getHistoricalLogs` RPC method. Discriminated by `req.logType`:
 * `'alerts'` yields HistoricalAlert entries, `'info'` yields HistoricalInfoChange
 * entries. Emitted as `oneOf` in the OpenRPC output.
 */
export type GetHistoricalLogsResult = HistoricalAlert[] | HistoricalInfoChange[];
/**
 * Result for `getReplicaConf` RPC method.
 */
export type GetReplicaConfResult = ReplicaConf;
/**
 * Result for `rackReboot` RPC method. Returns 1 immediately (process exits
 * asynchronously).
 */
export type RackRebootResult = number;
/**
 * Result for `getWrkExtData` RPC method. Extended worker data, extensible by
 * subclasses via `_getWrkExtData`. Shape is deployment-specific.
 */
export type GetWrkExtDataResult = any;
/**
 * Result for `getWrkConf` RPC method. Global configuration object (or a
 * projected subset when `req.fields` is supplied). Shape is deployment-specific.
 */
export type GetWrkConfResult = any;
/**
 * Result for `getThingConf` RPC method. For `requestType: 'nextAvailableCode'`
 * the result is the next available thing code string.
 */
export type GetThingConfResult = string;
/**
 * Result for `getWrkSettings` RPC method.
 */
export type GetWrkSettingsResult = WrkSettings;
/**
 * Result for `saveWrkSettings` RPC method. Polymorphic: passes through the
 * underlying settings-save facility, whose return shape varies. Intentionally
 * untyped.
 */
export type SaveWrkSettingsResult = any;
/**
 * - Operation blocked on slave/replica nodes
 */
export type ErrSlaveBlock = "ERR_SLAVE_BLOCK";
/**
 * - Thing with specified ID not found
 */
export type ErrThingNotFound = "ERR_THING_NOTFOUND";
/**
 * - Thing with ID already exists
 */
export type ErrThingIdExists = "ERR_THING_WITH_ID_ALREADY_EXISTS";
/**
 * - Thing with code already exists
 */
export type ErrThingCodeExists = "ERR_THING_WITH_CODE_ALREADY_EXISTS";
/**
 * - Code format invalid (must be *-NNNN)
 */
export type ErrThingCodeInvalid = "ERR_THING_CODE_INVALID";
/**
 * - Thing controller not ready
 */
export type ErrThingNotInit = "ERR_THING_NOT_INITIALIZED";
/**
 * - Method not found on thing controller
 */
export type ErrThingMethodNotFound = "ERR_THING_METHOD_NOTFOUND";
/**
 * - Invalid or missing method name
 */
export type ErrMethodInvalid = "ERR_METHOD_INVALID";
/**
 * - User cannot modify this comment
 */
export type ErrCommentAccessDenied = "ERR_COMMENT_ACCESS_DENIED";
/**
 * - Thing has no comments
 */
export type ErrCommentsNotFound = "ERR_THING_COMMENTS_NOTFOUND";
/**
 * - Specified comment not found
 */
export type ErrCommentNotFound = "ERR_THING_COMMENT_NOTFOUND";
/**
 * - Log key parameter missing
 */
export type ErrLogKeyNotFound = "ERR_LOG_KEY_NOTFOUND";
/**
 * - Log tag parameter invalid
 */
export type ErrLogTagInvalid = "ERR_LOG_TAG_INVALID";
/**
 * - Log not found
 */
export type ErrLogNotFound = "ERR_LOG_NOTFOUND";
/**
 * - Invalid logType parameter
 */
export type ErrLogTypeInvalid = "ERR_INFO_HISTORY_LOG_TYPE_INVALID";
/**
 * - Global config not loaded
 */
export type ErrGlobalConfigMissing = "ERR_GLOBAL_CONFIG_MISSING";
/**
 * - Invalid requestType parameter
 */
export type ErrInvalidRequestType = "ERR_INVALID_REQUEST_TYPE";
/**
 * - Invalid entries parameter
 */
export type ErrEntriesInvalid = "ERR_ENTRIES_INVALID";
