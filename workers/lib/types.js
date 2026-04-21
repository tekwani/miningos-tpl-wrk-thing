'use strict'

/**
 * @fileoverview JSDoc type definitions for MiningOS Thing Worker RPC API.
 * These types are used to generate OpenRPC specifications.
 * @module types
 */

// =============================================================================
// Core Entity Types
// =============================================================================

/**
 * A manageable entity in MiningOS (device, sensor, miner, etc.)
 * @typedef {Object} Thing
 * @property {string} id - Unique identifier (UUID)
 * @property {string} code - Human-readable code (e.g., "MINER-0001")
 * @property {string} type - Thing type identifier
 * @property {string[]} tags - Array of tags for filtering and categorization
 * @property {ThingInfo} info - Metadata about the thing
 * @property {ThingOpts} opts - Connection and configuration options
 * @property {ThingComment[]} [comments] - User comments attached to the thing
 * @property {ThingStatus} [last] - Last known status from snapshot collection
 * @property {string} rack - Rack identifier this thing belongs to
 */

/**
 * Thing metadata and state information
 * @typedef {Object} ThingInfo
 * @property {number} createdAt - Unix timestamp of creation
 * @property {number} updatedAt - Unix timestamp of last update
 * @property {string} [pos] - Position identifier within a container/rack
 * @property {string} [container] - Container identifier (or 'maintenance' for offline)
 * @property {string} [lastActionId] - ID of the last action performed
 */

/**
 * Connection and configuration options for a thing
 * @typedef {Object} ThingOpts
 * @property {string} [host] - Host address for connection
 * @property {number} [port] - Port number for connection
 */

/**
 * User comment attached to a thing
 * @typedef {Object} ThingComment
 * @property {string} id - Comment unique identifier
 * @property {number} ts - Unix timestamp when comment was created
 * @property {string} comment - Comment text content
 * @property {string} user - Username of comment author
 * @property {string} [pos] - Optional position reference
 */

/**
 * Last known status from snapshot collection
 * @typedef {Object} ThingStatus
 * @property {number} ts - Timestamp of last status update
 * @property {Object} [snap] - Snapshot data from device
 * @property {string} [err] - Error message if last collection failed
 * @property {Alert[]} [alerts] - Active alerts for this thing
 */

/**
 * Alert generated from thing monitoring
 * @typedef {Object} Alert
 * @property {string} uuid - Alert unique identifier
 * @property {number} createdAt - Unix timestamp when alert was created
 * @property {string} type - Alert type identifier
 * @property {string} [message] - Alert message
 */

/**
 * Rack information
 * @typedef {Object} Rack
 * @property {string} id - Rack identifier
 * @property {string} rpcPubKey - RPC server public key (hex encoded)
 */

// =============================================================================
// Query and Filter Types
// =============================================================================

/**
 * MongoDB-style query object for filtering things
 * @typedef {Object} MongoQuery
 * @example
 * // Find things in rack-1
 * { 'info.pos': { $regex: 'rack-1' } }
 * @example
 * // Find things with specific tags
 * { tags: { $in: ['production', 'active'] } }
 */

/**
 * Field projection for query results
 * @typedef {Object.<string, 0|1>} FieldProjection
 * @example
 * // Include only id and info fields
 * { id: 1, info: 1 }
 * @example
 * // Exclude comments field
 * { comments: 0 }
 */

/**
 * Sort criteria for query results
 * @typedef {Object.<string, 1|-1>} SortCriteria
 * @example
 * // Sort by creation date descending
 * { 'info.createdAt': -1 }
 */

// =============================================================================
// RPC Method Parameter Types
// =============================================================================

/**
 * Parameters for `registerThing` RPC method
 * @typedef {Object} RegisterThingParams
 * @property {string} [id] - Device ID (auto-generated UUID if not provided)
 * @property {string} [code] - Device code (auto-generated if not provided, must match pattern *-NNNN)
 * @property {ThingOpts} opts - Device connection options (required)
 * @property {ThingInfo} [info] - Device metadata
 * @property {string[]} [tags] - Additional tags
 * @property {string} [comment] - Registration comment
 * @property {string} [user] - User making the request (required if comment provided)
 */

/**
 * Parameters for `updateThing` RPC method
 * @typedef {Object} UpdateThingParams
 * @property {string} id - Device ID (required)
 * @property {ThingOpts} [opts] - Updated connection options
 * @property {ThingInfo} [info] - Updated metadata
 * @property {string[]} [tags] - Updated tags
 * @property {boolean} [forceOverwrite] - If true, replace instead of merge
 * @property {string} [comment] - Update comment
 * @property {string} [user] - User making the request
 * @property {string} [actionId] - Action identifier for tracking
 */

/**
 * Parameters for `listThings` RPC method
 * @typedef {Object} ListThingsParams
 * @property {MongoQuery} [query] - MongoDB-style query filter
 * @property {FieldProjection} [fields] - Field projection
 * @property {SortCriteria} [sort] - Sort criteria
 * @property {number} [offset=0] - Number of records to skip
 * @property {number} [limit=100] - Maximum records to return
 * @property {boolean} [status] - Include last status information
 */

/**
 * Parameters for `getThingsCount` RPC method
 * @typedef {Object} GetThingsCountParams
 * @property {MongoQuery} [query] - MongoDB-style query filter
 */

/**
 * Parameters for `forgetThings` RPC method
 * @typedef {Object} ForgetThingsParams
 * @property {MongoQuery} [query] - Query to select things to remove
 * @property {boolean} [all] - If true, remove all things
 */

/**
 * Parameters for `queryThing` RPC method
 * @typedef {Object} QueryThingParams
 * @property {string} id - Thing ID
 * @property {string} method - Method name to execute on thing controller
 * @property {any[]} params - Parameters to pass to the method
 */

/**
 * Parameters for `applyThings` RPC method
 * @typedef {Object} ApplyThingsParams
 * @property {string} method - Method to execute on each thing
 * @property {MongoQuery} [query] - Query to select things (default: all)
 * @property {any[]} [params] - Parameters to pass to the method
 * @property {FieldProjection} [fields] - Field projection for selection
 * @property {SortCriteria} [sort] - Sort criteria for selection
 * @property {number} [offset] - Number of things to skip
 * @property {number} [limit] - Maximum things to process
 */

/**
 * Parameters for `saveThingComment` RPC method
 * @typedef {Object} SaveThingCommentParams
 * @property {string} thingId - Thing ID to add comment to
 * @property {string} comment - Comment text
 * @property {string} user - Username of comment author
 * @property {string} [pos] - Optional position reference
 */

/**
 * Parameters for `editThingComment` RPC method
 * @typedef {Object} EditThingCommentParams
 * @property {string} thingId - Thing ID
 * @property {string} [id] - Comment ID (preferred)
 * @property {number} [ts] - Comment timestamp (fallback if id not provided)
 * @property {string} comment - New comment text
 * @property {string} user - Username (must match original author)
 */

/**
 * Parameters for `deleteThingComment` RPC method
 * @typedef {Object} DeleteThingCommentParams
 * @property {string} thingId - Thing ID
 * @property {string} [id] - Comment ID (preferred)
 * @property {number} [ts] - Comment timestamp (fallback if id not provided)
 * @property {string} user - Username (must match original author)
 */

/**
 * Parameters for `tailLog` RPC method
 * @typedef {Object} TailLogParams
 * @property {string} key - Log type identifier (e.g., 'thing-5m', 'stat-H')
 * @property {string} tag - Thing tag or identifier
 * @property {number} [offset=0] - Log file offset
 * @property {number} [limit] - Maximum entries (default 100 if no time range)
 * @property {number} [start] - Start timestamp for time range
 * @property {number} [end] - End timestamp for time range
 * @property {FieldProjection} [fields] - Field projection
 * @property {string} [groupRange] - Group logs by time range
 * @property {boolean} [shouldCalculateAvg] - Calculate averages when grouping
 */

/**
 * Parameters for `getHistoricalLogs` RPC method
 * @typedef {Object} GetHistoricalLogsParams
 * @property {'alerts'|'info'} logType - Type of historical logs to retrieve
 * @property {number} [offset=0] - Starting offset
 * @property {number} [limit=100] - Maximum entries
 * @property {number} [start] - Start timestamp
 * @property {number} [end] - End timestamp
 * @property {FieldProjection} [fields] - Field projection (for 'info' type)
 */

/**
 * Parameters for `getReplicaConf` RPC method
 * @typedef {Object} GetReplicaConfParams
 */

/**
 * Parameters for `getRack` RPC method
 * @typedef {Object} GetRackParams
 */

/**
 * Parameters for `rackReboot` RPC method
 * @typedef {Object} RackRebootParams
 */

/**
 * Parameters for `getWrkExtData` RPC method
 * @typedef {Object} GetWrkExtDataParams
 */

/**
 * Parameters for `getWrkConf` RPC method
 * @typedef {Object} GetWrkConfParams
 * @property {FieldProjection} [fields] - Field projection for config
 */

/**
 * Parameters for `getThingConf` RPC method
 * @typedef {Object} GetThingConfParams
 * @property {'nextAvailableCode'} requestType - Type of configuration to retrieve
 */

/**
 * Parameters for `getWrkSettings` RPC method
 * @typedef {Object} GetWrkSettingsParams
 */

/**
 * Parameters for `saveWrkSettings` RPC method
 * @typedef {Object} SaveWrkSettingsParams
 * @property {Object} entries - Settings entries to save
 */

// =============================================================================
// RPC Method Result Types
// =============================================================================

/**
 * Log entry from tailLog
 * @typedef {Object} LogEntry
 * @property {number} ts - Timestamp
 * @property {Object} [snap] - Snapshot data
 * @property {string} [err] - Error message if collection failed
 */

/**
 * Historical alert entry
 * @typedef {Object} HistoricalAlert
 * @property {string} uuid - Alert unique identifier
 * @property {number} createdAt - Unix timestamp
 * @property {string} type - Alert type
 * @property {Thing} thing - Associated thing (partial)
 */

/**
 * Historical info change entry
 * @typedef {Object} HistoricalInfoChange
 * @property {number} ts - Timestamp of change
 * @property {Object} changes - Object describing what changed
 * @property {Thing} thing - Associated thing (partial)
 */

/**
 * Replica configuration
 * @typedef {Object} ReplicaConf
 * @property {Object.<string, string>} keys - Mapping of log names to replica keys
 */

/**
 * Worker settings
 * @typedef {Object} WrkSettings
 */

// =============================================================================
// RPC Method Result Type Aliases
// =============================================================================
// One Result typedef per method in RPC_METHODS. Naming convention:
// `${Capitalize(methodName)}Result`. Aliases reuse the entity/result typedefs
// above whenever possible. Polymorphic methods intentionally alias to `*`
// (any) with a description — this is the documented escape hatch.

/**
 * Result for `getRack` RPC method.
 * @typedef {Rack} GetRackResult
 */

/**
 * Result for `queryThing` RPC method. Polymorphic: the `method` parameter
 * dispatches to a controller method on the target thing, so the response
 * shape depends entirely on that controller. Intentionally untyped.
 * @typedef {*} QueryThingResult
 */

/**
 * Result for `listThings` RPC method.
 * @typedef {Thing[]} ListThingsResult
 */

/**
 * Result for `getThingsCount` RPC method. Count of things matching the query.
 * @typedef {number} GetThingsCountResult
 */

/**
 * Result for `registerThing` RPC method. Returns 1 on success.
 * @typedef {number} RegisterThingResult
 */

/**
 * Result for `updateThing` RPC method. Returns 1 on success.
 * @typedef {number} UpdateThingResult
 */

/**
 * Result for `saveThingComment` RPC method. Returns 1 on success.
 * @typedef {number} SaveThingCommentResult
 */

/**
 * Result for `editThingComment` RPC method. Returns 1 on success.
 * @typedef {number} EditThingCommentResult
 */

/**
 * Result for `deleteThingComment` RPC method. Returns 1 on success.
 * @typedef {number} DeleteThingCommentResult
 */

/**
 * Result for `forgetThings` RPC method. Returns 1 on success.
 * @typedef {number} ForgetThingsResult
 */

/**
 * Result for `applyThings` RPC method. Number of successful operations.
 * @typedef {number} ApplyThingsResult
 */

/**
 * Result for `tailLog` RPC method.
 * @typedef {LogEntry[]} TailLogResult
 */

/**
 * Result for `getHistoricalLogs` RPC method. Discriminated by `req.logType`:
 * `'alerts'` yields HistoricalAlert entries, `'info'` yields HistoricalInfoChange
 * entries. Emitted as `oneOf` in the OpenRPC output.
 * @typedef {HistoricalAlert[] | HistoricalInfoChange[]} GetHistoricalLogsResult
 */

/**
 * Result for `getReplicaConf` RPC method.
 * @typedef {ReplicaConf} GetReplicaConfResult
 */

/**
 * Result for `rackReboot` RPC method. Returns 1 immediately (process exits
 * asynchronously).
 * @typedef {number} RackRebootResult
 */

/**
 * Result for `getWrkExtData` RPC method. Extended worker data, extensible by
 * subclasses via `_getWrkExtData`. Shape is deployment-specific.
 * @typedef {Object} GetWrkExtDataResult
 */

/**
 * Result for `getWrkConf` RPC method. Global configuration object (or a
 * projected subset when `req.fields` is supplied). Shape is deployment-specific.
 * @typedef {Object} GetWrkConfResult
 */

/**
 * Result for `getThingConf` RPC method. For `requestType: 'nextAvailableCode'`
 * the result is the next available thing code string.
 * @typedef {string} GetThingConfResult
 */

/**
 * Result for `getWrkSettings` RPC method.
 * @typedef {WrkSettings} GetWrkSettingsResult
 */

/**
 * Result for `saveWrkSettings` RPC method. Polymorphic: passes through the
 * underlying settings-save facility, whose return shape varies. Intentionally
 * untyped.
 * @typedef {*} SaveWrkSettingsResult
 */

// =============================================================================
// Error Codes
// =============================================================================

/**
 * @typedef {'ERR_SLAVE_BLOCK'} ErrSlaveBlock - Operation blocked on slave/replica nodes
 * @typedef {'ERR_THING_NOTFOUND'} ErrThingNotFound - Thing with specified ID not found
 * @typedef {'ERR_THING_WITH_ID_ALREADY_EXISTS'} ErrThingIdExists - Thing with ID already exists
 * @typedef {'ERR_THING_WITH_CODE_ALREADY_EXISTS'} ErrThingCodeExists - Thing with code already exists
 * @typedef {'ERR_THING_CODE_INVALID'} ErrThingCodeInvalid - Code format invalid (must be *-NNNN)
 * @typedef {'ERR_THING_NOT_INITIALIZED'} ErrThingNotInit - Thing controller not ready
 * @typedef {'ERR_THING_METHOD_NOTFOUND'} ErrThingMethodNotFound - Method not found on thing controller
 * @typedef {'ERR_METHOD_INVALID'} ErrMethodInvalid - Invalid or missing method name
 * @typedef {'ERR_COMMENT_ACCESS_DENIED'} ErrCommentAccessDenied - User cannot modify this comment
 * @typedef {'ERR_THING_COMMENTS_NOTFOUND'} ErrCommentsNotFound - Thing has no comments
 * @typedef {'ERR_THING_COMMENT_NOTFOUND'} ErrCommentNotFound - Specified comment not found
 * @typedef {'ERR_LOG_KEY_NOTFOUND'} ErrLogKeyNotFound - Log key parameter missing
 * @typedef {'ERR_LOG_TAG_INVALID'} ErrLogTagInvalid - Log tag parameter invalid
 * @typedef {'ERR_LOG_NOTFOUND'} ErrLogNotFound - Log not found
 * @typedef {'ERR_INFO_HISTORY_LOG_TYPE_INVALID'} ErrLogTypeInvalid - Invalid logType parameter
 * @typedef {'ERR_GLOBAL_CONFIG_MISSING'} ErrGlobalConfigMissing - Global config not loaded
 * @typedef {'ERR_INVALID_REQUEST_TYPE'} ErrInvalidRequestType - Invalid requestType parameter
 * @typedef {'ERR_ENTRIES_INVALID'} ErrEntriesInvalid - Invalid entries parameter
 */

module.exports = {}
