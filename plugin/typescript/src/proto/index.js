/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.types = (function() {

    /**
     * Namespace types.
     * @exports types
     * @namespace
     */
    var types = {};

    types.Account = (function() {

        /**
         * Properties of an Account.
         * @memberof types
         * @interface IAccount
         * @property {Uint8Array|null} [address] Account address
         * @property {number|Long|null} [amount] Account amount
         */

        /**
         * Constructs a new Account.
         * @memberof types
         * @classdesc Represents an Account.
         * @implements IAccount
         * @constructor
         * @param {types.IAccount=} [properties] Properties to set
         */
        function Account(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Account address.
         * @member {Uint8Array} address
         * @memberof types.Account
         * @instance
         */
        Account.prototype.address = $util.newBuffer([]);

        /**
         * Account amount.
         * @member {number|Long} amount
         * @memberof types.Account
         * @instance
         */
        Account.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Account instance using the specified properties.
         * @function create
         * @memberof types.Account
         * @static
         * @param {types.IAccount=} [properties] Properties to set
         * @returns {types.Account} Account instance
         */
        Account.create = function create(properties) {
            return new Account(properties);
        };

        /**
         * Encodes the specified Account message. Does not implicitly {@link types.Account.verify|verify} messages.
         * @function encode
         * @memberof types.Account
         * @static
         * @param {types.IAccount} message Account message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Account.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.address);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.amount);
            return writer;
        };

        /**
         * Encodes the specified Account message, length delimited. Does not implicitly {@link types.Account.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Account
         * @static
         * @param {types.IAccount} message Account message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Account.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Account message from the specified reader or buffer.
         * @function decode
         * @memberof types.Account
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Account} Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Account.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Account();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.address = reader.bytes();
                        break;
                    }
                case 2: {
                        message.amount = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Account message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Account
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Account} Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Account.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Account message.
         * @function verify
         * @memberof types.Account
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Account.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            return null;
        };

        /**
         * Creates an Account message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Account
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Account} Account
         */
        Account.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Account)
                return object;
            var message = new $root.types.Account();
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length >= 0)
                    message.address = object.address;
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from an Account message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Account
         * @static
         * @param {types.Account} message Account
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Account.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
            }
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            return object;
        };

        /**
         * Converts this Account to JSON.
         * @function toJSON
         * @memberof types.Account
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Account.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Account
         * @function getTypeUrl
         * @memberof types.Account
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Account.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Account";
        };

        return Account;
    })();

    types.Pool = (function() {

        /**
         * Properties of a Pool.
         * @memberof types
         * @interface IPool
         * @property {number|Long|null} [id] Pool id
         * @property {number|Long|null} [amount] Pool amount
         */

        /**
         * Constructs a new Pool.
         * @memberof types
         * @classdesc Represents a Pool.
         * @implements IPool
         * @constructor
         * @param {types.IPool=} [properties] Properties to set
         */
        function Pool(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pool id.
         * @member {number|Long} id
         * @memberof types.Pool
         * @instance
         */
        Pool.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pool amount.
         * @member {number|Long} amount
         * @memberof types.Pool
         * @instance
         */
        Pool.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Pool instance using the specified properties.
         * @function create
         * @memberof types.Pool
         * @static
         * @param {types.IPool=} [properties] Properties to set
         * @returns {types.Pool} Pool instance
         */
        Pool.create = function create(properties) {
            return new Pool(properties);
        };

        /**
         * Encodes the specified Pool message. Does not implicitly {@link types.Pool.verify|verify} messages.
         * @function encode
         * @memberof types.Pool
         * @static
         * @param {types.IPool} message Pool message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pool.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.amount);
            return writer;
        };

        /**
         * Encodes the specified Pool message, length delimited. Does not implicitly {@link types.Pool.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Pool
         * @static
         * @param {types.IPool} message Pool message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pool.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Pool message from the specified reader or buffer.
         * @function decode
         * @memberof types.Pool
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Pool} Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pool.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Pool();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.amount = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Pool message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Pool
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Pool} Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pool.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Pool message.
         * @function verify
         * @memberof types.Pool
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pool.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            return null;
        };

        /**
         * Creates a Pool message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Pool
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Pool} Pool
         */
        Pool.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Pool)
                return object;
            var message = new $root.types.Pool();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a Pool message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Pool
         * @static
         * @param {types.Pool} message Pool
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Pool.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            return object;
        };

        /**
         * Converts this Pool to JSON.
         * @function toJSON
         * @memberof types.Pool
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Pool.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Pool
         * @function getTypeUrl
         * @memberof types.Pool
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Pool.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Pool";
        };

        return Pool;
    })();

    types.Event = (function() {

        /**
         * Properties of an Event.
         * @memberof types
         * @interface IEvent
         * @property {string|null} [eventType] Event eventType
         * @property {types.IEventCustom|null} [custom] Event custom
         * @property {number|Long|null} [height] Event height
         * @property {string|null} [reference] Event reference
         * @property {number|Long|null} [chainId] Event chainId
         * @property {number|Long|null} [blockHeight] Event blockHeight
         * @property {Uint8Array|null} [blockHash] Event blockHash
         * @property {Uint8Array|null} [address] Event address
         */

        /**
         * Constructs a new Event.
         * @memberof types
         * @classdesc Represents an Event.
         * @implements IEvent
         * @constructor
         * @param {types.IEvent=} [properties] Properties to set
         */
        function Event(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Event eventType.
         * @member {string} eventType
         * @memberof types.Event
         * @instance
         */
        Event.prototype.eventType = "";

        /**
         * Event custom.
         * @member {types.IEventCustom|null|undefined} custom
         * @memberof types.Event
         * @instance
         */
        Event.prototype.custom = null;

        /**
         * Event height.
         * @member {number|Long} height
         * @memberof types.Event
         * @instance
         */
        Event.prototype.height = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Event reference.
         * @member {string} reference
         * @memberof types.Event
         * @instance
         */
        Event.prototype.reference = "";

        /**
         * Event chainId.
         * @member {number|Long} chainId
         * @memberof types.Event
         * @instance
         */
        Event.prototype.chainId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Event blockHeight.
         * @member {number|Long} blockHeight
         * @memberof types.Event
         * @instance
         */
        Event.prototype.blockHeight = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Event blockHash.
         * @member {Uint8Array} blockHash
         * @memberof types.Event
         * @instance
         */
        Event.prototype.blockHash = $util.newBuffer([]);

        /**
         * Event address.
         * @member {Uint8Array} address
         * @memberof types.Event
         * @instance
         */
        Event.prototype.address = $util.newBuffer([]);

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Event msg.
         * @member {"custom"|undefined} msg
         * @memberof types.Event
         * @instance
         */
        Object.defineProperty(Event.prototype, "msg", {
            get: $util.oneOfGetter($oneOfFields = ["custom"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Event instance using the specified properties.
         * @function create
         * @memberof types.Event
         * @static
         * @param {types.IEvent=} [properties] Properties to set
         * @returns {types.Event} Event instance
         */
        Event.create = function create(properties) {
            return new Event(properties);
        };

        /**
         * Encodes the specified Event message. Does not implicitly {@link types.Event.verify|verify} messages.
         * @function encode
         * @memberof types.Event
         * @static
         * @param {types.IEvent} message Event message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Event.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.eventType);
            if (message.custom != null && Object.hasOwnProperty.call(message, "custom"))
                $root.types.EventCustom.encode(message.custom, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 91, wireType 0 =*/728).uint64(message.height);
            if (message.reference != null && Object.hasOwnProperty.call(message, "reference"))
                writer.uint32(/* id 92, wireType 2 =*/738).string(message.reference);
            if (message.chainId != null && Object.hasOwnProperty.call(message, "chainId"))
                writer.uint32(/* id 93, wireType 0 =*/744).uint64(message.chainId);
            if (message.blockHeight != null && Object.hasOwnProperty.call(message, "blockHeight"))
                writer.uint32(/* id 94, wireType 0 =*/752).uint64(message.blockHeight);
            if (message.blockHash != null && Object.hasOwnProperty.call(message, "blockHash"))
                writer.uint32(/* id 95, wireType 2 =*/762).bytes(message.blockHash);
            if (message.address != null && Object.hasOwnProperty.call(message, "address"))
                writer.uint32(/* id 96, wireType 2 =*/770).bytes(message.address);
            return writer;
        };

        /**
         * Encodes the specified Event message, length delimited. Does not implicitly {@link types.Event.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Event
         * @static
         * @param {types.IEvent} message Event message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Event.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Event message from the specified reader or buffer.
         * @function decode
         * @memberof types.Event
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Event} Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Event.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Event();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.eventType = reader.string();
                        break;
                    }
                case 11: {
                        message.custom = $root.types.EventCustom.decode(reader, reader.uint32());
                        break;
                    }
                case 91: {
                        message.height = reader.uint64();
                        break;
                    }
                case 92: {
                        message.reference = reader.string();
                        break;
                    }
                case 93: {
                        message.chainId = reader.uint64();
                        break;
                    }
                case 94: {
                        message.blockHeight = reader.uint64();
                        break;
                    }
                case 95: {
                        message.blockHash = reader.bytes();
                        break;
                    }
                case 96: {
                        message.address = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Event message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Event
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Event} Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Event.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Event message.
         * @function verify
         * @memberof types.Event
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Event.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.eventType != null && message.hasOwnProperty("eventType"))
                if (!$util.isString(message.eventType))
                    return "eventType: string expected";
            if (message.custom != null && message.hasOwnProperty("custom")) {
                properties.msg = 1;
                {
                    var error = $root.types.EventCustom.verify(message.custom);
                    if (error)
                        return "custom." + error;
                }
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height) && !(message.height && $util.isInteger(message.height.low) && $util.isInteger(message.height.high)))
                    return "height: integer|Long expected";
            if (message.reference != null && message.hasOwnProperty("reference"))
                if (!$util.isString(message.reference))
                    return "reference: string expected";
            if (message.chainId != null && message.hasOwnProperty("chainId"))
                if (!$util.isInteger(message.chainId) && !(message.chainId && $util.isInteger(message.chainId.low) && $util.isInteger(message.chainId.high)))
                    return "chainId: integer|Long expected";
            if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
                if (!$util.isInteger(message.blockHeight) && !(message.blockHeight && $util.isInteger(message.blockHeight.low) && $util.isInteger(message.blockHeight.high)))
                    return "blockHeight: integer|Long expected";
            if (message.blockHash != null && message.hasOwnProperty("blockHash"))
                if (!(message.blockHash && typeof message.blockHash.length === "number" || $util.isString(message.blockHash)))
                    return "blockHash: buffer expected";
            if (message.address != null && message.hasOwnProperty("address"))
                if (!(message.address && typeof message.address.length === "number" || $util.isString(message.address)))
                    return "address: buffer expected";
            return null;
        };

        /**
         * Creates an Event message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Event
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Event} Event
         */
        Event.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Event)
                return object;
            var message = new $root.types.Event();
            if (object.eventType != null)
                message.eventType = String(object.eventType);
            if (object.custom != null) {
                if (typeof object.custom !== "object")
                    throw TypeError(".types.Event.custom: object expected");
                message.custom = $root.types.EventCustom.fromObject(object.custom);
            }
            if (object.height != null)
                if ($util.Long)
                    (message.height = $util.Long.fromValue(object.height)).unsigned = true;
                else if (typeof object.height === "string")
                    message.height = parseInt(object.height, 10);
                else if (typeof object.height === "number")
                    message.height = object.height;
                else if (typeof object.height === "object")
                    message.height = new $util.LongBits(object.height.low >>> 0, object.height.high >>> 0).toNumber(true);
            if (object.reference != null)
                message.reference = String(object.reference);
            if (object.chainId != null)
                if ($util.Long)
                    (message.chainId = $util.Long.fromValue(object.chainId)).unsigned = true;
                else if (typeof object.chainId === "string")
                    message.chainId = parseInt(object.chainId, 10);
                else if (typeof object.chainId === "number")
                    message.chainId = object.chainId;
                else if (typeof object.chainId === "object")
                    message.chainId = new $util.LongBits(object.chainId.low >>> 0, object.chainId.high >>> 0).toNumber(true);
            if (object.blockHeight != null)
                if ($util.Long)
                    (message.blockHeight = $util.Long.fromValue(object.blockHeight)).unsigned = true;
                else if (typeof object.blockHeight === "string")
                    message.blockHeight = parseInt(object.blockHeight, 10);
                else if (typeof object.blockHeight === "number")
                    message.blockHeight = object.blockHeight;
                else if (typeof object.blockHeight === "object")
                    message.blockHeight = new $util.LongBits(object.blockHeight.low >>> 0, object.blockHeight.high >>> 0).toNumber(true);
            if (object.blockHash != null)
                if (typeof object.blockHash === "string")
                    $util.base64.decode(object.blockHash, message.blockHash = $util.newBuffer($util.base64.length(object.blockHash)), 0);
                else if (object.blockHash.length >= 0)
                    message.blockHash = object.blockHash;
            if (object.address != null)
                if (typeof object.address === "string")
                    $util.base64.decode(object.address, message.address = $util.newBuffer($util.base64.length(object.address)), 0);
                else if (object.address.length >= 0)
                    message.address = object.address;
            return message;
        };

        /**
         * Creates a plain object from an Event message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Event
         * @static
         * @param {types.Event} message Event
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Event.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.eventType = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.height = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.height = options.longs === String ? "0" : 0;
                object.reference = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.chainId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.chainId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.blockHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.blockHeight = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.blockHash = "";
                else {
                    object.blockHash = [];
                    if (options.bytes !== Array)
                        object.blockHash = $util.newBuffer(object.blockHash);
                }
                if (options.bytes === String)
                    object.address = "";
                else {
                    object.address = [];
                    if (options.bytes !== Array)
                        object.address = $util.newBuffer(object.address);
                }
            }
            if (message.eventType != null && message.hasOwnProperty("eventType"))
                object.eventType = message.eventType;
            if (message.custom != null && message.hasOwnProperty("custom")) {
                object.custom = $root.types.EventCustom.toObject(message.custom, options);
                if (options.oneofs)
                    object.msg = "custom";
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height === "number")
                    object.height = options.longs === String ? String(message.height) : message.height;
                else
                    object.height = options.longs === String ? $util.Long.prototype.toString.call(message.height) : options.longs === Number ? new $util.LongBits(message.height.low >>> 0, message.height.high >>> 0).toNumber(true) : message.height;
            if (message.reference != null && message.hasOwnProperty("reference"))
                object.reference = message.reference;
            if (message.chainId != null && message.hasOwnProperty("chainId"))
                if (typeof message.chainId === "number")
                    object.chainId = options.longs === String ? String(message.chainId) : message.chainId;
                else
                    object.chainId = options.longs === String ? $util.Long.prototype.toString.call(message.chainId) : options.longs === Number ? new $util.LongBits(message.chainId.low >>> 0, message.chainId.high >>> 0).toNumber(true) : message.chainId;
            if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
                if (typeof message.blockHeight === "number")
                    object.blockHeight = options.longs === String ? String(message.blockHeight) : message.blockHeight;
                else
                    object.blockHeight = options.longs === String ? $util.Long.prototype.toString.call(message.blockHeight) : options.longs === Number ? new $util.LongBits(message.blockHeight.low >>> 0, message.blockHeight.high >>> 0).toNumber(true) : message.blockHeight;
            if (message.blockHash != null && message.hasOwnProperty("blockHash"))
                object.blockHash = options.bytes === String ? $util.base64.encode(message.blockHash, 0, message.blockHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.blockHash) : message.blockHash;
            if (message.address != null && message.hasOwnProperty("address"))
                object.address = options.bytes === String ? $util.base64.encode(message.address, 0, message.address.length) : options.bytes === Array ? Array.prototype.slice.call(message.address) : message.address;
            return object;
        };

        /**
         * Converts this Event to JSON.
         * @function toJSON
         * @memberof types.Event
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Event.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Event
         * @function getTypeUrl
         * @memberof types.Event
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Event";
        };

        return Event;
    })();

    types.EventCustom = (function() {

        /**
         * Properties of an EventCustom.
         * @memberof types
         * @interface IEventCustom
         * @property {google.protobuf.IAny|null} [msg] EventCustom msg
         */

        /**
         * Constructs a new EventCustom.
         * @memberof types
         * @classdesc Represents an EventCustom.
         * @implements IEventCustom
         * @constructor
         * @param {types.IEventCustom=} [properties] Properties to set
         */
        function EventCustom(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * EventCustom msg.
         * @member {google.protobuf.IAny|null|undefined} msg
         * @memberof types.EventCustom
         * @instance
         */
        EventCustom.prototype.msg = null;

        /**
         * Creates a new EventCustom instance using the specified properties.
         * @function create
         * @memberof types.EventCustom
         * @static
         * @param {types.IEventCustom=} [properties] Properties to set
         * @returns {types.EventCustom} EventCustom instance
         */
        EventCustom.create = function create(properties) {
            return new EventCustom(properties);
        };

        /**
         * Encodes the specified EventCustom message. Does not implicitly {@link types.EventCustom.verify|verify} messages.
         * @function encode
         * @memberof types.EventCustom
         * @static
         * @param {types.IEventCustom} message EventCustom message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EventCustom.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                $root.google.protobuf.Any.encode(message.msg, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified EventCustom message, length delimited. Does not implicitly {@link types.EventCustom.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.EventCustom
         * @static
         * @param {types.IEventCustom} message EventCustom message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EventCustom.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an EventCustom message from the specified reader or buffer.
         * @function decode
         * @memberof types.EventCustom
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.EventCustom} EventCustom
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EventCustom.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.EventCustom();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.msg = $root.google.protobuf.Any.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an EventCustom message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.EventCustom
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.EventCustom} EventCustom
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EventCustom.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EventCustom message.
         * @function verify
         * @memberof types.EventCustom
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EventCustom.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.msg != null && message.hasOwnProperty("msg")) {
                var error = $root.google.protobuf.Any.verify(message.msg);
                if (error)
                    return "msg." + error;
            }
            return null;
        };

        /**
         * Creates an EventCustom message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.EventCustom
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.EventCustom} EventCustom
         */
        EventCustom.fromObject = function fromObject(object) {
            if (object instanceof $root.types.EventCustom)
                return object;
            var message = new $root.types.EventCustom();
            if (object.msg != null) {
                if (typeof object.msg !== "object")
                    throw TypeError(".types.EventCustom.msg: object expected");
                message.msg = $root.google.protobuf.Any.fromObject(object.msg);
            }
            return message;
        };

        /**
         * Creates a plain object from an EventCustom message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.EventCustom
         * @static
         * @param {types.EventCustom} message EventCustom
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EventCustom.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.msg = null;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = $root.google.protobuf.Any.toObject(message.msg, options);
            return object;
        };

        /**
         * Converts this EventCustom to JSON.
         * @function toJSON
         * @memberof types.EventCustom
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EventCustom.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for EventCustom
         * @function getTypeUrl
         * @memberof types.EventCustom
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        EventCustom.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.EventCustom";
        };

        return EventCustom;
    })();

    /**
     * GameMode enum.
     * @name types.GameMode
     * @enum {number}
     * @property {number} GAME_MODE_UNSPECIFIED=0 GAME_MODE_UNSPECIFIED value
     * @property {number} GAME_MODE_DAILY=1 GAME_MODE_DAILY value
     * @property {number} GAME_MODE_CLASSIC=2 GAME_MODE_CLASSIC value
     */
    types.GameMode = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "GAME_MODE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "GAME_MODE_DAILY"] = 1;
        values[valuesById[2] = "GAME_MODE_CLASSIC"] = 2;
        return values;
    })();

    /**
     * SessionStatus enum.
     * @name types.SessionStatus
     * @enum {number}
     * @property {number} SESSION_STATUS_UNSPECIFIED=0 SESSION_STATUS_UNSPECIFIED value
     * @property {number} SESSION_STATUS_ACTIVE=1 SESSION_STATUS_ACTIVE value
     * @property {number} SESSION_STATUS_COMPLETED=2 SESSION_STATUS_COMPLETED value
     * @property {number} SESSION_STATUS_EXPIRED=3 SESSION_STATUS_EXPIRED value
     */
    types.SessionStatus = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "SESSION_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "SESSION_STATUS_ACTIVE"] = 1;
        values[valuesById[2] = "SESSION_STATUS_COMPLETED"] = 2;
        values[valuesById[3] = "SESSION_STATUS_EXPIRED"] = 3;
        return values;
    })();

    /**
     * StopReason enum.
     * @name types.StopReason
     * @enum {number}
     * @property {number} STOP_REASON_UNSPECIFIED=0 STOP_REASON_UNSPECIFIED value
     * @property {number} STOP_REASON_PLAYER_STOPPED=1 STOP_REASON_PLAYER_STOPPED value
     * @property {number} STOP_REASON_NO_MOVES=2 STOP_REASON_NO_MOVES value
     * @property {number} STOP_REASON_MAX_MOVES=3 STOP_REASON_MAX_MOVES value
     */
    types.StopReason = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "STOP_REASON_UNSPECIFIED"] = 0;
        values[valuesById[1] = "STOP_REASON_PLAYER_STOPPED"] = 1;
        values[valuesById[2] = "STOP_REASON_NO_MOVES"] = 2;
        values[valuesById[3] = "STOP_REASON_MAX_MOVES"] = 3;
        return values;
    })();

    /**
     * MoveDirection enum.
     * @name types.MoveDirection
     * @enum {number}
     * @property {number} MOVE_DIRECTION_UNSPECIFIED=0 MOVE_DIRECTION_UNSPECIFIED value
     * @property {number} MOVE_DIRECTION_UP=1 MOVE_DIRECTION_UP value
     * @property {number} MOVE_DIRECTION_RIGHT=2 MOVE_DIRECTION_RIGHT value
     * @property {number} MOVE_DIRECTION_DOWN=3 MOVE_DIRECTION_DOWN value
     * @property {number} MOVE_DIRECTION_LEFT=4 MOVE_DIRECTION_LEFT value
     */
    types.MoveDirection = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "MOVE_DIRECTION_UNSPECIFIED"] = 0;
        values[valuesById[1] = "MOVE_DIRECTION_UP"] = 1;
        values[valuesById[2] = "MOVE_DIRECTION_RIGHT"] = 2;
        values[valuesById[3] = "MOVE_DIRECTION_DOWN"] = 3;
        values[valuesById[4] = "MOVE_DIRECTION_LEFT"] = 4;
        return values;
    })();

    types.MessageStartDailyGame = (function() {

        /**
         * Properties of a MessageStartDailyGame.
         * @memberof types
         * @interface IMessageStartDailyGame
         * @property {Uint8Array|null} [playerAddress] MessageStartDailyGame playerAddress
         * @property {string|null} [utcDate] MessageStartDailyGame utcDate
         * @property {Uint8Array|null} [gameId] MessageStartDailyGame gameId
         */

        /**
         * Constructs a new MessageStartDailyGame.
         * @memberof types
         * @classdesc Represents a MessageStartDailyGame.
         * @implements IMessageStartDailyGame
         * @constructor
         * @param {types.IMessageStartDailyGame=} [properties] Properties to set
         */
        function MessageStartDailyGame(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageStartDailyGame playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageStartDailyGame
         * @instance
         */
        MessageStartDailyGame.prototype.playerAddress = $util.newBuffer([]);

        /**
         * MessageStartDailyGame utcDate.
         * @member {string} utcDate
         * @memberof types.MessageStartDailyGame
         * @instance
         */
        MessageStartDailyGame.prototype.utcDate = "";

        /**
         * MessageStartDailyGame gameId.
         * @member {Uint8Array} gameId
         * @memberof types.MessageStartDailyGame
         * @instance
         */
        MessageStartDailyGame.prototype.gameId = $util.newBuffer([]);

        /**
         * Creates a new MessageStartDailyGame instance using the specified properties.
         * @function create
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {types.IMessageStartDailyGame=} [properties] Properties to set
         * @returns {types.MessageStartDailyGame} MessageStartDailyGame instance
         */
        MessageStartDailyGame.create = function create(properties) {
            return new MessageStartDailyGame(properties);
        };

        /**
         * Encodes the specified MessageStartDailyGame message. Does not implicitly {@link types.MessageStartDailyGame.verify|verify} messages.
         * @function encode
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {types.IMessageStartDailyGame} message MessageStartDailyGame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageStartDailyGame.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.utcDate);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.gameId);
            return writer;
        };

        /**
         * Encodes the specified MessageStartDailyGame message, length delimited. Does not implicitly {@link types.MessageStartDailyGame.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {types.IMessageStartDailyGame} message MessageStartDailyGame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageStartDailyGame.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageStartDailyGame message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageStartDailyGame} MessageStartDailyGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageStartDailyGame.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageStartDailyGame();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 3: {
                        message.gameId = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageStartDailyGame message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageStartDailyGame} MessageStartDailyGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageStartDailyGame.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageStartDailyGame message.
         * @function verify
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageStartDailyGame.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            return null;
        };

        /**
         * Creates a MessageStartDailyGame message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageStartDailyGame} MessageStartDailyGame
         */
        MessageStartDailyGame.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageStartDailyGame)
                return object;
            var message = new $root.types.MessageStartDailyGame();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            return message;
        };

        /**
         * Creates a plain object from a MessageStartDailyGame message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {types.MessageStartDailyGame} message MessageStartDailyGame
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageStartDailyGame.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                object.utcDate = "";
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            return object;
        };

        /**
         * Converts this MessageStartDailyGame to JSON.
         * @function toJSON
         * @memberof types.MessageStartDailyGame
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageStartDailyGame.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageStartDailyGame
         * @function getTypeUrl
         * @memberof types.MessageStartDailyGame
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageStartDailyGame.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageStartDailyGame";
        };

        return MessageStartDailyGame;
    })();

    types.MessageStartClassicGame = (function() {

        /**
         * Properties of a MessageStartClassicGame.
         * @memberof types
         * @interface IMessageStartClassicGame
         * @property {Uint8Array|null} [playerAddress] MessageStartClassicGame playerAddress
         * @property {Uint8Array|null} [gameId] MessageStartClassicGame gameId
         */

        /**
         * Constructs a new MessageStartClassicGame.
         * @memberof types
         * @classdesc Represents a MessageStartClassicGame.
         * @implements IMessageStartClassicGame
         * @constructor
         * @param {types.IMessageStartClassicGame=} [properties] Properties to set
         */
        function MessageStartClassicGame(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageStartClassicGame playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageStartClassicGame
         * @instance
         */
        MessageStartClassicGame.prototype.playerAddress = $util.newBuffer([]);

        /**
         * MessageStartClassicGame gameId.
         * @member {Uint8Array} gameId
         * @memberof types.MessageStartClassicGame
         * @instance
         */
        MessageStartClassicGame.prototype.gameId = $util.newBuffer([]);

        /**
         * Creates a new MessageStartClassicGame instance using the specified properties.
         * @function create
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {types.IMessageStartClassicGame=} [properties] Properties to set
         * @returns {types.MessageStartClassicGame} MessageStartClassicGame instance
         */
        MessageStartClassicGame.create = function create(properties) {
            return new MessageStartClassicGame(properties);
        };

        /**
         * Encodes the specified MessageStartClassicGame message. Does not implicitly {@link types.MessageStartClassicGame.verify|verify} messages.
         * @function encode
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {types.IMessageStartClassicGame} message MessageStartClassicGame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageStartClassicGame.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.gameId);
            return writer;
        };

        /**
         * Encodes the specified MessageStartClassicGame message, length delimited. Does not implicitly {@link types.MessageStartClassicGame.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {types.IMessageStartClassicGame} message MessageStartClassicGame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageStartClassicGame.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageStartClassicGame message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageStartClassicGame} MessageStartClassicGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageStartClassicGame.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageStartClassicGame();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.gameId = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageStartClassicGame message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageStartClassicGame} MessageStartClassicGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageStartClassicGame.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageStartClassicGame message.
         * @function verify
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageStartClassicGame.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            return null;
        };

        /**
         * Creates a MessageStartClassicGame message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageStartClassicGame} MessageStartClassicGame
         */
        MessageStartClassicGame.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageStartClassicGame)
                return object;
            var message = new $root.types.MessageStartClassicGame();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            return message;
        };

        /**
         * Creates a plain object from a MessageStartClassicGame message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {types.MessageStartClassicGame} message MessageStartClassicGame
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageStartClassicGame.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            return object;
        };

        /**
         * Converts this MessageStartClassicGame to JSON.
         * @function toJSON
         * @memberof types.MessageStartClassicGame
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageStartClassicGame.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageStartClassicGame
         * @function getTypeUrl
         * @memberof types.MessageStartClassicGame
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageStartClassicGame.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageStartClassicGame";
        };

        return MessageStartClassicGame;
    })();

    types.MessageSubmitGameResult = (function() {

        /**
         * Properties of a MessageSubmitGameResult.
         * @memberof types
         * @interface IMessageSubmitGameResult
         * @property {Uint8Array|null} [playerAddress] MessageSubmitGameResult playerAddress
         * @property {Uint8Array|null} [gameId] MessageSubmitGameResult gameId
         * @property {Array.<types.MoveDirection>|null} [moves] MessageSubmitGameResult moves
         * @property {number|Long|null} [declaredScore] MessageSubmitGameResult declaredScore
         * @property {number|Long|null} [declaredMaxTile] MessageSubmitGameResult declaredMaxTile
         * @property {types.StopReason|null} [stopReason] MessageSubmitGameResult stopReason
         */

        /**
         * Constructs a new MessageSubmitGameResult.
         * @memberof types
         * @classdesc Represents a MessageSubmitGameResult.
         * @implements IMessageSubmitGameResult
         * @constructor
         * @param {types.IMessageSubmitGameResult=} [properties] Properties to set
         */
        function MessageSubmitGameResult(properties) {
            this.moves = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageSubmitGameResult playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageSubmitGameResult
         * @instance
         */
        MessageSubmitGameResult.prototype.playerAddress = $util.newBuffer([]);

        /**
         * MessageSubmitGameResult gameId.
         * @member {Uint8Array} gameId
         * @memberof types.MessageSubmitGameResult
         * @instance
         */
        MessageSubmitGameResult.prototype.gameId = $util.newBuffer([]);

        /**
         * MessageSubmitGameResult moves.
         * @member {Array.<types.MoveDirection>} moves
         * @memberof types.MessageSubmitGameResult
         * @instance
         */
        MessageSubmitGameResult.prototype.moves = $util.emptyArray;

        /**
         * MessageSubmitGameResult declaredScore.
         * @member {number|Long} declaredScore
         * @memberof types.MessageSubmitGameResult
         * @instance
         */
        MessageSubmitGameResult.prototype.declaredScore = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MessageSubmitGameResult declaredMaxTile.
         * @member {number|Long} declaredMaxTile
         * @memberof types.MessageSubmitGameResult
         * @instance
         */
        MessageSubmitGameResult.prototype.declaredMaxTile = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MessageSubmitGameResult stopReason.
         * @member {types.StopReason} stopReason
         * @memberof types.MessageSubmitGameResult
         * @instance
         */
        MessageSubmitGameResult.prototype.stopReason = 0;

        /**
         * Creates a new MessageSubmitGameResult instance using the specified properties.
         * @function create
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {types.IMessageSubmitGameResult=} [properties] Properties to set
         * @returns {types.MessageSubmitGameResult} MessageSubmitGameResult instance
         */
        MessageSubmitGameResult.create = function create(properties) {
            return new MessageSubmitGameResult(properties);
        };

        /**
         * Encodes the specified MessageSubmitGameResult message. Does not implicitly {@link types.MessageSubmitGameResult.verify|verify} messages.
         * @function encode
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {types.IMessageSubmitGameResult} message MessageSubmitGameResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSubmitGameResult.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.gameId);
            if (message.moves != null && message.moves.length) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork();
                for (var i = 0; i < message.moves.length; ++i)
                    writer.int32(message.moves[i]);
                writer.ldelim();
            }
            if (message.declaredScore != null && Object.hasOwnProperty.call(message, "declaredScore"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.declaredScore);
            if (message.declaredMaxTile != null && Object.hasOwnProperty.call(message, "declaredMaxTile"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.declaredMaxTile);
            if (message.stopReason != null && Object.hasOwnProperty.call(message, "stopReason"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.stopReason);
            return writer;
        };

        /**
         * Encodes the specified MessageSubmitGameResult message, length delimited. Does not implicitly {@link types.MessageSubmitGameResult.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {types.IMessageSubmitGameResult} message MessageSubmitGameResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSubmitGameResult.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageSubmitGameResult message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageSubmitGameResult} MessageSubmitGameResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSubmitGameResult.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageSubmitGameResult();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.gameId = reader.bytes();
                        break;
                    }
                case 3: {
                        if (!(message.moves && message.moves.length))
                            message.moves = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.moves.push(reader.int32());
                        } else
                            message.moves.push(reader.int32());
                        break;
                    }
                case 4: {
                        message.declaredScore = reader.uint64();
                        break;
                    }
                case 5: {
                        message.declaredMaxTile = reader.uint64();
                        break;
                    }
                case 6: {
                        message.stopReason = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageSubmitGameResult message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageSubmitGameResult} MessageSubmitGameResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSubmitGameResult.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageSubmitGameResult message.
         * @function verify
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageSubmitGameResult.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            if (message.moves != null && message.hasOwnProperty("moves")) {
                if (!Array.isArray(message.moves))
                    return "moves: array expected";
                for (var i = 0; i < message.moves.length; ++i)
                    switch (message.moves[i]) {
                    default:
                        return "moves: enum value[] expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
            }
            if (message.declaredScore != null && message.hasOwnProperty("declaredScore"))
                if (!$util.isInteger(message.declaredScore) && !(message.declaredScore && $util.isInteger(message.declaredScore.low) && $util.isInteger(message.declaredScore.high)))
                    return "declaredScore: integer|Long expected";
            if (message.declaredMaxTile != null && message.hasOwnProperty("declaredMaxTile"))
                if (!$util.isInteger(message.declaredMaxTile) && !(message.declaredMaxTile && $util.isInteger(message.declaredMaxTile.low) && $util.isInteger(message.declaredMaxTile.high)))
                    return "declaredMaxTile: integer|Long expected";
            if (message.stopReason != null && message.hasOwnProperty("stopReason"))
                switch (message.stopReason) {
                default:
                    return "stopReason: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            return null;
        };

        /**
         * Creates a MessageSubmitGameResult message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageSubmitGameResult} MessageSubmitGameResult
         */
        MessageSubmitGameResult.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageSubmitGameResult)
                return object;
            var message = new $root.types.MessageSubmitGameResult();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            if (object.moves) {
                if (!Array.isArray(object.moves))
                    throw TypeError(".types.MessageSubmitGameResult.moves: array expected");
                message.moves = [];
                for (var i = 0; i < object.moves.length; ++i)
                    switch (object.moves[i]) {
                    default:
                        if (typeof object.moves[i] === "number") {
                            message.moves[i] = object.moves[i];
                            break;
                        }
                    case "MOVE_DIRECTION_UNSPECIFIED":
                    case 0:
                        message.moves[i] = 0;
                        break;
                    case "MOVE_DIRECTION_UP":
                    case 1:
                        message.moves[i] = 1;
                        break;
                    case "MOVE_DIRECTION_RIGHT":
                    case 2:
                        message.moves[i] = 2;
                        break;
                    case "MOVE_DIRECTION_DOWN":
                    case 3:
                        message.moves[i] = 3;
                        break;
                    case "MOVE_DIRECTION_LEFT":
                    case 4:
                        message.moves[i] = 4;
                        break;
                    }
            }
            if (object.declaredScore != null)
                if ($util.Long)
                    (message.declaredScore = $util.Long.fromValue(object.declaredScore)).unsigned = true;
                else if (typeof object.declaredScore === "string")
                    message.declaredScore = parseInt(object.declaredScore, 10);
                else if (typeof object.declaredScore === "number")
                    message.declaredScore = object.declaredScore;
                else if (typeof object.declaredScore === "object")
                    message.declaredScore = new $util.LongBits(object.declaredScore.low >>> 0, object.declaredScore.high >>> 0).toNumber(true);
            if (object.declaredMaxTile != null)
                if ($util.Long)
                    (message.declaredMaxTile = $util.Long.fromValue(object.declaredMaxTile)).unsigned = true;
                else if (typeof object.declaredMaxTile === "string")
                    message.declaredMaxTile = parseInt(object.declaredMaxTile, 10);
                else if (typeof object.declaredMaxTile === "number")
                    message.declaredMaxTile = object.declaredMaxTile;
                else if (typeof object.declaredMaxTile === "object")
                    message.declaredMaxTile = new $util.LongBits(object.declaredMaxTile.low >>> 0, object.declaredMaxTile.high >>> 0).toNumber(true);
            switch (object.stopReason) {
            default:
                if (typeof object.stopReason === "number") {
                    message.stopReason = object.stopReason;
                    break;
                }
                break;
            case "STOP_REASON_UNSPECIFIED":
            case 0:
                message.stopReason = 0;
                break;
            case "STOP_REASON_PLAYER_STOPPED":
            case 1:
                message.stopReason = 1;
                break;
            case "STOP_REASON_NO_MOVES":
            case 2:
                message.stopReason = 2;
                break;
            case "STOP_REASON_MAX_MOVES":
            case 3:
                message.stopReason = 3;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a MessageSubmitGameResult message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {types.MessageSubmitGameResult} message MessageSubmitGameResult
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageSubmitGameResult.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.moves = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.declaredScore = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.declaredScore = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.declaredMaxTile = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.declaredMaxTile = options.longs === String ? "0" : 0;
                object.stopReason = options.enums === String ? "STOP_REASON_UNSPECIFIED" : 0;
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            if (message.moves && message.moves.length) {
                object.moves = [];
                for (var j = 0; j < message.moves.length; ++j)
                    object.moves[j] = options.enums === String ? $root.types.MoveDirection[message.moves[j]] === undefined ? message.moves[j] : $root.types.MoveDirection[message.moves[j]] : message.moves[j];
            }
            if (message.declaredScore != null && message.hasOwnProperty("declaredScore"))
                if (typeof message.declaredScore === "number")
                    object.declaredScore = options.longs === String ? String(message.declaredScore) : message.declaredScore;
                else
                    object.declaredScore = options.longs === String ? $util.Long.prototype.toString.call(message.declaredScore) : options.longs === Number ? new $util.LongBits(message.declaredScore.low >>> 0, message.declaredScore.high >>> 0).toNumber(true) : message.declaredScore;
            if (message.declaredMaxTile != null && message.hasOwnProperty("declaredMaxTile"))
                if (typeof message.declaredMaxTile === "number")
                    object.declaredMaxTile = options.longs === String ? String(message.declaredMaxTile) : message.declaredMaxTile;
                else
                    object.declaredMaxTile = options.longs === String ? $util.Long.prototype.toString.call(message.declaredMaxTile) : options.longs === Number ? new $util.LongBits(message.declaredMaxTile.low >>> 0, message.declaredMaxTile.high >>> 0).toNumber(true) : message.declaredMaxTile;
            if (message.stopReason != null && message.hasOwnProperty("stopReason"))
                object.stopReason = options.enums === String ? $root.types.StopReason[message.stopReason] === undefined ? message.stopReason : $root.types.StopReason[message.stopReason] : message.stopReason;
            return object;
        };

        /**
         * Converts this MessageSubmitGameResult to JSON.
         * @function toJSON
         * @memberof types.MessageSubmitGameResult
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageSubmitGameResult.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageSubmitGameResult
         * @function getTypeUrl
         * @memberof types.MessageSubmitGameResult
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageSubmitGameResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageSubmitGameResult";
        };

        return MessageSubmitGameResult;
    })();

    types.MessageClaimDailyReward = (function() {

        /**
         * Properties of a MessageClaimDailyReward.
         * @memberof types
         * @interface IMessageClaimDailyReward
         * @property {Uint8Array|null} [playerAddress] MessageClaimDailyReward playerAddress
         * @property {string|null} [utcDate] MessageClaimDailyReward utcDate
         */

        /**
         * Constructs a new MessageClaimDailyReward.
         * @memberof types
         * @classdesc Represents a MessageClaimDailyReward.
         * @implements IMessageClaimDailyReward
         * @constructor
         * @param {types.IMessageClaimDailyReward=} [properties] Properties to set
         */
        function MessageClaimDailyReward(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageClaimDailyReward playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageClaimDailyReward
         * @instance
         */
        MessageClaimDailyReward.prototype.playerAddress = $util.newBuffer([]);

        /**
         * MessageClaimDailyReward utcDate.
         * @member {string} utcDate
         * @memberof types.MessageClaimDailyReward
         * @instance
         */
        MessageClaimDailyReward.prototype.utcDate = "";

        /**
         * Creates a new MessageClaimDailyReward instance using the specified properties.
         * @function create
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {types.IMessageClaimDailyReward=} [properties] Properties to set
         * @returns {types.MessageClaimDailyReward} MessageClaimDailyReward instance
         */
        MessageClaimDailyReward.create = function create(properties) {
            return new MessageClaimDailyReward(properties);
        };

        /**
         * Encodes the specified MessageClaimDailyReward message. Does not implicitly {@link types.MessageClaimDailyReward.verify|verify} messages.
         * @function encode
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {types.IMessageClaimDailyReward} message MessageClaimDailyReward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageClaimDailyReward.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.utcDate);
            return writer;
        };

        /**
         * Encodes the specified MessageClaimDailyReward message, length delimited. Does not implicitly {@link types.MessageClaimDailyReward.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {types.IMessageClaimDailyReward} message MessageClaimDailyReward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageClaimDailyReward.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageClaimDailyReward message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageClaimDailyReward} MessageClaimDailyReward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageClaimDailyReward.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageClaimDailyReward();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.utcDate = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageClaimDailyReward message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageClaimDailyReward} MessageClaimDailyReward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageClaimDailyReward.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageClaimDailyReward message.
         * @function verify
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageClaimDailyReward.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            return null;
        };

        /**
         * Creates a MessageClaimDailyReward message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageClaimDailyReward} MessageClaimDailyReward
         */
        MessageClaimDailyReward.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageClaimDailyReward)
                return object;
            var message = new $root.types.MessageClaimDailyReward();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            return message;
        };

        /**
         * Creates a plain object from a MessageClaimDailyReward message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {types.MessageClaimDailyReward} message MessageClaimDailyReward
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageClaimDailyReward.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                object.utcDate = "";
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            return object;
        };

        /**
         * Converts this MessageClaimDailyReward to JSON.
         * @function toJSON
         * @memberof types.MessageClaimDailyReward
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageClaimDailyReward.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageClaimDailyReward
         * @function getTypeUrl
         * @memberof types.MessageClaimDailyReward
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageClaimDailyReward.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageClaimDailyReward";
        };

        return MessageClaimDailyReward;
    })();

    types.MessageRedeemClassicPoints = (function() {

        /**
         * Properties of a MessageRedeemClassicPoints.
         * @memberof types
         * @interface IMessageRedeemClassicPoints
         * @property {Uint8Array|null} [playerAddress] MessageRedeemClassicPoints playerAddress
         * @property {number|Long|null} [burnPoints] MessageRedeemClassicPoints burnPoints
         */

        /**
         * Constructs a new MessageRedeemClassicPoints.
         * @memberof types
         * @classdesc Represents a MessageRedeemClassicPoints.
         * @implements IMessageRedeemClassicPoints
         * @constructor
         * @param {types.IMessageRedeemClassicPoints=} [properties] Properties to set
         */
        function MessageRedeemClassicPoints(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageRedeemClassicPoints playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageRedeemClassicPoints
         * @instance
         */
        MessageRedeemClassicPoints.prototype.playerAddress = $util.newBuffer([]);

        /**
         * MessageRedeemClassicPoints burnPoints.
         * @member {number|Long} burnPoints
         * @memberof types.MessageRedeemClassicPoints
         * @instance
         */
        MessageRedeemClassicPoints.prototype.burnPoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new MessageRedeemClassicPoints instance using the specified properties.
         * @function create
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {types.IMessageRedeemClassicPoints=} [properties] Properties to set
         * @returns {types.MessageRedeemClassicPoints} MessageRedeemClassicPoints instance
         */
        MessageRedeemClassicPoints.create = function create(properties) {
            return new MessageRedeemClassicPoints(properties);
        };

        /**
         * Encodes the specified MessageRedeemClassicPoints message. Does not implicitly {@link types.MessageRedeemClassicPoints.verify|verify} messages.
         * @function encode
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {types.IMessageRedeemClassicPoints} message MessageRedeemClassicPoints message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageRedeemClassicPoints.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.burnPoints != null && Object.hasOwnProperty.call(message, "burnPoints"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.burnPoints);
            return writer;
        };

        /**
         * Encodes the specified MessageRedeemClassicPoints message, length delimited. Does not implicitly {@link types.MessageRedeemClassicPoints.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {types.IMessageRedeemClassicPoints} message MessageRedeemClassicPoints message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageRedeemClassicPoints.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageRedeemClassicPoints message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageRedeemClassicPoints} MessageRedeemClassicPoints
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageRedeemClassicPoints.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageRedeemClassicPoints();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.burnPoints = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageRedeemClassicPoints message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageRedeemClassicPoints} MessageRedeemClassicPoints
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageRedeemClassicPoints.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageRedeemClassicPoints message.
         * @function verify
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageRedeemClassicPoints.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.burnPoints != null && message.hasOwnProperty("burnPoints"))
                if (!$util.isInteger(message.burnPoints) && !(message.burnPoints && $util.isInteger(message.burnPoints.low) && $util.isInteger(message.burnPoints.high)))
                    return "burnPoints: integer|Long expected";
            return null;
        };

        /**
         * Creates a MessageRedeemClassicPoints message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageRedeemClassicPoints} MessageRedeemClassicPoints
         */
        MessageRedeemClassicPoints.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageRedeemClassicPoints)
                return object;
            var message = new $root.types.MessageRedeemClassicPoints();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.burnPoints != null)
                if ($util.Long)
                    (message.burnPoints = $util.Long.fromValue(object.burnPoints)).unsigned = true;
                else if (typeof object.burnPoints === "string")
                    message.burnPoints = parseInt(object.burnPoints, 10);
                else if (typeof object.burnPoints === "number")
                    message.burnPoints = object.burnPoints;
                else if (typeof object.burnPoints === "object")
                    message.burnPoints = new $util.LongBits(object.burnPoints.low >>> 0, object.burnPoints.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a MessageRedeemClassicPoints message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {types.MessageRedeemClassicPoints} message MessageRedeemClassicPoints
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageRedeemClassicPoints.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.burnPoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.burnPoints = options.longs === String ? "0" : 0;
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.burnPoints != null && message.hasOwnProperty("burnPoints"))
                if (typeof message.burnPoints === "number")
                    object.burnPoints = options.longs === String ? String(message.burnPoints) : message.burnPoints;
                else
                    object.burnPoints = options.longs === String ? $util.Long.prototype.toString.call(message.burnPoints) : options.longs === Number ? new $util.LongBits(message.burnPoints.low >>> 0, message.burnPoints.high >>> 0).toNumber(true) : message.burnPoints;
            return object;
        };

        /**
         * Converts this MessageRedeemClassicPoints to JSON.
         * @function toJSON
         * @memberof types.MessageRedeemClassicPoints
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageRedeemClassicPoints.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageRedeemClassicPoints
         * @function getTypeUrl
         * @memberof types.MessageRedeemClassicPoints
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageRedeemClassicPoints.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageRedeemClassicPoints";
        };

        return MessageRedeemClassicPoints;
    })();

    types.MessageClaimDailyLoginReward = (function() {

        /**
         * Properties of a MessageClaimDailyLoginReward.
         * @memberof types
         * @interface IMessageClaimDailyLoginReward
         * @property {Uint8Array|null} [playerAddress] MessageClaimDailyLoginReward playerAddress
         */

        /**
         * Constructs a new MessageClaimDailyLoginReward.
         * @memberof types
         * @classdesc Represents a MessageClaimDailyLoginReward.
         * @implements IMessageClaimDailyLoginReward
         * @constructor
         * @param {types.IMessageClaimDailyLoginReward=} [properties] Properties to set
         */
        function MessageClaimDailyLoginReward(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageClaimDailyLoginReward playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageClaimDailyLoginReward
         * @instance
         */
        MessageClaimDailyLoginReward.prototype.playerAddress = $util.newBuffer([]);

        /**
         * Creates a new MessageClaimDailyLoginReward instance using the specified properties.
         * @function create
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {types.IMessageClaimDailyLoginReward=} [properties] Properties to set
         * @returns {types.MessageClaimDailyLoginReward} MessageClaimDailyLoginReward instance
         */
        MessageClaimDailyLoginReward.create = function create(properties) {
            return new MessageClaimDailyLoginReward(properties);
        };

        /**
         * Encodes the specified MessageClaimDailyLoginReward message. Does not implicitly {@link types.MessageClaimDailyLoginReward.verify|verify} messages.
         * @function encode
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {types.IMessageClaimDailyLoginReward} message MessageClaimDailyLoginReward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageClaimDailyLoginReward.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            return writer;
        };

        /**
         * Encodes the specified MessageClaimDailyLoginReward message, length delimited. Does not implicitly {@link types.MessageClaimDailyLoginReward.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {types.IMessageClaimDailyLoginReward} message MessageClaimDailyLoginReward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageClaimDailyLoginReward.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageClaimDailyLoginReward message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageClaimDailyLoginReward} MessageClaimDailyLoginReward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageClaimDailyLoginReward.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageClaimDailyLoginReward();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageClaimDailyLoginReward message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageClaimDailyLoginReward} MessageClaimDailyLoginReward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageClaimDailyLoginReward.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageClaimDailyLoginReward message.
         * @function verify
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageClaimDailyLoginReward.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            return null;
        };

        /**
         * Creates a MessageClaimDailyLoginReward message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageClaimDailyLoginReward} MessageClaimDailyLoginReward
         */
        MessageClaimDailyLoginReward.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageClaimDailyLoginReward)
                return object;
            var message = new $root.types.MessageClaimDailyLoginReward();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            return message;
        };

        /**
         * Creates a plain object from a MessageClaimDailyLoginReward message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {types.MessageClaimDailyLoginReward} message MessageClaimDailyLoginReward
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageClaimDailyLoginReward.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            return object;
        };

        /**
         * Converts this MessageClaimDailyLoginReward to JSON.
         * @function toJSON
         * @memberof types.MessageClaimDailyLoginReward
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageClaimDailyLoginReward.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageClaimDailyLoginReward
         * @function getTypeUrl
         * @memberof types.MessageClaimDailyLoginReward
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageClaimDailyLoginReward.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageClaimDailyLoginReward";
        };

        return MessageClaimDailyLoginReward;
    })();

    types.MessageSetUsername = (function() {

        /**
         * Properties of a MessageSetUsername.
         * @memberof types
         * @interface IMessageSetUsername
         * @property {Uint8Array|null} [playerAddress] MessageSetUsername playerAddress
         * @property {string|null} [username] MessageSetUsername username
         */

        /**
         * Constructs a new MessageSetUsername.
         * @memberof types
         * @classdesc Represents a MessageSetUsername.
         * @implements IMessageSetUsername
         * @constructor
         * @param {types.IMessageSetUsername=} [properties] Properties to set
         */
        function MessageSetUsername(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageSetUsername playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.MessageSetUsername
         * @instance
         */
        MessageSetUsername.prototype.playerAddress = $util.newBuffer([]);

        /**
         * MessageSetUsername username.
         * @member {string} username
         * @memberof types.MessageSetUsername
         * @instance
         */
        MessageSetUsername.prototype.username = "";

        /**
         * Creates a new MessageSetUsername instance using the specified properties.
         * @function create
         * @memberof types.MessageSetUsername
         * @static
         * @param {types.IMessageSetUsername=} [properties] Properties to set
         * @returns {types.MessageSetUsername} MessageSetUsername instance
         */
        MessageSetUsername.create = function create(properties) {
            return new MessageSetUsername(properties);
        };

        /**
         * Encodes the specified MessageSetUsername message. Does not implicitly {@link types.MessageSetUsername.verify|verify} messages.
         * @function encode
         * @memberof types.MessageSetUsername
         * @static
         * @param {types.IMessageSetUsername} message MessageSetUsername message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSetUsername.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
            return writer;
        };

        /**
         * Encodes the specified MessageSetUsername message, length delimited. Does not implicitly {@link types.MessageSetUsername.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageSetUsername
         * @static
         * @param {types.IMessageSetUsername} message MessageSetUsername message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSetUsername.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageSetUsername message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageSetUsername
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageSetUsername} MessageSetUsername
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSetUsername.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageSetUsername();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.username = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageSetUsername message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageSetUsername
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageSetUsername} MessageSetUsername
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSetUsername.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageSetUsername message.
         * @function verify
         * @memberof types.MessageSetUsername
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageSetUsername.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            return null;
        };

        /**
         * Creates a MessageSetUsername message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageSetUsername
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageSetUsername} MessageSetUsername
         */
        MessageSetUsername.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageSetUsername)
                return object;
            var message = new $root.types.MessageSetUsername();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.username != null)
                message.username = String(object.username);
            return message;
        };

        /**
         * Creates a plain object from a MessageSetUsername message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageSetUsername
         * @static
         * @param {types.MessageSetUsername} message MessageSetUsername
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageSetUsername.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                object.username = "";
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            return object;
        };

        /**
         * Converts this MessageSetUsername to JSON.
         * @function toJSON
         * @memberof types.MessageSetUsername
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageSetUsername.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageSetUsername
         * @function getTypeUrl
         * @memberof types.MessageSetUsername
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageSetUsername.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageSetUsername";
        };

        return MessageSetUsername;
    })();

    types.GameConfig = (function() {

        /**
         * Properties of a GameConfig.
         * @memberof types
         * @interface IGameConfig
         * @property {number|Long|null} [classicStartFee] GameConfig classicStartFee
         * @property {number|Long|null} [dailyStartFee] GameConfig dailyStartFee
         * @property {number|Long|null} [dailyMaxMoves] GameConfig dailyMaxMoves
         * @property {number|Long|null} [classicLeaderboardSize] GameConfig classicLeaderboardSize
         * @property {number|Long|null} [dailyLeaderboardSize] GameConfig dailyLeaderboardSize
         * @property {Uint8Array|null} [platformTreasuryAddress] GameConfig platformTreasuryAddress
         * @property {number|Long|null} [dailyPlatformFeeBps] GameConfig dailyPlatformFeeBps
         * @property {Array.<number|Long>|null} [dailyPayoutBps] GameConfig dailyPayoutBps
         * @property {number|Long|null} [classicDailyPointsCap] GameConfig classicDailyPointsCap
         * @property {number|Long|null} [shopRedemptionRatePoints] GameConfig shopRedemptionRatePoints
         * @property {number|Long|null} [shopRedemptionRateCnpy] GameConfig shopRedemptionRateCnpy
         * @property {number|Long|null} [shopMinRedeemPoints] GameConfig shopMinRedeemPoints
         * @property {number|Long|null} [shopRedeemStepPoints] GameConfig shopRedeemStepPoints
         * @property {number|Long|null} [dailyRewardFeeBps] GameConfig dailyRewardFeeBps
         * @property {number|Long|null} [dailyReserveFeeBps] GameConfig dailyReserveFeeBps
         * @property {number|Long|null} [dailyShopFeeBps] GameConfig dailyShopFeeBps
         * @property {number|Long|null} [classicPlatformFeeBps] GameConfig classicPlatformFeeBps
         * @property {number|Long|null} [classicReserveFeeBps] GameConfig classicReserveFeeBps
         * @property {number|Long|null} [classicShopFeeBps] GameConfig classicShopFeeBps
         * @property {Array.<number|Long>|null} [dailyLoginRewardPoints] GameConfig dailyLoginRewardPoints
         * @property {number|Long|null} [dailyLoginBonusBps] GameConfig dailyLoginBonusBps
         */

        /**
         * Constructs a new GameConfig.
         * @memberof types
         * @classdesc Represents a GameConfig.
         * @implements IGameConfig
         * @constructor
         * @param {types.IGameConfig=} [properties] Properties to set
         */
        function GameConfig(properties) {
            this.dailyPayoutBps = [];
            this.dailyLoginRewardPoints = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameConfig classicStartFee.
         * @member {number|Long} classicStartFee
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.classicStartFee = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyStartFee.
         * @member {number|Long} dailyStartFee
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyStartFee = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyMaxMoves.
         * @member {number|Long} dailyMaxMoves
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyMaxMoves = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig classicLeaderboardSize.
         * @member {number|Long} classicLeaderboardSize
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.classicLeaderboardSize = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyLeaderboardSize.
         * @member {number|Long} dailyLeaderboardSize
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyLeaderboardSize = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig platformTreasuryAddress.
         * @member {Uint8Array} platformTreasuryAddress
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.platformTreasuryAddress = $util.newBuffer([]);

        /**
         * GameConfig dailyPlatformFeeBps.
         * @member {number|Long} dailyPlatformFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyPlatformFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyPayoutBps.
         * @member {Array.<number|Long>} dailyPayoutBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyPayoutBps = $util.emptyArray;

        /**
         * GameConfig classicDailyPointsCap.
         * @member {number|Long} classicDailyPointsCap
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.classicDailyPointsCap = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig shopRedemptionRatePoints.
         * @member {number|Long} shopRedemptionRatePoints
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.shopRedemptionRatePoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig shopRedemptionRateCnpy.
         * @member {number|Long} shopRedemptionRateCnpy
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.shopRedemptionRateCnpy = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig shopMinRedeemPoints.
         * @member {number|Long} shopMinRedeemPoints
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.shopMinRedeemPoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig shopRedeemStepPoints.
         * @member {number|Long} shopRedeemStepPoints
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.shopRedeemStepPoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyRewardFeeBps.
         * @member {number|Long} dailyRewardFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyRewardFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyReserveFeeBps.
         * @member {number|Long} dailyReserveFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyReserveFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyShopFeeBps.
         * @member {number|Long} dailyShopFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyShopFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig classicPlatformFeeBps.
         * @member {number|Long} classicPlatformFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.classicPlatformFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig classicReserveFeeBps.
         * @member {number|Long} classicReserveFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.classicReserveFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig classicShopFeeBps.
         * @member {number|Long} classicShopFeeBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.classicShopFeeBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameConfig dailyLoginRewardPoints.
         * @member {Array.<number|Long>} dailyLoginRewardPoints
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyLoginRewardPoints = $util.emptyArray;

        /**
         * GameConfig dailyLoginBonusBps.
         * @member {number|Long} dailyLoginBonusBps
         * @memberof types.GameConfig
         * @instance
         */
        GameConfig.prototype.dailyLoginBonusBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new GameConfig instance using the specified properties.
         * @function create
         * @memberof types.GameConfig
         * @static
         * @param {types.IGameConfig=} [properties] Properties to set
         * @returns {types.GameConfig} GameConfig instance
         */
        GameConfig.create = function create(properties) {
            return new GameConfig(properties);
        };

        /**
         * Encodes the specified GameConfig message. Does not implicitly {@link types.GameConfig.verify|verify} messages.
         * @function encode
         * @memberof types.GameConfig
         * @static
         * @param {types.IGameConfig} message GameConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.classicStartFee != null && Object.hasOwnProperty.call(message, "classicStartFee"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.classicStartFee);
            if (message.dailyStartFee != null && Object.hasOwnProperty.call(message, "dailyStartFee"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.dailyStartFee);
            if (message.dailyMaxMoves != null && Object.hasOwnProperty.call(message, "dailyMaxMoves"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.dailyMaxMoves);
            if (message.classicLeaderboardSize != null && Object.hasOwnProperty.call(message, "classicLeaderboardSize"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.classicLeaderboardSize);
            if (message.dailyLeaderboardSize != null && Object.hasOwnProperty.call(message, "dailyLeaderboardSize"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.dailyLeaderboardSize);
            if (message.platformTreasuryAddress != null && Object.hasOwnProperty.call(message, "platformTreasuryAddress"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.platformTreasuryAddress);
            if (message.dailyPlatformFeeBps != null && Object.hasOwnProperty.call(message, "dailyPlatformFeeBps"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.dailyPlatformFeeBps);
            if (message.dailyPayoutBps != null && message.dailyPayoutBps.length) {
                writer.uint32(/* id 8, wireType 2 =*/66).fork();
                for (var i = 0; i < message.dailyPayoutBps.length; ++i)
                    writer.uint64(message.dailyPayoutBps[i]);
                writer.ldelim();
            }
            if (message.classicDailyPointsCap != null && Object.hasOwnProperty.call(message, "classicDailyPointsCap"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.classicDailyPointsCap);
            if (message.shopRedemptionRatePoints != null && Object.hasOwnProperty.call(message, "shopRedemptionRatePoints"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint64(message.shopRedemptionRatePoints);
            if (message.shopRedemptionRateCnpy != null && Object.hasOwnProperty.call(message, "shopRedemptionRateCnpy"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint64(message.shopRedemptionRateCnpy);
            if (message.shopMinRedeemPoints != null && Object.hasOwnProperty.call(message, "shopMinRedeemPoints"))
                writer.uint32(/* id 12, wireType 0 =*/96).uint64(message.shopMinRedeemPoints);
            if (message.shopRedeemStepPoints != null && Object.hasOwnProperty.call(message, "shopRedeemStepPoints"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint64(message.shopRedeemStepPoints);
            if (message.dailyRewardFeeBps != null && Object.hasOwnProperty.call(message, "dailyRewardFeeBps"))
                writer.uint32(/* id 14, wireType 0 =*/112).uint64(message.dailyRewardFeeBps);
            if (message.dailyReserveFeeBps != null && Object.hasOwnProperty.call(message, "dailyReserveFeeBps"))
                writer.uint32(/* id 15, wireType 0 =*/120).uint64(message.dailyReserveFeeBps);
            if (message.dailyShopFeeBps != null && Object.hasOwnProperty.call(message, "dailyShopFeeBps"))
                writer.uint32(/* id 16, wireType 0 =*/128).uint64(message.dailyShopFeeBps);
            if (message.classicPlatformFeeBps != null && Object.hasOwnProperty.call(message, "classicPlatformFeeBps"))
                writer.uint32(/* id 17, wireType 0 =*/136).uint64(message.classicPlatformFeeBps);
            if (message.classicReserveFeeBps != null && Object.hasOwnProperty.call(message, "classicReserveFeeBps"))
                writer.uint32(/* id 18, wireType 0 =*/144).uint64(message.classicReserveFeeBps);
            if (message.classicShopFeeBps != null && Object.hasOwnProperty.call(message, "classicShopFeeBps"))
                writer.uint32(/* id 19, wireType 0 =*/152).uint64(message.classicShopFeeBps);
            if (message.dailyLoginRewardPoints != null && message.dailyLoginRewardPoints.length) {
                writer.uint32(/* id 20, wireType 2 =*/162).fork();
                for (var i = 0; i < message.dailyLoginRewardPoints.length; ++i)
                    writer.uint64(message.dailyLoginRewardPoints[i]);
                writer.ldelim();
            }
            if (message.dailyLoginBonusBps != null && Object.hasOwnProperty.call(message, "dailyLoginBonusBps"))
                writer.uint32(/* id 21, wireType 0 =*/168).uint64(message.dailyLoginBonusBps);
            return writer;
        };

        /**
         * Encodes the specified GameConfig message, length delimited. Does not implicitly {@link types.GameConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.GameConfig
         * @static
         * @param {types.IGameConfig} message GameConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameConfig message from the specified reader or buffer.
         * @function decode
         * @memberof types.GameConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.GameConfig} GameConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.GameConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.classicStartFee = reader.uint64();
                        break;
                    }
                case 2: {
                        message.dailyStartFee = reader.uint64();
                        break;
                    }
                case 3: {
                        message.dailyMaxMoves = reader.uint64();
                        break;
                    }
                case 4: {
                        message.classicLeaderboardSize = reader.uint64();
                        break;
                    }
                case 5: {
                        message.dailyLeaderboardSize = reader.uint64();
                        break;
                    }
                case 6: {
                        message.platformTreasuryAddress = reader.bytes();
                        break;
                    }
                case 7: {
                        message.dailyPlatformFeeBps = reader.uint64();
                        break;
                    }
                case 8: {
                        if (!(message.dailyPayoutBps && message.dailyPayoutBps.length))
                            message.dailyPayoutBps = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.dailyPayoutBps.push(reader.uint64());
                        } else
                            message.dailyPayoutBps.push(reader.uint64());
                        break;
                    }
                case 9: {
                        message.classicDailyPointsCap = reader.uint64();
                        break;
                    }
                case 10: {
                        message.shopRedemptionRatePoints = reader.uint64();
                        break;
                    }
                case 11: {
                        message.shopRedemptionRateCnpy = reader.uint64();
                        break;
                    }
                case 12: {
                        message.shopMinRedeemPoints = reader.uint64();
                        break;
                    }
                case 13: {
                        message.shopRedeemStepPoints = reader.uint64();
                        break;
                    }
                case 14: {
                        message.dailyRewardFeeBps = reader.uint64();
                        break;
                    }
                case 15: {
                        message.dailyReserveFeeBps = reader.uint64();
                        break;
                    }
                case 16: {
                        message.dailyShopFeeBps = reader.uint64();
                        break;
                    }
                case 17: {
                        message.classicPlatformFeeBps = reader.uint64();
                        break;
                    }
                case 18: {
                        message.classicReserveFeeBps = reader.uint64();
                        break;
                    }
                case 19: {
                        message.classicShopFeeBps = reader.uint64();
                        break;
                    }
                case 20: {
                        if (!(message.dailyLoginRewardPoints && message.dailyLoginRewardPoints.length))
                            message.dailyLoginRewardPoints = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.dailyLoginRewardPoints.push(reader.uint64());
                        } else
                            message.dailyLoginRewardPoints.push(reader.uint64());
                        break;
                    }
                case 21: {
                        message.dailyLoginBonusBps = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.GameConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.GameConfig} GameConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameConfig message.
         * @function verify
         * @memberof types.GameConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.classicStartFee != null && message.hasOwnProperty("classicStartFee"))
                if (!$util.isInteger(message.classicStartFee) && !(message.classicStartFee && $util.isInteger(message.classicStartFee.low) && $util.isInteger(message.classicStartFee.high)))
                    return "classicStartFee: integer|Long expected";
            if (message.dailyStartFee != null && message.hasOwnProperty("dailyStartFee"))
                if (!$util.isInteger(message.dailyStartFee) && !(message.dailyStartFee && $util.isInteger(message.dailyStartFee.low) && $util.isInteger(message.dailyStartFee.high)))
                    return "dailyStartFee: integer|Long expected";
            if (message.dailyMaxMoves != null && message.hasOwnProperty("dailyMaxMoves"))
                if (!$util.isInteger(message.dailyMaxMoves) && !(message.dailyMaxMoves && $util.isInteger(message.dailyMaxMoves.low) && $util.isInteger(message.dailyMaxMoves.high)))
                    return "dailyMaxMoves: integer|Long expected";
            if (message.classicLeaderboardSize != null && message.hasOwnProperty("classicLeaderboardSize"))
                if (!$util.isInteger(message.classicLeaderboardSize) && !(message.classicLeaderboardSize && $util.isInteger(message.classicLeaderboardSize.low) && $util.isInteger(message.classicLeaderboardSize.high)))
                    return "classicLeaderboardSize: integer|Long expected";
            if (message.dailyLeaderboardSize != null && message.hasOwnProperty("dailyLeaderboardSize"))
                if (!$util.isInteger(message.dailyLeaderboardSize) && !(message.dailyLeaderboardSize && $util.isInteger(message.dailyLeaderboardSize.low) && $util.isInteger(message.dailyLeaderboardSize.high)))
                    return "dailyLeaderboardSize: integer|Long expected";
            if (message.platformTreasuryAddress != null && message.hasOwnProperty("platformTreasuryAddress"))
                if (!(message.platformTreasuryAddress && typeof message.platformTreasuryAddress.length === "number" || $util.isString(message.platformTreasuryAddress)))
                    return "platformTreasuryAddress: buffer expected";
            if (message.dailyPlatformFeeBps != null && message.hasOwnProperty("dailyPlatformFeeBps"))
                if (!$util.isInteger(message.dailyPlatformFeeBps) && !(message.dailyPlatformFeeBps && $util.isInteger(message.dailyPlatformFeeBps.low) && $util.isInteger(message.dailyPlatformFeeBps.high)))
                    return "dailyPlatformFeeBps: integer|Long expected";
            if (message.dailyPayoutBps != null && message.hasOwnProperty("dailyPayoutBps")) {
                if (!Array.isArray(message.dailyPayoutBps))
                    return "dailyPayoutBps: array expected";
                for (var i = 0; i < message.dailyPayoutBps.length; ++i)
                    if (!$util.isInteger(message.dailyPayoutBps[i]) && !(message.dailyPayoutBps[i] && $util.isInteger(message.dailyPayoutBps[i].low) && $util.isInteger(message.dailyPayoutBps[i].high)))
                        return "dailyPayoutBps: integer|Long[] expected";
            }
            if (message.classicDailyPointsCap != null && message.hasOwnProperty("classicDailyPointsCap"))
                if (!$util.isInteger(message.classicDailyPointsCap) && !(message.classicDailyPointsCap && $util.isInteger(message.classicDailyPointsCap.low) && $util.isInteger(message.classicDailyPointsCap.high)))
                    return "classicDailyPointsCap: integer|Long expected";
            if (message.shopRedemptionRatePoints != null && message.hasOwnProperty("shopRedemptionRatePoints"))
                if (!$util.isInteger(message.shopRedemptionRatePoints) && !(message.shopRedemptionRatePoints && $util.isInteger(message.shopRedemptionRatePoints.low) && $util.isInteger(message.shopRedemptionRatePoints.high)))
                    return "shopRedemptionRatePoints: integer|Long expected";
            if (message.shopRedemptionRateCnpy != null && message.hasOwnProperty("shopRedemptionRateCnpy"))
                if (!$util.isInteger(message.shopRedemptionRateCnpy) && !(message.shopRedemptionRateCnpy && $util.isInteger(message.shopRedemptionRateCnpy.low) && $util.isInteger(message.shopRedemptionRateCnpy.high)))
                    return "shopRedemptionRateCnpy: integer|Long expected";
            if (message.shopMinRedeemPoints != null && message.hasOwnProperty("shopMinRedeemPoints"))
                if (!$util.isInteger(message.shopMinRedeemPoints) && !(message.shopMinRedeemPoints && $util.isInteger(message.shopMinRedeemPoints.low) && $util.isInteger(message.shopMinRedeemPoints.high)))
                    return "shopMinRedeemPoints: integer|Long expected";
            if (message.shopRedeemStepPoints != null && message.hasOwnProperty("shopRedeemStepPoints"))
                if (!$util.isInteger(message.shopRedeemStepPoints) && !(message.shopRedeemStepPoints && $util.isInteger(message.shopRedeemStepPoints.low) && $util.isInteger(message.shopRedeemStepPoints.high)))
                    return "shopRedeemStepPoints: integer|Long expected";
            if (message.dailyRewardFeeBps != null && message.hasOwnProperty("dailyRewardFeeBps"))
                if (!$util.isInteger(message.dailyRewardFeeBps) && !(message.dailyRewardFeeBps && $util.isInteger(message.dailyRewardFeeBps.low) && $util.isInteger(message.dailyRewardFeeBps.high)))
                    return "dailyRewardFeeBps: integer|Long expected";
            if (message.dailyReserveFeeBps != null && message.hasOwnProperty("dailyReserveFeeBps"))
                if (!$util.isInteger(message.dailyReserveFeeBps) && !(message.dailyReserveFeeBps && $util.isInteger(message.dailyReserveFeeBps.low) && $util.isInteger(message.dailyReserveFeeBps.high)))
                    return "dailyReserveFeeBps: integer|Long expected";
            if (message.dailyShopFeeBps != null && message.hasOwnProperty("dailyShopFeeBps"))
                if (!$util.isInteger(message.dailyShopFeeBps) && !(message.dailyShopFeeBps && $util.isInteger(message.dailyShopFeeBps.low) && $util.isInteger(message.dailyShopFeeBps.high)))
                    return "dailyShopFeeBps: integer|Long expected";
            if (message.classicPlatformFeeBps != null && message.hasOwnProperty("classicPlatformFeeBps"))
                if (!$util.isInteger(message.classicPlatformFeeBps) && !(message.classicPlatformFeeBps && $util.isInteger(message.classicPlatformFeeBps.low) && $util.isInteger(message.classicPlatformFeeBps.high)))
                    return "classicPlatformFeeBps: integer|Long expected";
            if (message.classicReserveFeeBps != null && message.hasOwnProperty("classicReserveFeeBps"))
                if (!$util.isInteger(message.classicReserveFeeBps) && !(message.classicReserveFeeBps && $util.isInteger(message.classicReserveFeeBps.low) && $util.isInteger(message.classicReserveFeeBps.high)))
                    return "classicReserveFeeBps: integer|Long expected";
            if (message.classicShopFeeBps != null && message.hasOwnProperty("classicShopFeeBps"))
                if (!$util.isInteger(message.classicShopFeeBps) && !(message.classicShopFeeBps && $util.isInteger(message.classicShopFeeBps.low) && $util.isInteger(message.classicShopFeeBps.high)))
                    return "classicShopFeeBps: integer|Long expected";
            if (message.dailyLoginRewardPoints != null && message.hasOwnProperty("dailyLoginRewardPoints")) {
                if (!Array.isArray(message.dailyLoginRewardPoints))
                    return "dailyLoginRewardPoints: array expected";
                for (var i = 0; i < message.dailyLoginRewardPoints.length; ++i)
                    if (!$util.isInteger(message.dailyLoginRewardPoints[i]) && !(message.dailyLoginRewardPoints[i] && $util.isInteger(message.dailyLoginRewardPoints[i].low) && $util.isInteger(message.dailyLoginRewardPoints[i].high)))
                        return "dailyLoginRewardPoints: integer|Long[] expected";
            }
            if (message.dailyLoginBonusBps != null && message.hasOwnProperty("dailyLoginBonusBps"))
                if (!$util.isInteger(message.dailyLoginBonusBps) && !(message.dailyLoginBonusBps && $util.isInteger(message.dailyLoginBonusBps.low) && $util.isInteger(message.dailyLoginBonusBps.high)))
                    return "dailyLoginBonusBps: integer|Long expected";
            return null;
        };

        /**
         * Creates a GameConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.GameConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.GameConfig} GameConfig
         */
        GameConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.types.GameConfig)
                return object;
            var message = new $root.types.GameConfig();
            if (object.classicStartFee != null)
                if ($util.Long)
                    (message.classicStartFee = $util.Long.fromValue(object.classicStartFee)).unsigned = true;
                else if (typeof object.classicStartFee === "string")
                    message.classicStartFee = parseInt(object.classicStartFee, 10);
                else if (typeof object.classicStartFee === "number")
                    message.classicStartFee = object.classicStartFee;
                else if (typeof object.classicStartFee === "object")
                    message.classicStartFee = new $util.LongBits(object.classicStartFee.low >>> 0, object.classicStartFee.high >>> 0).toNumber(true);
            if (object.dailyStartFee != null)
                if ($util.Long)
                    (message.dailyStartFee = $util.Long.fromValue(object.dailyStartFee)).unsigned = true;
                else if (typeof object.dailyStartFee === "string")
                    message.dailyStartFee = parseInt(object.dailyStartFee, 10);
                else if (typeof object.dailyStartFee === "number")
                    message.dailyStartFee = object.dailyStartFee;
                else if (typeof object.dailyStartFee === "object")
                    message.dailyStartFee = new $util.LongBits(object.dailyStartFee.low >>> 0, object.dailyStartFee.high >>> 0).toNumber(true);
            if (object.dailyMaxMoves != null)
                if ($util.Long)
                    (message.dailyMaxMoves = $util.Long.fromValue(object.dailyMaxMoves)).unsigned = true;
                else if (typeof object.dailyMaxMoves === "string")
                    message.dailyMaxMoves = parseInt(object.dailyMaxMoves, 10);
                else if (typeof object.dailyMaxMoves === "number")
                    message.dailyMaxMoves = object.dailyMaxMoves;
                else if (typeof object.dailyMaxMoves === "object")
                    message.dailyMaxMoves = new $util.LongBits(object.dailyMaxMoves.low >>> 0, object.dailyMaxMoves.high >>> 0).toNumber(true);
            if (object.classicLeaderboardSize != null)
                if ($util.Long)
                    (message.classicLeaderboardSize = $util.Long.fromValue(object.classicLeaderboardSize)).unsigned = true;
                else if (typeof object.classicLeaderboardSize === "string")
                    message.classicLeaderboardSize = parseInt(object.classicLeaderboardSize, 10);
                else if (typeof object.classicLeaderboardSize === "number")
                    message.classicLeaderboardSize = object.classicLeaderboardSize;
                else if (typeof object.classicLeaderboardSize === "object")
                    message.classicLeaderboardSize = new $util.LongBits(object.classicLeaderboardSize.low >>> 0, object.classicLeaderboardSize.high >>> 0).toNumber(true);
            if (object.dailyLeaderboardSize != null)
                if ($util.Long)
                    (message.dailyLeaderboardSize = $util.Long.fromValue(object.dailyLeaderboardSize)).unsigned = true;
                else if (typeof object.dailyLeaderboardSize === "string")
                    message.dailyLeaderboardSize = parseInt(object.dailyLeaderboardSize, 10);
                else if (typeof object.dailyLeaderboardSize === "number")
                    message.dailyLeaderboardSize = object.dailyLeaderboardSize;
                else if (typeof object.dailyLeaderboardSize === "object")
                    message.dailyLeaderboardSize = new $util.LongBits(object.dailyLeaderboardSize.low >>> 0, object.dailyLeaderboardSize.high >>> 0).toNumber(true);
            if (object.platformTreasuryAddress != null)
                if (typeof object.platformTreasuryAddress === "string")
                    $util.base64.decode(object.platformTreasuryAddress, message.platformTreasuryAddress = $util.newBuffer($util.base64.length(object.platformTreasuryAddress)), 0);
                else if (object.platformTreasuryAddress.length >= 0)
                    message.platformTreasuryAddress = object.platformTreasuryAddress;
            if (object.dailyPlatformFeeBps != null)
                if ($util.Long)
                    (message.dailyPlatformFeeBps = $util.Long.fromValue(object.dailyPlatformFeeBps)).unsigned = true;
                else if (typeof object.dailyPlatformFeeBps === "string")
                    message.dailyPlatformFeeBps = parseInt(object.dailyPlatformFeeBps, 10);
                else if (typeof object.dailyPlatformFeeBps === "number")
                    message.dailyPlatformFeeBps = object.dailyPlatformFeeBps;
                else if (typeof object.dailyPlatformFeeBps === "object")
                    message.dailyPlatformFeeBps = new $util.LongBits(object.dailyPlatformFeeBps.low >>> 0, object.dailyPlatformFeeBps.high >>> 0).toNumber(true);
            if (object.dailyPayoutBps) {
                if (!Array.isArray(object.dailyPayoutBps))
                    throw TypeError(".types.GameConfig.dailyPayoutBps: array expected");
                message.dailyPayoutBps = [];
                for (var i = 0; i < object.dailyPayoutBps.length; ++i)
                    if ($util.Long)
                        (message.dailyPayoutBps[i] = $util.Long.fromValue(object.dailyPayoutBps[i])).unsigned = true;
                    else if (typeof object.dailyPayoutBps[i] === "string")
                        message.dailyPayoutBps[i] = parseInt(object.dailyPayoutBps[i], 10);
                    else if (typeof object.dailyPayoutBps[i] === "number")
                        message.dailyPayoutBps[i] = object.dailyPayoutBps[i];
                    else if (typeof object.dailyPayoutBps[i] === "object")
                        message.dailyPayoutBps[i] = new $util.LongBits(object.dailyPayoutBps[i].low >>> 0, object.dailyPayoutBps[i].high >>> 0).toNumber(true);
            }
            if (object.classicDailyPointsCap != null)
                if ($util.Long)
                    (message.classicDailyPointsCap = $util.Long.fromValue(object.classicDailyPointsCap)).unsigned = true;
                else if (typeof object.classicDailyPointsCap === "string")
                    message.classicDailyPointsCap = parseInt(object.classicDailyPointsCap, 10);
                else if (typeof object.classicDailyPointsCap === "number")
                    message.classicDailyPointsCap = object.classicDailyPointsCap;
                else if (typeof object.classicDailyPointsCap === "object")
                    message.classicDailyPointsCap = new $util.LongBits(object.classicDailyPointsCap.low >>> 0, object.classicDailyPointsCap.high >>> 0).toNumber(true);
            if (object.shopRedemptionRatePoints != null)
                if ($util.Long)
                    (message.shopRedemptionRatePoints = $util.Long.fromValue(object.shopRedemptionRatePoints)).unsigned = true;
                else if (typeof object.shopRedemptionRatePoints === "string")
                    message.shopRedemptionRatePoints = parseInt(object.shopRedemptionRatePoints, 10);
                else if (typeof object.shopRedemptionRatePoints === "number")
                    message.shopRedemptionRatePoints = object.shopRedemptionRatePoints;
                else if (typeof object.shopRedemptionRatePoints === "object")
                    message.shopRedemptionRatePoints = new $util.LongBits(object.shopRedemptionRatePoints.low >>> 0, object.shopRedemptionRatePoints.high >>> 0).toNumber(true);
            if (object.shopRedemptionRateCnpy != null)
                if ($util.Long)
                    (message.shopRedemptionRateCnpy = $util.Long.fromValue(object.shopRedemptionRateCnpy)).unsigned = true;
                else if (typeof object.shopRedemptionRateCnpy === "string")
                    message.shopRedemptionRateCnpy = parseInt(object.shopRedemptionRateCnpy, 10);
                else if (typeof object.shopRedemptionRateCnpy === "number")
                    message.shopRedemptionRateCnpy = object.shopRedemptionRateCnpy;
                else if (typeof object.shopRedemptionRateCnpy === "object")
                    message.shopRedemptionRateCnpy = new $util.LongBits(object.shopRedemptionRateCnpy.low >>> 0, object.shopRedemptionRateCnpy.high >>> 0).toNumber(true);
            if (object.shopMinRedeemPoints != null)
                if ($util.Long)
                    (message.shopMinRedeemPoints = $util.Long.fromValue(object.shopMinRedeemPoints)).unsigned = true;
                else if (typeof object.shopMinRedeemPoints === "string")
                    message.shopMinRedeemPoints = parseInt(object.shopMinRedeemPoints, 10);
                else if (typeof object.shopMinRedeemPoints === "number")
                    message.shopMinRedeemPoints = object.shopMinRedeemPoints;
                else if (typeof object.shopMinRedeemPoints === "object")
                    message.shopMinRedeemPoints = new $util.LongBits(object.shopMinRedeemPoints.low >>> 0, object.shopMinRedeemPoints.high >>> 0).toNumber(true);
            if (object.shopRedeemStepPoints != null)
                if ($util.Long)
                    (message.shopRedeemStepPoints = $util.Long.fromValue(object.shopRedeemStepPoints)).unsigned = true;
                else if (typeof object.shopRedeemStepPoints === "string")
                    message.shopRedeemStepPoints = parseInt(object.shopRedeemStepPoints, 10);
                else if (typeof object.shopRedeemStepPoints === "number")
                    message.shopRedeemStepPoints = object.shopRedeemStepPoints;
                else if (typeof object.shopRedeemStepPoints === "object")
                    message.shopRedeemStepPoints = new $util.LongBits(object.shopRedeemStepPoints.low >>> 0, object.shopRedeemStepPoints.high >>> 0).toNumber(true);
            if (object.dailyRewardFeeBps != null)
                if ($util.Long)
                    (message.dailyRewardFeeBps = $util.Long.fromValue(object.dailyRewardFeeBps)).unsigned = true;
                else if (typeof object.dailyRewardFeeBps === "string")
                    message.dailyRewardFeeBps = parseInt(object.dailyRewardFeeBps, 10);
                else if (typeof object.dailyRewardFeeBps === "number")
                    message.dailyRewardFeeBps = object.dailyRewardFeeBps;
                else if (typeof object.dailyRewardFeeBps === "object")
                    message.dailyRewardFeeBps = new $util.LongBits(object.dailyRewardFeeBps.low >>> 0, object.dailyRewardFeeBps.high >>> 0).toNumber(true);
            if (object.dailyReserveFeeBps != null)
                if ($util.Long)
                    (message.dailyReserveFeeBps = $util.Long.fromValue(object.dailyReserveFeeBps)).unsigned = true;
                else if (typeof object.dailyReserveFeeBps === "string")
                    message.dailyReserveFeeBps = parseInt(object.dailyReserveFeeBps, 10);
                else if (typeof object.dailyReserveFeeBps === "number")
                    message.dailyReserveFeeBps = object.dailyReserveFeeBps;
                else if (typeof object.dailyReserveFeeBps === "object")
                    message.dailyReserveFeeBps = new $util.LongBits(object.dailyReserveFeeBps.low >>> 0, object.dailyReserveFeeBps.high >>> 0).toNumber(true);
            if (object.dailyShopFeeBps != null)
                if ($util.Long)
                    (message.dailyShopFeeBps = $util.Long.fromValue(object.dailyShopFeeBps)).unsigned = true;
                else if (typeof object.dailyShopFeeBps === "string")
                    message.dailyShopFeeBps = parseInt(object.dailyShopFeeBps, 10);
                else if (typeof object.dailyShopFeeBps === "number")
                    message.dailyShopFeeBps = object.dailyShopFeeBps;
                else if (typeof object.dailyShopFeeBps === "object")
                    message.dailyShopFeeBps = new $util.LongBits(object.dailyShopFeeBps.low >>> 0, object.dailyShopFeeBps.high >>> 0).toNumber(true);
            if (object.classicPlatformFeeBps != null)
                if ($util.Long)
                    (message.classicPlatformFeeBps = $util.Long.fromValue(object.classicPlatformFeeBps)).unsigned = true;
                else if (typeof object.classicPlatformFeeBps === "string")
                    message.classicPlatformFeeBps = parseInt(object.classicPlatformFeeBps, 10);
                else if (typeof object.classicPlatformFeeBps === "number")
                    message.classicPlatformFeeBps = object.classicPlatformFeeBps;
                else if (typeof object.classicPlatformFeeBps === "object")
                    message.classicPlatformFeeBps = new $util.LongBits(object.classicPlatformFeeBps.low >>> 0, object.classicPlatformFeeBps.high >>> 0).toNumber(true);
            if (object.classicReserveFeeBps != null)
                if ($util.Long)
                    (message.classicReserveFeeBps = $util.Long.fromValue(object.classicReserveFeeBps)).unsigned = true;
                else if (typeof object.classicReserveFeeBps === "string")
                    message.classicReserveFeeBps = parseInt(object.classicReserveFeeBps, 10);
                else if (typeof object.classicReserveFeeBps === "number")
                    message.classicReserveFeeBps = object.classicReserveFeeBps;
                else if (typeof object.classicReserveFeeBps === "object")
                    message.classicReserveFeeBps = new $util.LongBits(object.classicReserveFeeBps.low >>> 0, object.classicReserveFeeBps.high >>> 0).toNumber(true);
            if (object.classicShopFeeBps != null)
                if ($util.Long)
                    (message.classicShopFeeBps = $util.Long.fromValue(object.classicShopFeeBps)).unsigned = true;
                else if (typeof object.classicShopFeeBps === "string")
                    message.classicShopFeeBps = parseInt(object.classicShopFeeBps, 10);
                else if (typeof object.classicShopFeeBps === "number")
                    message.classicShopFeeBps = object.classicShopFeeBps;
                else if (typeof object.classicShopFeeBps === "object")
                    message.classicShopFeeBps = new $util.LongBits(object.classicShopFeeBps.low >>> 0, object.classicShopFeeBps.high >>> 0).toNumber(true);
            if (object.dailyLoginRewardPoints) {
                if (!Array.isArray(object.dailyLoginRewardPoints))
                    throw TypeError(".types.GameConfig.dailyLoginRewardPoints: array expected");
                message.dailyLoginRewardPoints = [];
                for (var i = 0; i < object.dailyLoginRewardPoints.length; ++i)
                    if ($util.Long)
                        (message.dailyLoginRewardPoints[i] = $util.Long.fromValue(object.dailyLoginRewardPoints[i])).unsigned = true;
                    else if (typeof object.dailyLoginRewardPoints[i] === "string")
                        message.dailyLoginRewardPoints[i] = parseInt(object.dailyLoginRewardPoints[i], 10);
                    else if (typeof object.dailyLoginRewardPoints[i] === "number")
                        message.dailyLoginRewardPoints[i] = object.dailyLoginRewardPoints[i];
                    else if (typeof object.dailyLoginRewardPoints[i] === "object")
                        message.dailyLoginRewardPoints[i] = new $util.LongBits(object.dailyLoginRewardPoints[i].low >>> 0, object.dailyLoginRewardPoints[i].high >>> 0).toNumber(true);
            }
            if (object.dailyLoginBonusBps != null)
                if ($util.Long)
                    (message.dailyLoginBonusBps = $util.Long.fromValue(object.dailyLoginBonusBps)).unsigned = true;
                else if (typeof object.dailyLoginBonusBps === "string")
                    message.dailyLoginBonusBps = parseInt(object.dailyLoginBonusBps, 10);
                else if (typeof object.dailyLoginBonusBps === "number")
                    message.dailyLoginBonusBps = object.dailyLoginBonusBps;
                else if (typeof object.dailyLoginBonusBps === "object")
                    message.dailyLoginBonusBps = new $util.LongBits(object.dailyLoginBonusBps.low >>> 0, object.dailyLoginBonusBps.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a GameConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.GameConfig
         * @static
         * @param {types.GameConfig} message GameConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameConfig.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.dailyPayoutBps = [];
                object.dailyLoginRewardPoints = [];
            }
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicStartFee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicStartFee = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyStartFee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyStartFee = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyMaxMoves = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyMaxMoves = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicLeaderboardSize = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicLeaderboardSize = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyLeaderboardSize = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyLeaderboardSize = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.platformTreasuryAddress = "";
                else {
                    object.platformTreasuryAddress = [];
                    if (options.bytes !== Array)
                        object.platformTreasuryAddress = $util.newBuffer(object.platformTreasuryAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyPlatformFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyPlatformFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicDailyPointsCap = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicDailyPointsCap = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.shopRedemptionRatePoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.shopRedemptionRatePoints = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.shopRedemptionRateCnpy = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.shopRedemptionRateCnpy = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.shopMinRedeemPoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.shopMinRedeemPoints = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.shopRedeemStepPoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.shopRedeemStepPoints = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyRewardFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyRewardFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyReserveFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyReserveFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyShopFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyShopFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicPlatformFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicPlatformFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicReserveFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicReserveFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicShopFeeBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicShopFeeBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyLoginBonusBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyLoginBonusBps = options.longs === String ? "0" : 0;
            }
            if (message.classicStartFee != null && message.hasOwnProperty("classicStartFee"))
                if (typeof message.classicStartFee === "number")
                    object.classicStartFee = options.longs === String ? String(message.classicStartFee) : message.classicStartFee;
                else
                    object.classicStartFee = options.longs === String ? $util.Long.prototype.toString.call(message.classicStartFee) : options.longs === Number ? new $util.LongBits(message.classicStartFee.low >>> 0, message.classicStartFee.high >>> 0).toNumber(true) : message.classicStartFee;
            if (message.dailyStartFee != null && message.hasOwnProperty("dailyStartFee"))
                if (typeof message.dailyStartFee === "number")
                    object.dailyStartFee = options.longs === String ? String(message.dailyStartFee) : message.dailyStartFee;
                else
                    object.dailyStartFee = options.longs === String ? $util.Long.prototype.toString.call(message.dailyStartFee) : options.longs === Number ? new $util.LongBits(message.dailyStartFee.low >>> 0, message.dailyStartFee.high >>> 0).toNumber(true) : message.dailyStartFee;
            if (message.dailyMaxMoves != null && message.hasOwnProperty("dailyMaxMoves"))
                if (typeof message.dailyMaxMoves === "number")
                    object.dailyMaxMoves = options.longs === String ? String(message.dailyMaxMoves) : message.dailyMaxMoves;
                else
                    object.dailyMaxMoves = options.longs === String ? $util.Long.prototype.toString.call(message.dailyMaxMoves) : options.longs === Number ? new $util.LongBits(message.dailyMaxMoves.low >>> 0, message.dailyMaxMoves.high >>> 0).toNumber(true) : message.dailyMaxMoves;
            if (message.classicLeaderboardSize != null && message.hasOwnProperty("classicLeaderboardSize"))
                if (typeof message.classicLeaderboardSize === "number")
                    object.classicLeaderboardSize = options.longs === String ? String(message.classicLeaderboardSize) : message.classicLeaderboardSize;
                else
                    object.classicLeaderboardSize = options.longs === String ? $util.Long.prototype.toString.call(message.classicLeaderboardSize) : options.longs === Number ? new $util.LongBits(message.classicLeaderboardSize.low >>> 0, message.classicLeaderboardSize.high >>> 0).toNumber(true) : message.classicLeaderboardSize;
            if (message.dailyLeaderboardSize != null && message.hasOwnProperty("dailyLeaderboardSize"))
                if (typeof message.dailyLeaderboardSize === "number")
                    object.dailyLeaderboardSize = options.longs === String ? String(message.dailyLeaderboardSize) : message.dailyLeaderboardSize;
                else
                    object.dailyLeaderboardSize = options.longs === String ? $util.Long.prototype.toString.call(message.dailyLeaderboardSize) : options.longs === Number ? new $util.LongBits(message.dailyLeaderboardSize.low >>> 0, message.dailyLeaderboardSize.high >>> 0).toNumber(true) : message.dailyLeaderboardSize;
            if (message.platformTreasuryAddress != null && message.hasOwnProperty("platformTreasuryAddress"))
                object.platformTreasuryAddress = options.bytes === String ? $util.base64.encode(message.platformTreasuryAddress, 0, message.platformTreasuryAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.platformTreasuryAddress) : message.platformTreasuryAddress;
            if (message.dailyPlatformFeeBps != null && message.hasOwnProperty("dailyPlatformFeeBps"))
                if (typeof message.dailyPlatformFeeBps === "number")
                    object.dailyPlatformFeeBps = options.longs === String ? String(message.dailyPlatformFeeBps) : message.dailyPlatformFeeBps;
                else
                    object.dailyPlatformFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.dailyPlatformFeeBps) : options.longs === Number ? new $util.LongBits(message.dailyPlatformFeeBps.low >>> 0, message.dailyPlatformFeeBps.high >>> 0).toNumber(true) : message.dailyPlatformFeeBps;
            if (message.dailyPayoutBps && message.dailyPayoutBps.length) {
                object.dailyPayoutBps = [];
                for (var j = 0; j < message.dailyPayoutBps.length; ++j)
                    if (typeof message.dailyPayoutBps[j] === "number")
                        object.dailyPayoutBps[j] = options.longs === String ? String(message.dailyPayoutBps[j]) : message.dailyPayoutBps[j];
                    else
                        object.dailyPayoutBps[j] = options.longs === String ? $util.Long.prototype.toString.call(message.dailyPayoutBps[j]) : options.longs === Number ? new $util.LongBits(message.dailyPayoutBps[j].low >>> 0, message.dailyPayoutBps[j].high >>> 0).toNumber(true) : message.dailyPayoutBps[j];
            }
            if (message.classicDailyPointsCap != null && message.hasOwnProperty("classicDailyPointsCap"))
                if (typeof message.classicDailyPointsCap === "number")
                    object.classicDailyPointsCap = options.longs === String ? String(message.classicDailyPointsCap) : message.classicDailyPointsCap;
                else
                    object.classicDailyPointsCap = options.longs === String ? $util.Long.prototype.toString.call(message.classicDailyPointsCap) : options.longs === Number ? new $util.LongBits(message.classicDailyPointsCap.low >>> 0, message.classicDailyPointsCap.high >>> 0).toNumber(true) : message.classicDailyPointsCap;
            if (message.shopRedemptionRatePoints != null && message.hasOwnProperty("shopRedemptionRatePoints"))
                if (typeof message.shopRedemptionRatePoints === "number")
                    object.shopRedemptionRatePoints = options.longs === String ? String(message.shopRedemptionRatePoints) : message.shopRedemptionRatePoints;
                else
                    object.shopRedemptionRatePoints = options.longs === String ? $util.Long.prototype.toString.call(message.shopRedemptionRatePoints) : options.longs === Number ? new $util.LongBits(message.shopRedemptionRatePoints.low >>> 0, message.shopRedemptionRatePoints.high >>> 0).toNumber(true) : message.shopRedemptionRatePoints;
            if (message.shopRedemptionRateCnpy != null && message.hasOwnProperty("shopRedemptionRateCnpy"))
                if (typeof message.shopRedemptionRateCnpy === "number")
                    object.shopRedemptionRateCnpy = options.longs === String ? String(message.shopRedemptionRateCnpy) : message.shopRedemptionRateCnpy;
                else
                    object.shopRedemptionRateCnpy = options.longs === String ? $util.Long.prototype.toString.call(message.shopRedemptionRateCnpy) : options.longs === Number ? new $util.LongBits(message.shopRedemptionRateCnpy.low >>> 0, message.shopRedemptionRateCnpy.high >>> 0).toNumber(true) : message.shopRedemptionRateCnpy;
            if (message.shopMinRedeemPoints != null && message.hasOwnProperty("shopMinRedeemPoints"))
                if (typeof message.shopMinRedeemPoints === "number")
                    object.shopMinRedeemPoints = options.longs === String ? String(message.shopMinRedeemPoints) : message.shopMinRedeemPoints;
                else
                    object.shopMinRedeemPoints = options.longs === String ? $util.Long.prototype.toString.call(message.shopMinRedeemPoints) : options.longs === Number ? new $util.LongBits(message.shopMinRedeemPoints.low >>> 0, message.shopMinRedeemPoints.high >>> 0).toNumber(true) : message.shopMinRedeemPoints;
            if (message.shopRedeemStepPoints != null && message.hasOwnProperty("shopRedeemStepPoints"))
                if (typeof message.shopRedeemStepPoints === "number")
                    object.shopRedeemStepPoints = options.longs === String ? String(message.shopRedeemStepPoints) : message.shopRedeemStepPoints;
                else
                    object.shopRedeemStepPoints = options.longs === String ? $util.Long.prototype.toString.call(message.shopRedeemStepPoints) : options.longs === Number ? new $util.LongBits(message.shopRedeemStepPoints.low >>> 0, message.shopRedeemStepPoints.high >>> 0).toNumber(true) : message.shopRedeemStepPoints;
            if (message.dailyRewardFeeBps != null && message.hasOwnProperty("dailyRewardFeeBps"))
                if (typeof message.dailyRewardFeeBps === "number")
                    object.dailyRewardFeeBps = options.longs === String ? String(message.dailyRewardFeeBps) : message.dailyRewardFeeBps;
                else
                    object.dailyRewardFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.dailyRewardFeeBps) : options.longs === Number ? new $util.LongBits(message.dailyRewardFeeBps.low >>> 0, message.dailyRewardFeeBps.high >>> 0).toNumber(true) : message.dailyRewardFeeBps;
            if (message.dailyReserveFeeBps != null && message.hasOwnProperty("dailyReserveFeeBps"))
                if (typeof message.dailyReserveFeeBps === "number")
                    object.dailyReserveFeeBps = options.longs === String ? String(message.dailyReserveFeeBps) : message.dailyReserveFeeBps;
                else
                    object.dailyReserveFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.dailyReserveFeeBps) : options.longs === Number ? new $util.LongBits(message.dailyReserveFeeBps.low >>> 0, message.dailyReserveFeeBps.high >>> 0).toNumber(true) : message.dailyReserveFeeBps;
            if (message.dailyShopFeeBps != null && message.hasOwnProperty("dailyShopFeeBps"))
                if (typeof message.dailyShopFeeBps === "number")
                    object.dailyShopFeeBps = options.longs === String ? String(message.dailyShopFeeBps) : message.dailyShopFeeBps;
                else
                    object.dailyShopFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.dailyShopFeeBps) : options.longs === Number ? new $util.LongBits(message.dailyShopFeeBps.low >>> 0, message.dailyShopFeeBps.high >>> 0).toNumber(true) : message.dailyShopFeeBps;
            if (message.classicPlatformFeeBps != null && message.hasOwnProperty("classicPlatformFeeBps"))
                if (typeof message.classicPlatformFeeBps === "number")
                    object.classicPlatformFeeBps = options.longs === String ? String(message.classicPlatformFeeBps) : message.classicPlatformFeeBps;
                else
                    object.classicPlatformFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.classicPlatformFeeBps) : options.longs === Number ? new $util.LongBits(message.classicPlatformFeeBps.low >>> 0, message.classicPlatformFeeBps.high >>> 0).toNumber(true) : message.classicPlatformFeeBps;
            if (message.classicReserveFeeBps != null && message.hasOwnProperty("classicReserveFeeBps"))
                if (typeof message.classicReserveFeeBps === "number")
                    object.classicReserveFeeBps = options.longs === String ? String(message.classicReserveFeeBps) : message.classicReserveFeeBps;
                else
                    object.classicReserveFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.classicReserveFeeBps) : options.longs === Number ? new $util.LongBits(message.classicReserveFeeBps.low >>> 0, message.classicReserveFeeBps.high >>> 0).toNumber(true) : message.classicReserveFeeBps;
            if (message.classicShopFeeBps != null && message.hasOwnProperty("classicShopFeeBps"))
                if (typeof message.classicShopFeeBps === "number")
                    object.classicShopFeeBps = options.longs === String ? String(message.classicShopFeeBps) : message.classicShopFeeBps;
                else
                    object.classicShopFeeBps = options.longs === String ? $util.Long.prototype.toString.call(message.classicShopFeeBps) : options.longs === Number ? new $util.LongBits(message.classicShopFeeBps.low >>> 0, message.classicShopFeeBps.high >>> 0).toNumber(true) : message.classicShopFeeBps;
            if (message.dailyLoginRewardPoints && message.dailyLoginRewardPoints.length) {
                object.dailyLoginRewardPoints = [];
                for (var j = 0; j < message.dailyLoginRewardPoints.length; ++j)
                    if (typeof message.dailyLoginRewardPoints[j] === "number")
                        object.dailyLoginRewardPoints[j] = options.longs === String ? String(message.dailyLoginRewardPoints[j]) : message.dailyLoginRewardPoints[j];
                    else
                        object.dailyLoginRewardPoints[j] = options.longs === String ? $util.Long.prototype.toString.call(message.dailyLoginRewardPoints[j]) : options.longs === Number ? new $util.LongBits(message.dailyLoginRewardPoints[j].low >>> 0, message.dailyLoginRewardPoints[j].high >>> 0).toNumber(true) : message.dailyLoginRewardPoints[j];
            }
            if (message.dailyLoginBonusBps != null && message.hasOwnProperty("dailyLoginBonusBps"))
                if (typeof message.dailyLoginBonusBps === "number")
                    object.dailyLoginBonusBps = options.longs === String ? String(message.dailyLoginBonusBps) : message.dailyLoginBonusBps;
                else
                    object.dailyLoginBonusBps = options.longs === String ? $util.Long.prototype.toString.call(message.dailyLoginBonusBps) : options.longs === Number ? new $util.LongBits(message.dailyLoginBonusBps.low >>> 0, message.dailyLoginBonusBps.high >>> 0).toNumber(true) : message.dailyLoginBonusBps;
            return object;
        };

        /**
         * Converts this GameConfig to JSON.
         * @function toJSON
         * @memberof types.GameConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GameConfig
         * @function getTypeUrl
         * @memberof types.GameConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GameConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.GameConfig";
        };

        return GameConfig;
    })();

    types.GameSession = (function() {

        /**
         * Properties of a GameSession.
         * @memberof types
         * @interface IGameSession
         * @property {Uint8Array|null} [gameId] GameSession gameId
         * @property {Uint8Array|null} [playerAddress] GameSession playerAddress
         * @property {types.GameMode|null} [mode] GameSession mode
         * @property {string|null} [utcDate] GameSession utcDate
         * @property {Uint8Array|null} [seed] GameSession seed
         * @property {types.SessionStatus|null} [status] GameSession status
         * @property {number|Long|null} [startedHeight] GameSession startedHeight
         * @property {number|Long|null} [startedAtUnix] GameSession startedAtUnix
         * @property {number|Long|null} [feePaid] GameSession feePaid
         * @property {number|Long|null} [maxMoves] GameSession maxMoves
         * @property {number|Long|null} [submittedScore] GameSession submittedScore
         * @property {number|Long|null} [submittedMaxTile] GameSession submittedMaxTile
         * @property {number|Long|null} [finalMoveCount] GameSession finalMoveCount
         * @property {types.StopReason|null} [stopReason] GameSession stopReason
         * @property {number|Long|null} [submittedAtUnix] GameSession submittedAtUnix
         */

        /**
         * Constructs a new GameSession.
         * @memberof types
         * @classdesc Represents a GameSession.
         * @implements IGameSession
         * @constructor
         * @param {types.IGameSession=} [properties] Properties to set
         */
        function GameSession(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameSession gameId.
         * @member {Uint8Array} gameId
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.gameId = $util.newBuffer([]);

        /**
         * GameSession playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.playerAddress = $util.newBuffer([]);

        /**
         * GameSession mode.
         * @member {types.GameMode} mode
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.mode = 0;

        /**
         * GameSession utcDate.
         * @member {string} utcDate
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.utcDate = "";

        /**
         * GameSession seed.
         * @member {Uint8Array} seed
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.seed = $util.newBuffer([]);

        /**
         * GameSession status.
         * @member {types.SessionStatus} status
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.status = 0;

        /**
         * GameSession startedHeight.
         * @member {number|Long} startedHeight
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.startedHeight = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession startedAtUnix.
         * @member {number|Long} startedAtUnix
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.startedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession feePaid.
         * @member {number|Long} feePaid
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.feePaid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession maxMoves.
         * @member {number|Long} maxMoves
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.maxMoves = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession submittedScore.
         * @member {number|Long} submittedScore
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.submittedScore = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession submittedMaxTile.
         * @member {number|Long} submittedMaxTile
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.submittedMaxTile = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession finalMoveCount.
         * @member {number|Long} finalMoveCount
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.finalMoveCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameSession stopReason.
         * @member {types.StopReason} stopReason
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.stopReason = 0;

        /**
         * GameSession submittedAtUnix.
         * @member {number|Long} submittedAtUnix
         * @memberof types.GameSession
         * @instance
         */
        GameSession.prototype.submittedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new GameSession instance using the specified properties.
         * @function create
         * @memberof types.GameSession
         * @static
         * @param {types.IGameSession=} [properties] Properties to set
         * @returns {types.GameSession} GameSession instance
         */
        GameSession.create = function create(properties) {
            return new GameSession(properties);
        };

        /**
         * Encodes the specified GameSession message. Does not implicitly {@link types.GameSession.verify|verify} messages.
         * @function encode
         * @memberof types.GameSession
         * @static
         * @param {types.IGameSession} message GameSession message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSession.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.gameId);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.mode);
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.utcDate);
            if (message.seed != null && Object.hasOwnProperty.call(message, "seed"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.seed);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.status);
            if (message.startedHeight != null && Object.hasOwnProperty.call(message, "startedHeight"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.startedHeight);
            if (message.startedAtUnix != null && Object.hasOwnProperty.call(message, "startedAtUnix"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.startedAtUnix);
            if (message.feePaid != null && Object.hasOwnProperty.call(message, "feePaid"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.feePaid);
            if (message.maxMoves != null && Object.hasOwnProperty.call(message, "maxMoves"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint64(message.maxMoves);
            if (message.submittedScore != null && Object.hasOwnProperty.call(message, "submittedScore"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint64(message.submittedScore);
            if (message.submittedMaxTile != null && Object.hasOwnProperty.call(message, "submittedMaxTile"))
                writer.uint32(/* id 12, wireType 0 =*/96).uint64(message.submittedMaxTile);
            if (message.finalMoveCount != null && Object.hasOwnProperty.call(message, "finalMoveCount"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint64(message.finalMoveCount);
            if (message.stopReason != null && Object.hasOwnProperty.call(message, "stopReason"))
                writer.uint32(/* id 14, wireType 0 =*/112).int32(message.stopReason);
            if (message.submittedAtUnix != null && Object.hasOwnProperty.call(message, "submittedAtUnix"))
                writer.uint32(/* id 15, wireType 0 =*/120).uint64(message.submittedAtUnix);
            return writer;
        };

        /**
         * Encodes the specified GameSession message, length delimited. Does not implicitly {@link types.GameSession.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.GameSession
         * @static
         * @param {types.IGameSession} message GameSession message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSession.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameSession message from the specified reader or buffer.
         * @function decode
         * @memberof types.GameSession
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.GameSession} GameSession
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSession.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.GameSession();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.gameId = reader.bytes();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.mode = reader.int32();
                        break;
                    }
                case 4: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 5: {
                        message.seed = reader.bytes();
                        break;
                    }
                case 6: {
                        message.status = reader.int32();
                        break;
                    }
                case 7: {
                        message.startedHeight = reader.uint64();
                        break;
                    }
                case 8: {
                        message.startedAtUnix = reader.uint64();
                        break;
                    }
                case 9: {
                        message.feePaid = reader.uint64();
                        break;
                    }
                case 10: {
                        message.maxMoves = reader.uint64();
                        break;
                    }
                case 11: {
                        message.submittedScore = reader.uint64();
                        break;
                    }
                case 12: {
                        message.submittedMaxTile = reader.uint64();
                        break;
                    }
                case 13: {
                        message.finalMoveCount = reader.uint64();
                        break;
                    }
                case 14: {
                        message.stopReason = reader.int32();
                        break;
                    }
                case 15: {
                        message.submittedAtUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameSession message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.GameSession
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.GameSession} GameSession
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSession.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameSession message.
         * @function verify
         * @memberof types.GameSession
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameSession.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.mode != null && message.hasOwnProperty("mode"))
                switch (message.mode) {
                default:
                    return "mode: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.seed != null && message.hasOwnProperty("seed"))
                if (!(message.seed && typeof message.seed.length === "number" || $util.isString(message.seed)))
                    return "seed: buffer expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.startedHeight != null && message.hasOwnProperty("startedHeight"))
                if (!$util.isInteger(message.startedHeight) && !(message.startedHeight && $util.isInteger(message.startedHeight.low) && $util.isInteger(message.startedHeight.high)))
                    return "startedHeight: integer|Long expected";
            if (message.startedAtUnix != null && message.hasOwnProperty("startedAtUnix"))
                if (!$util.isInteger(message.startedAtUnix) && !(message.startedAtUnix && $util.isInteger(message.startedAtUnix.low) && $util.isInteger(message.startedAtUnix.high)))
                    return "startedAtUnix: integer|Long expected";
            if (message.feePaid != null && message.hasOwnProperty("feePaid"))
                if (!$util.isInteger(message.feePaid) && !(message.feePaid && $util.isInteger(message.feePaid.low) && $util.isInteger(message.feePaid.high)))
                    return "feePaid: integer|Long expected";
            if (message.maxMoves != null && message.hasOwnProperty("maxMoves"))
                if (!$util.isInteger(message.maxMoves) && !(message.maxMoves && $util.isInteger(message.maxMoves.low) && $util.isInteger(message.maxMoves.high)))
                    return "maxMoves: integer|Long expected";
            if (message.submittedScore != null && message.hasOwnProperty("submittedScore"))
                if (!$util.isInteger(message.submittedScore) && !(message.submittedScore && $util.isInteger(message.submittedScore.low) && $util.isInteger(message.submittedScore.high)))
                    return "submittedScore: integer|Long expected";
            if (message.submittedMaxTile != null && message.hasOwnProperty("submittedMaxTile"))
                if (!$util.isInteger(message.submittedMaxTile) && !(message.submittedMaxTile && $util.isInteger(message.submittedMaxTile.low) && $util.isInteger(message.submittedMaxTile.high)))
                    return "submittedMaxTile: integer|Long expected";
            if (message.finalMoveCount != null && message.hasOwnProperty("finalMoveCount"))
                if (!$util.isInteger(message.finalMoveCount) && !(message.finalMoveCount && $util.isInteger(message.finalMoveCount.low) && $util.isInteger(message.finalMoveCount.high)))
                    return "finalMoveCount: integer|Long expected";
            if (message.stopReason != null && message.hasOwnProperty("stopReason"))
                switch (message.stopReason) {
                default:
                    return "stopReason: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.submittedAtUnix != null && message.hasOwnProperty("submittedAtUnix"))
                if (!$util.isInteger(message.submittedAtUnix) && !(message.submittedAtUnix && $util.isInteger(message.submittedAtUnix.low) && $util.isInteger(message.submittedAtUnix.high)))
                    return "submittedAtUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a GameSession message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.GameSession
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.GameSession} GameSession
         */
        GameSession.fromObject = function fromObject(object) {
            if (object instanceof $root.types.GameSession)
                return object;
            var message = new $root.types.GameSession();
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            switch (object.mode) {
            default:
                if (typeof object.mode === "number") {
                    message.mode = object.mode;
                    break;
                }
                break;
            case "GAME_MODE_UNSPECIFIED":
            case 0:
                message.mode = 0;
                break;
            case "GAME_MODE_DAILY":
            case 1:
                message.mode = 1;
                break;
            case "GAME_MODE_CLASSIC":
            case 2:
                message.mode = 2;
                break;
            }
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.seed != null)
                if (typeof object.seed === "string")
                    $util.base64.decode(object.seed, message.seed = $util.newBuffer($util.base64.length(object.seed)), 0);
                else if (object.seed.length >= 0)
                    message.seed = object.seed;
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "SESSION_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "SESSION_STATUS_ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "SESSION_STATUS_COMPLETED":
            case 2:
                message.status = 2;
                break;
            case "SESSION_STATUS_EXPIRED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.startedHeight != null)
                if ($util.Long)
                    (message.startedHeight = $util.Long.fromValue(object.startedHeight)).unsigned = true;
                else if (typeof object.startedHeight === "string")
                    message.startedHeight = parseInt(object.startedHeight, 10);
                else if (typeof object.startedHeight === "number")
                    message.startedHeight = object.startedHeight;
                else if (typeof object.startedHeight === "object")
                    message.startedHeight = new $util.LongBits(object.startedHeight.low >>> 0, object.startedHeight.high >>> 0).toNumber(true);
            if (object.startedAtUnix != null)
                if ($util.Long)
                    (message.startedAtUnix = $util.Long.fromValue(object.startedAtUnix)).unsigned = true;
                else if (typeof object.startedAtUnix === "string")
                    message.startedAtUnix = parseInt(object.startedAtUnix, 10);
                else if (typeof object.startedAtUnix === "number")
                    message.startedAtUnix = object.startedAtUnix;
                else if (typeof object.startedAtUnix === "object")
                    message.startedAtUnix = new $util.LongBits(object.startedAtUnix.low >>> 0, object.startedAtUnix.high >>> 0).toNumber(true);
            if (object.feePaid != null)
                if ($util.Long)
                    (message.feePaid = $util.Long.fromValue(object.feePaid)).unsigned = true;
                else if (typeof object.feePaid === "string")
                    message.feePaid = parseInt(object.feePaid, 10);
                else if (typeof object.feePaid === "number")
                    message.feePaid = object.feePaid;
                else if (typeof object.feePaid === "object")
                    message.feePaid = new $util.LongBits(object.feePaid.low >>> 0, object.feePaid.high >>> 0).toNumber(true);
            if (object.maxMoves != null)
                if ($util.Long)
                    (message.maxMoves = $util.Long.fromValue(object.maxMoves)).unsigned = true;
                else if (typeof object.maxMoves === "string")
                    message.maxMoves = parseInt(object.maxMoves, 10);
                else if (typeof object.maxMoves === "number")
                    message.maxMoves = object.maxMoves;
                else if (typeof object.maxMoves === "object")
                    message.maxMoves = new $util.LongBits(object.maxMoves.low >>> 0, object.maxMoves.high >>> 0).toNumber(true);
            if (object.submittedScore != null)
                if ($util.Long)
                    (message.submittedScore = $util.Long.fromValue(object.submittedScore)).unsigned = true;
                else if (typeof object.submittedScore === "string")
                    message.submittedScore = parseInt(object.submittedScore, 10);
                else if (typeof object.submittedScore === "number")
                    message.submittedScore = object.submittedScore;
                else if (typeof object.submittedScore === "object")
                    message.submittedScore = new $util.LongBits(object.submittedScore.low >>> 0, object.submittedScore.high >>> 0).toNumber(true);
            if (object.submittedMaxTile != null)
                if ($util.Long)
                    (message.submittedMaxTile = $util.Long.fromValue(object.submittedMaxTile)).unsigned = true;
                else if (typeof object.submittedMaxTile === "string")
                    message.submittedMaxTile = parseInt(object.submittedMaxTile, 10);
                else if (typeof object.submittedMaxTile === "number")
                    message.submittedMaxTile = object.submittedMaxTile;
                else if (typeof object.submittedMaxTile === "object")
                    message.submittedMaxTile = new $util.LongBits(object.submittedMaxTile.low >>> 0, object.submittedMaxTile.high >>> 0).toNumber(true);
            if (object.finalMoveCount != null)
                if ($util.Long)
                    (message.finalMoveCount = $util.Long.fromValue(object.finalMoveCount)).unsigned = true;
                else if (typeof object.finalMoveCount === "string")
                    message.finalMoveCount = parseInt(object.finalMoveCount, 10);
                else if (typeof object.finalMoveCount === "number")
                    message.finalMoveCount = object.finalMoveCount;
                else if (typeof object.finalMoveCount === "object")
                    message.finalMoveCount = new $util.LongBits(object.finalMoveCount.low >>> 0, object.finalMoveCount.high >>> 0).toNumber(true);
            switch (object.stopReason) {
            default:
                if (typeof object.stopReason === "number") {
                    message.stopReason = object.stopReason;
                    break;
                }
                break;
            case "STOP_REASON_UNSPECIFIED":
            case 0:
                message.stopReason = 0;
                break;
            case "STOP_REASON_PLAYER_STOPPED":
            case 1:
                message.stopReason = 1;
                break;
            case "STOP_REASON_NO_MOVES":
            case 2:
                message.stopReason = 2;
                break;
            case "STOP_REASON_MAX_MOVES":
            case 3:
                message.stopReason = 3;
                break;
            }
            if (object.submittedAtUnix != null)
                if ($util.Long)
                    (message.submittedAtUnix = $util.Long.fromValue(object.submittedAtUnix)).unsigned = true;
                else if (typeof object.submittedAtUnix === "string")
                    message.submittedAtUnix = parseInt(object.submittedAtUnix, 10);
                else if (typeof object.submittedAtUnix === "number")
                    message.submittedAtUnix = object.submittedAtUnix;
                else if (typeof object.submittedAtUnix === "object")
                    message.submittedAtUnix = new $util.LongBits(object.submittedAtUnix.low >>> 0, object.submittedAtUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a GameSession message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.GameSession
         * @static
         * @param {types.GameSession} message GameSession
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameSession.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                object.mode = options.enums === String ? "GAME_MODE_UNSPECIFIED" : 0;
                object.utcDate = "";
                if (options.bytes === String)
                    object.seed = "";
                else {
                    object.seed = [];
                    if (options.bytes !== Array)
                        object.seed = $util.newBuffer(object.seed);
                }
                object.status = options.enums === String ? "SESSION_STATUS_UNSPECIFIED" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.startedHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.startedHeight = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.startedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.startedAtUnix = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.feePaid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.feePaid = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.maxMoves = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxMoves = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.submittedScore = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.submittedScore = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.submittedMaxTile = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.submittedMaxTile = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.finalMoveCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.finalMoveCount = options.longs === String ? "0" : 0;
                object.stopReason = options.enums === String ? "STOP_REASON_UNSPECIFIED" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.submittedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.submittedAtUnix = options.longs === String ? "0" : 0;
            }
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.mode != null && message.hasOwnProperty("mode"))
                object.mode = options.enums === String ? $root.types.GameMode[message.mode] === undefined ? message.mode : $root.types.GameMode[message.mode] : message.mode;
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.seed != null && message.hasOwnProperty("seed"))
                object.seed = options.bytes === String ? $util.base64.encode(message.seed, 0, message.seed.length) : options.bytes === Array ? Array.prototype.slice.call(message.seed) : message.seed;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.types.SessionStatus[message.status] === undefined ? message.status : $root.types.SessionStatus[message.status] : message.status;
            if (message.startedHeight != null && message.hasOwnProperty("startedHeight"))
                if (typeof message.startedHeight === "number")
                    object.startedHeight = options.longs === String ? String(message.startedHeight) : message.startedHeight;
                else
                    object.startedHeight = options.longs === String ? $util.Long.prototype.toString.call(message.startedHeight) : options.longs === Number ? new $util.LongBits(message.startedHeight.low >>> 0, message.startedHeight.high >>> 0).toNumber(true) : message.startedHeight;
            if (message.startedAtUnix != null && message.hasOwnProperty("startedAtUnix"))
                if (typeof message.startedAtUnix === "number")
                    object.startedAtUnix = options.longs === String ? String(message.startedAtUnix) : message.startedAtUnix;
                else
                    object.startedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.startedAtUnix) : options.longs === Number ? new $util.LongBits(message.startedAtUnix.low >>> 0, message.startedAtUnix.high >>> 0).toNumber(true) : message.startedAtUnix;
            if (message.feePaid != null && message.hasOwnProperty("feePaid"))
                if (typeof message.feePaid === "number")
                    object.feePaid = options.longs === String ? String(message.feePaid) : message.feePaid;
                else
                    object.feePaid = options.longs === String ? $util.Long.prototype.toString.call(message.feePaid) : options.longs === Number ? new $util.LongBits(message.feePaid.low >>> 0, message.feePaid.high >>> 0).toNumber(true) : message.feePaid;
            if (message.maxMoves != null && message.hasOwnProperty("maxMoves"))
                if (typeof message.maxMoves === "number")
                    object.maxMoves = options.longs === String ? String(message.maxMoves) : message.maxMoves;
                else
                    object.maxMoves = options.longs === String ? $util.Long.prototype.toString.call(message.maxMoves) : options.longs === Number ? new $util.LongBits(message.maxMoves.low >>> 0, message.maxMoves.high >>> 0).toNumber(true) : message.maxMoves;
            if (message.submittedScore != null && message.hasOwnProperty("submittedScore"))
                if (typeof message.submittedScore === "number")
                    object.submittedScore = options.longs === String ? String(message.submittedScore) : message.submittedScore;
                else
                    object.submittedScore = options.longs === String ? $util.Long.prototype.toString.call(message.submittedScore) : options.longs === Number ? new $util.LongBits(message.submittedScore.low >>> 0, message.submittedScore.high >>> 0).toNumber(true) : message.submittedScore;
            if (message.submittedMaxTile != null && message.hasOwnProperty("submittedMaxTile"))
                if (typeof message.submittedMaxTile === "number")
                    object.submittedMaxTile = options.longs === String ? String(message.submittedMaxTile) : message.submittedMaxTile;
                else
                    object.submittedMaxTile = options.longs === String ? $util.Long.prototype.toString.call(message.submittedMaxTile) : options.longs === Number ? new $util.LongBits(message.submittedMaxTile.low >>> 0, message.submittedMaxTile.high >>> 0).toNumber(true) : message.submittedMaxTile;
            if (message.finalMoveCount != null && message.hasOwnProperty("finalMoveCount"))
                if (typeof message.finalMoveCount === "number")
                    object.finalMoveCount = options.longs === String ? String(message.finalMoveCount) : message.finalMoveCount;
                else
                    object.finalMoveCount = options.longs === String ? $util.Long.prototype.toString.call(message.finalMoveCount) : options.longs === Number ? new $util.LongBits(message.finalMoveCount.low >>> 0, message.finalMoveCount.high >>> 0).toNumber(true) : message.finalMoveCount;
            if (message.stopReason != null && message.hasOwnProperty("stopReason"))
                object.stopReason = options.enums === String ? $root.types.StopReason[message.stopReason] === undefined ? message.stopReason : $root.types.StopReason[message.stopReason] : message.stopReason;
            if (message.submittedAtUnix != null && message.hasOwnProperty("submittedAtUnix"))
                if (typeof message.submittedAtUnix === "number")
                    object.submittedAtUnix = options.longs === String ? String(message.submittedAtUnix) : message.submittedAtUnix;
                else
                    object.submittedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.submittedAtUnix) : options.longs === Number ? new $util.LongBits(message.submittedAtUnix.low >>> 0, message.submittedAtUnix.high >>> 0).toNumber(true) : message.submittedAtUnix;
            return object;
        };

        /**
         * Converts this GameSession to JSON.
         * @function toJSON
         * @memberof types.GameSession
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameSession.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GameSession
         * @function getTypeUrl
         * @memberof types.GameSession
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GameSession.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.GameSession";
        };

        return GameSession;
    })();

    types.DailyAttempt = (function() {

        /**
         * Properties of a DailyAttempt.
         * @memberof types
         * @interface IDailyAttempt
         * @property {string|null} [utcDate] DailyAttempt utcDate
         * @property {Uint8Array|null} [playerAddress] DailyAttempt playerAddress
         * @property {Uint8Array|null} [gameId] DailyAttempt gameId
         */

        /**
         * Constructs a new DailyAttempt.
         * @memberof types
         * @classdesc Represents a DailyAttempt.
         * @implements IDailyAttempt
         * @constructor
         * @param {types.IDailyAttempt=} [properties] Properties to set
         */
        function DailyAttempt(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DailyAttempt utcDate.
         * @member {string} utcDate
         * @memberof types.DailyAttempt
         * @instance
         */
        DailyAttempt.prototype.utcDate = "";

        /**
         * DailyAttempt playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.DailyAttempt
         * @instance
         */
        DailyAttempt.prototype.playerAddress = $util.newBuffer([]);

        /**
         * DailyAttempt gameId.
         * @member {Uint8Array} gameId
         * @memberof types.DailyAttempt
         * @instance
         */
        DailyAttempt.prototype.gameId = $util.newBuffer([]);

        /**
         * Creates a new DailyAttempt instance using the specified properties.
         * @function create
         * @memberof types.DailyAttempt
         * @static
         * @param {types.IDailyAttempt=} [properties] Properties to set
         * @returns {types.DailyAttempt} DailyAttempt instance
         */
        DailyAttempt.create = function create(properties) {
            return new DailyAttempt(properties);
        };

        /**
         * Encodes the specified DailyAttempt message. Does not implicitly {@link types.DailyAttempt.verify|verify} messages.
         * @function encode
         * @memberof types.DailyAttempt
         * @static
         * @param {types.IDailyAttempt} message DailyAttempt message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyAttempt.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.gameId);
            return writer;
        };

        /**
         * Encodes the specified DailyAttempt message, length delimited. Does not implicitly {@link types.DailyAttempt.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.DailyAttempt
         * @static
         * @param {types.IDailyAttempt} message DailyAttempt message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyAttempt.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DailyAttempt message from the specified reader or buffer.
         * @function decode
         * @memberof types.DailyAttempt
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.DailyAttempt} DailyAttempt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyAttempt.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.DailyAttempt();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.gameId = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DailyAttempt message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.DailyAttempt
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.DailyAttempt} DailyAttempt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyAttempt.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DailyAttempt message.
         * @function verify
         * @memberof types.DailyAttempt
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DailyAttempt.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            return null;
        };

        /**
         * Creates a DailyAttempt message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.DailyAttempt
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.DailyAttempt} DailyAttempt
         */
        DailyAttempt.fromObject = function fromObject(object) {
            if (object instanceof $root.types.DailyAttempt)
                return object;
            var message = new $root.types.DailyAttempt();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            return message;
        };

        /**
         * Creates a plain object from a DailyAttempt message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.DailyAttempt
         * @static
         * @param {types.DailyAttempt} message DailyAttempt
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DailyAttempt.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            return object;
        };

        /**
         * Converts this DailyAttempt to JSON.
         * @function toJSON
         * @memberof types.DailyAttempt
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DailyAttempt.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DailyAttempt
         * @function getTypeUrl
         * @memberof types.DailyAttempt
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DailyAttempt.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.DailyAttempt";
        };

        return DailyAttempt;
    })();

    types.DailySubmission = (function() {

        /**
         * Properties of a DailySubmission.
         * @memberof types
         * @interface IDailySubmission
         * @property {string|null} [utcDate] DailySubmission utcDate
         * @property {Uint8Array|null} [playerAddress] DailySubmission playerAddress
         * @property {Uint8Array|null} [gameId] DailySubmission gameId
         * @property {number|Long|null} [score] DailySubmission score
         * @property {number|Long|null} [maxTile] DailySubmission maxTile
         * @property {number|Long|null} [moveCount] DailySubmission moveCount
         * @property {number|Long|null} [submittedAtUnix] DailySubmission submittedAtUnix
         */

        /**
         * Constructs a new DailySubmission.
         * @memberof types
         * @classdesc Represents a DailySubmission.
         * @implements IDailySubmission
         * @constructor
         * @param {types.IDailySubmission=} [properties] Properties to set
         */
        function DailySubmission(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DailySubmission utcDate.
         * @member {string} utcDate
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.utcDate = "";

        /**
         * DailySubmission playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.playerAddress = $util.newBuffer([]);

        /**
         * DailySubmission gameId.
         * @member {Uint8Array} gameId
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.gameId = $util.newBuffer([]);

        /**
         * DailySubmission score.
         * @member {number|Long} score
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.score = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailySubmission maxTile.
         * @member {number|Long} maxTile
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.maxTile = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailySubmission moveCount.
         * @member {number|Long} moveCount
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.moveCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailySubmission submittedAtUnix.
         * @member {number|Long} submittedAtUnix
         * @memberof types.DailySubmission
         * @instance
         */
        DailySubmission.prototype.submittedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new DailySubmission instance using the specified properties.
         * @function create
         * @memberof types.DailySubmission
         * @static
         * @param {types.IDailySubmission=} [properties] Properties to set
         * @returns {types.DailySubmission} DailySubmission instance
         */
        DailySubmission.create = function create(properties) {
            return new DailySubmission(properties);
        };

        /**
         * Encodes the specified DailySubmission message. Does not implicitly {@link types.DailySubmission.verify|verify} messages.
         * @function encode
         * @memberof types.DailySubmission
         * @static
         * @param {types.IDailySubmission} message DailySubmission message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailySubmission.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.gameId);
            if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.score);
            if (message.maxTile != null && Object.hasOwnProperty.call(message, "maxTile"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.maxTile);
            if (message.moveCount != null && Object.hasOwnProperty.call(message, "moveCount"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.moveCount);
            if (message.submittedAtUnix != null && Object.hasOwnProperty.call(message, "submittedAtUnix"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.submittedAtUnix);
            return writer;
        };

        /**
         * Encodes the specified DailySubmission message, length delimited. Does not implicitly {@link types.DailySubmission.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.DailySubmission
         * @static
         * @param {types.IDailySubmission} message DailySubmission message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailySubmission.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DailySubmission message from the specified reader or buffer.
         * @function decode
         * @memberof types.DailySubmission
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.DailySubmission} DailySubmission
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailySubmission.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.DailySubmission();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.gameId = reader.bytes();
                        break;
                    }
                case 4: {
                        message.score = reader.uint64();
                        break;
                    }
                case 5: {
                        message.maxTile = reader.uint64();
                        break;
                    }
                case 6: {
                        message.moveCount = reader.uint64();
                        break;
                    }
                case 7: {
                        message.submittedAtUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DailySubmission message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.DailySubmission
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.DailySubmission} DailySubmission
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailySubmission.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DailySubmission message.
         * @function verify
         * @memberof types.DailySubmission
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DailySubmission.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            if (message.score != null && message.hasOwnProperty("score"))
                if (!$util.isInteger(message.score) && !(message.score && $util.isInteger(message.score.low) && $util.isInteger(message.score.high)))
                    return "score: integer|Long expected";
            if (message.maxTile != null && message.hasOwnProperty("maxTile"))
                if (!$util.isInteger(message.maxTile) && !(message.maxTile && $util.isInteger(message.maxTile.low) && $util.isInteger(message.maxTile.high)))
                    return "maxTile: integer|Long expected";
            if (message.moveCount != null && message.hasOwnProperty("moveCount"))
                if (!$util.isInteger(message.moveCount) && !(message.moveCount && $util.isInteger(message.moveCount.low) && $util.isInteger(message.moveCount.high)))
                    return "moveCount: integer|Long expected";
            if (message.submittedAtUnix != null && message.hasOwnProperty("submittedAtUnix"))
                if (!$util.isInteger(message.submittedAtUnix) && !(message.submittedAtUnix && $util.isInteger(message.submittedAtUnix.low) && $util.isInteger(message.submittedAtUnix.high)))
                    return "submittedAtUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a DailySubmission message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.DailySubmission
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.DailySubmission} DailySubmission
         */
        DailySubmission.fromObject = function fromObject(object) {
            if (object instanceof $root.types.DailySubmission)
                return object;
            var message = new $root.types.DailySubmission();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            if (object.score != null)
                if ($util.Long)
                    (message.score = $util.Long.fromValue(object.score)).unsigned = true;
                else if (typeof object.score === "string")
                    message.score = parseInt(object.score, 10);
                else if (typeof object.score === "number")
                    message.score = object.score;
                else if (typeof object.score === "object")
                    message.score = new $util.LongBits(object.score.low >>> 0, object.score.high >>> 0).toNumber(true);
            if (object.maxTile != null)
                if ($util.Long)
                    (message.maxTile = $util.Long.fromValue(object.maxTile)).unsigned = true;
                else if (typeof object.maxTile === "string")
                    message.maxTile = parseInt(object.maxTile, 10);
                else if (typeof object.maxTile === "number")
                    message.maxTile = object.maxTile;
                else if (typeof object.maxTile === "object")
                    message.maxTile = new $util.LongBits(object.maxTile.low >>> 0, object.maxTile.high >>> 0).toNumber(true);
            if (object.moveCount != null)
                if ($util.Long)
                    (message.moveCount = $util.Long.fromValue(object.moveCount)).unsigned = true;
                else if (typeof object.moveCount === "string")
                    message.moveCount = parseInt(object.moveCount, 10);
                else if (typeof object.moveCount === "number")
                    message.moveCount = object.moveCount;
                else if (typeof object.moveCount === "object")
                    message.moveCount = new $util.LongBits(object.moveCount.low >>> 0, object.moveCount.high >>> 0).toNumber(true);
            if (object.submittedAtUnix != null)
                if ($util.Long)
                    (message.submittedAtUnix = $util.Long.fromValue(object.submittedAtUnix)).unsigned = true;
                else if (typeof object.submittedAtUnix === "string")
                    message.submittedAtUnix = parseInt(object.submittedAtUnix, 10);
                else if (typeof object.submittedAtUnix === "number")
                    message.submittedAtUnix = object.submittedAtUnix;
                else if (typeof object.submittedAtUnix === "object")
                    message.submittedAtUnix = new $util.LongBits(object.submittedAtUnix.low >>> 0, object.submittedAtUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a DailySubmission message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.DailySubmission
         * @static
         * @param {types.DailySubmission} message DailySubmission
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DailySubmission.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.score = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.score = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.maxTile = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxTile = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.moveCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.moveCount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.submittedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.submittedAtUnix = options.longs === String ? "0" : 0;
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            if (message.score != null && message.hasOwnProperty("score"))
                if (typeof message.score === "number")
                    object.score = options.longs === String ? String(message.score) : message.score;
                else
                    object.score = options.longs === String ? $util.Long.prototype.toString.call(message.score) : options.longs === Number ? new $util.LongBits(message.score.low >>> 0, message.score.high >>> 0).toNumber(true) : message.score;
            if (message.maxTile != null && message.hasOwnProperty("maxTile"))
                if (typeof message.maxTile === "number")
                    object.maxTile = options.longs === String ? String(message.maxTile) : message.maxTile;
                else
                    object.maxTile = options.longs === String ? $util.Long.prototype.toString.call(message.maxTile) : options.longs === Number ? new $util.LongBits(message.maxTile.low >>> 0, message.maxTile.high >>> 0).toNumber(true) : message.maxTile;
            if (message.moveCount != null && message.hasOwnProperty("moveCount"))
                if (typeof message.moveCount === "number")
                    object.moveCount = options.longs === String ? String(message.moveCount) : message.moveCount;
                else
                    object.moveCount = options.longs === String ? $util.Long.prototype.toString.call(message.moveCount) : options.longs === Number ? new $util.LongBits(message.moveCount.low >>> 0, message.moveCount.high >>> 0).toNumber(true) : message.moveCount;
            if (message.submittedAtUnix != null && message.hasOwnProperty("submittedAtUnix"))
                if (typeof message.submittedAtUnix === "number")
                    object.submittedAtUnix = options.longs === String ? String(message.submittedAtUnix) : message.submittedAtUnix;
                else
                    object.submittedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.submittedAtUnix) : options.longs === Number ? new $util.LongBits(message.submittedAtUnix.low >>> 0, message.submittedAtUnix.high >>> 0).toNumber(true) : message.submittedAtUnix;
            return object;
        };

        /**
         * Converts this DailySubmission to JSON.
         * @function toJSON
         * @memberof types.DailySubmission
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DailySubmission.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DailySubmission
         * @function getTypeUrl
         * @memberof types.DailySubmission
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DailySubmission.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.DailySubmission";
        };

        return DailySubmission;
    })();

    types.DailyPrizePool = (function() {

        /**
         * Properties of a DailyPrizePool.
         * @memberof types
         * @interface IDailyPrizePool
         * @property {string|null} [utcDate] DailyPrizePool utcDate
         * @property {number|Long|null} [entryCount] DailyPrizePool entryCount
         * @property {number|Long|null} [grossFees] DailyPrizePool grossFees
         * @property {number|Long|null} [treasuryFees] DailyPrizePool treasuryFees
         * @property {number|Long|null} [rewardPool] DailyPrizePool rewardPool
         * @property {boolean|null} [finalized] DailyPrizePool finalized
         * @property {number|Long|null} [finalizedAtUnix] DailyPrizePool finalizedAtUnix
         * @property {number|Long|null} [distributedRewards] DailyPrizePool distributedRewards
         * @property {number|Long|null} [treasuryLeftover] DailyPrizePool treasuryLeftover
         */

        /**
         * Constructs a new DailyPrizePool.
         * @memberof types
         * @classdesc Represents a DailyPrizePool.
         * @implements IDailyPrizePool
         * @constructor
         * @param {types.IDailyPrizePool=} [properties] Properties to set
         */
        function DailyPrizePool(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DailyPrizePool utcDate.
         * @member {string} utcDate
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.utcDate = "";

        /**
         * DailyPrizePool entryCount.
         * @member {number|Long} entryCount
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.entryCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyPrizePool grossFees.
         * @member {number|Long} grossFees
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.grossFees = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyPrizePool treasuryFees.
         * @member {number|Long} treasuryFees
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.treasuryFees = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyPrizePool rewardPool.
         * @member {number|Long} rewardPool
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.rewardPool = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyPrizePool finalized.
         * @member {boolean} finalized
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.finalized = false;

        /**
         * DailyPrizePool finalizedAtUnix.
         * @member {number|Long} finalizedAtUnix
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.finalizedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyPrizePool distributedRewards.
         * @member {number|Long} distributedRewards
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.distributedRewards = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyPrizePool treasuryLeftover.
         * @member {number|Long} treasuryLeftover
         * @memberof types.DailyPrizePool
         * @instance
         */
        DailyPrizePool.prototype.treasuryLeftover = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new DailyPrizePool instance using the specified properties.
         * @function create
         * @memberof types.DailyPrizePool
         * @static
         * @param {types.IDailyPrizePool=} [properties] Properties to set
         * @returns {types.DailyPrizePool} DailyPrizePool instance
         */
        DailyPrizePool.create = function create(properties) {
            return new DailyPrizePool(properties);
        };

        /**
         * Encodes the specified DailyPrizePool message. Does not implicitly {@link types.DailyPrizePool.verify|verify} messages.
         * @function encode
         * @memberof types.DailyPrizePool
         * @static
         * @param {types.IDailyPrizePool} message DailyPrizePool message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyPrizePool.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.entryCount != null && Object.hasOwnProperty.call(message, "entryCount"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.entryCount);
            if (message.grossFees != null && Object.hasOwnProperty.call(message, "grossFees"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.grossFees);
            if (message.treasuryFees != null && Object.hasOwnProperty.call(message, "treasuryFees"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.treasuryFees);
            if (message.rewardPool != null && Object.hasOwnProperty.call(message, "rewardPool"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.rewardPool);
            if (message.finalized != null && Object.hasOwnProperty.call(message, "finalized"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.finalized);
            if (message.finalizedAtUnix != null && Object.hasOwnProperty.call(message, "finalizedAtUnix"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.finalizedAtUnix);
            if (message.distributedRewards != null && Object.hasOwnProperty.call(message, "distributedRewards"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.distributedRewards);
            if (message.treasuryLeftover != null && Object.hasOwnProperty.call(message, "treasuryLeftover"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.treasuryLeftover);
            return writer;
        };

        /**
         * Encodes the specified DailyPrizePool message, length delimited. Does not implicitly {@link types.DailyPrizePool.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.DailyPrizePool
         * @static
         * @param {types.IDailyPrizePool} message DailyPrizePool message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyPrizePool.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DailyPrizePool message from the specified reader or buffer.
         * @function decode
         * @memberof types.DailyPrizePool
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.DailyPrizePool} DailyPrizePool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyPrizePool.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.DailyPrizePool();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.entryCount = reader.uint64();
                        break;
                    }
                case 3: {
                        message.grossFees = reader.uint64();
                        break;
                    }
                case 4: {
                        message.treasuryFees = reader.uint64();
                        break;
                    }
                case 5: {
                        message.rewardPool = reader.uint64();
                        break;
                    }
                case 6: {
                        message.finalized = reader.bool();
                        break;
                    }
                case 7: {
                        message.finalizedAtUnix = reader.uint64();
                        break;
                    }
                case 8: {
                        message.distributedRewards = reader.uint64();
                        break;
                    }
                case 9: {
                        message.treasuryLeftover = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DailyPrizePool message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.DailyPrizePool
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.DailyPrizePool} DailyPrizePool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyPrizePool.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DailyPrizePool message.
         * @function verify
         * @memberof types.DailyPrizePool
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DailyPrizePool.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.entryCount != null && message.hasOwnProperty("entryCount"))
                if (!$util.isInteger(message.entryCount) && !(message.entryCount && $util.isInteger(message.entryCount.low) && $util.isInteger(message.entryCount.high)))
                    return "entryCount: integer|Long expected";
            if (message.grossFees != null && message.hasOwnProperty("grossFees"))
                if (!$util.isInteger(message.grossFees) && !(message.grossFees && $util.isInteger(message.grossFees.low) && $util.isInteger(message.grossFees.high)))
                    return "grossFees: integer|Long expected";
            if (message.treasuryFees != null && message.hasOwnProperty("treasuryFees"))
                if (!$util.isInteger(message.treasuryFees) && !(message.treasuryFees && $util.isInteger(message.treasuryFees.low) && $util.isInteger(message.treasuryFees.high)))
                    return "treasuryFees: integer|Long expected";
            if (message.rewardPool != null && message.hasOwnProperty("rewardPool"))
                if (!$util.isInteger(message.rewardPool) && !(message.rewardPool && $util.isInteger(message.rewardPool.low) && $util.isInteger(message.rewardPool.high)))
                    return "rewardPool: integer|Long expected";
            if (message.finalized != null && message.hasOwnProperty("finalized"))
                if (typeof message.finalized !== "boolean")
                    return "finalized: boolean expected";
            if (message.finalizedAtUnix != null && message.hasOwnProperty("finalizedAtUnix"))
                if (!$util.isInteger(message.finalizedAtUnix) && !(message.finalizedAtUnix && $util.isInteger(message.finalizedAtUnix.low) && $util.isInteger(message.finalizedAtUnix.high)))
                    return "finalizedAtUnix: integer|Long expected";
            if (message.distributedRewards != null && message.hasOwnProperty("distributedRewards"))
                if (!$util.isInteger(message.distributedRewards) && !(message.distributedRewards && $util.isInteger(message.distributedRewards.low) && $util.isInteger(message.distributedRewards.high)))
                    return "distributedRewards: integer|Long expected";
            if (message.treasuryLeftover != null && message.hasOwnProperty("treasuryLeftover"))
                if (!$util.isInteger(message.treasuryLeftover) && !(message.treasuryLeftover && $util.isInteger(message.treasuryLeftover.low) && $util.isInteger(message.treasuryLeftover.high)))
                    return "treasuryLeftover: integer|Long expected";
            return null;
        };

        /**
         * Creates a DailyPrizePool message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.DailyPrizePool
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.DailyPrizePool} DailyPrizePool
         */
        DailyPrizePool.fromObject = function fromObject(object) {
            if (object instanceof $root.types.DailyPrizePool)
                return object;
            var message = new $root.types.DailyPrizePool();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.entryCount != null)
                if ($util.Long)
                    (message.entryCount = $util.Long.fromValue(object.entryCount)).unsigned = true;
                else if (typeof object.entryCount === "string")
                    message.entryCount = parseInt(object.entryCount, 10);
                else if (typeof object.entryCount === "number")
                    message.entryCount = object.entryCount;
                else if (typeof object.entryCount === "object")
                    message.entryCount = new $util.LongBits(object.entryCount.low >>> 0, object.entryCount.high >>> 0).toNumber(true);
            if (object.grossFees != null)
                if ($util.Long)
                    (message.grossFees = $util.Long.fromValue(object.grossFees)).unsigned = true;
                else if (typeof object.grossFees === "string")
                    message.grossFees = parseInt(object.grossFees, 10);
                else if (typeof object.grossFees === "number")
                    message.grossFees = object.grossFees;
                else if (typeof object.grossFees === "object")
                    message.grossFees = new $util.LongBits(object.grossFees.low >>> 0, object.grossFees.high >>> 0).toNumber(true);
            if (object.treasuryFees != null)
                if ($util.Long)
                    (message.treasuryFees = $util.Long.fromValue(object.treasuryFees)).unsigned = true;
                else if (typeof object.treasuryFees === "string")
                    message.treasuryFees = parseInt(object.treasuryFees, 10);
                else if (typeof object.treasuryFees === "number")
                    message.treasuryFees = object.treasuryFees;
                else if (typeof object.treasuryFees === "object")
                    message.treasuryFees = new $util.LongBits(object.treasuryFees.low >>> 0, object.treasuryFees.high >>> 0).toNumber(true);
            if (object.rewardPool != null)
                if ($util.Long)
                    (message.rewardPool = $util.Long.fromValue(object.rewardPool)).unsigned = true;
                else if (typeof object.rewardPool === "string")
                    message.rewardPool = parseInt(object.rewardPool, 10);
                else if (typeof object.rewardPool === "number")
                    message.rewardPool = object.rewardPool;
                else if (typeof object.rewardPool === "object")
                    message.rewardPool = new $util.LongBits(object.rewardPool.low >>> 0, object.rewardPool.high >>> 0).toNumber(true);
            if (object.finalized != null)
                message.finalized = Boolean(object.finalized);
            if (object.finalizedAtUnix != null)
                if ($util.Long)
                    (message.finalizedAtUnix = $util.Long.fromValue(object.finalizedAtUnix)).unsigned = true;
                else if (typeof object.finalizedAtUnix === "string")
                    message.finalizedAtUnix = parseInt(object.finalizedAtUnix, 10);
                else if (typeof object.finalizedAtUnix === "number")
                    message.finalizedAtUnix = object.finalizedAtUnix;
                else if (typeof object.finalizedAtUnix === "object")
                    message.finalizedAtUnix = new $util.LongBits(object.finalizedAtUnix.low >>> 0, object.finalizedAtUnix.high >>> 0).toNumber(true);
            if (object.distributedRewards != null)
                if ($util.Long)
                    (message.distributedRewards = $util.Long.fromValue(object.distributedRewards)).unsigned = true;
                else if (typeof object.distributedRewards === "string")
                    message.distributedRewards = parseInt(object.distributedRewards, 10);
                else if (typeof object.distributedRewards === "number")
                    message.distributedRewards = object.distributedRewards;
                else if (typeof object.distributedRewards === "object")
                    message.distributedRewards = new $util.LongBits(object.distributedRewards.low >>> 0, object.distributedRewards.high >>> 0).toNumber(true);
            if (object.treasuryLeftover != null)
                if ($util.Long)
                    (message.treasuryLeftover = $util.Long.fromValue(object.treasuryLeftover)).unsigned = true;
                else if (typeof object.treasuryLeftover === "string")
                    message.treasuryLeftover = parseInt(object.treasuryLeftover, 10);
                else if (typeof object.treasuryLeftover === "number")
                    message.treasuryLeftover = object.treasuryLeftover;
                else if (typeof object.treasuryLeftover === "object")
                    message.treasuryLeftover = new $util.LongBits(object.treasuryLeftover.low >>> 0, object.treasuryLeftover.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a DailyPrizePool message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.DailyPrizePool
         * @static
         * @param {types.DailyPrizePool} message DailyPrizePool
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DailyPrizePool.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.entryCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.entryCount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.grossFees = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.grossFees = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.treasuryFees = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.treasuryFees = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.rewardPool = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.rewardPool = options.longs === String ? "0" : 0;
                object.finalized = false;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.finalizedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.finalizedAtUnix = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.distributedRewards = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.distributedRewards = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.treasuryLeftover = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.treasuryLeftover = options.longs === String ? "0" : 0;
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.entryCount != null && message.hasOwnProperty("entryCount"))
                if (typeof message.entryCount === "number")
                    object.entryCount = options.longs === String ? String(message.entryCount) : message.entryCount;
                else
                    object.entryCount = options.longs === String ? $util.Long.prototype.toString.call(message.entryCount) : options.longs === Number ? new $util.LongBits(message.entryCount.low >>> 0, message.entryCount.high >>> 0).toNumber(true) : message.entryCount;
            if (message.grossFees != null && message.hasOwnProperty("grossFees"))
                if (typeof message.grossFees === "number")
                    object.grossFees = options.longs === String ? String(message.grossFees) : message.grossFees;
                else
                    object.grossFees = options.longs === String ? $util.Long.prototype.toString.call(message.grossFees) : options.longs === Number ? new $util.LongBits(message.grossFees.low >>> 0, message.grossFees.high >>> 0).toNumber(true) : message.grossFees;
            if (message.treasuryFees != null && message.hasOwnProperty("treasuryFees"))
                if (typeof message.treasuryFees === "number")
                    object.treasuryFees = options.longs === String ? String(message.treasuryFees) : message.treasuryFees;
                else
                    object.treasuryFees = options.longs === String ? $util.Long.prototype.toString.call(message.treasuryFees) : options.longs === Number ? new $util.LongBits(message.treasuryFees.low >>> 0, message.treasuryFees.high >>> 0).toNumber(true) : message.treasuryFees;
            if (message.rewardPool != null && message.hasOwnProperty("rewardPool"))
                if (typeof message.rewardPool === "number")
                    object.rewardPool = options.longs === String ? String(message.rewardPool) : message.rewardPool;
                else
                    object.rewardPool = options.longs === String ? $util.Long.prototype.toString.call(message.rewardPool) : options.longs === Number ? new $util.LongBits(message.rewardPool.low >>> 0, message.rewardPool.high >>> 0).toNumber(true) : message.rewardPool;
            if (message.finalized != null && message.hasOwnProperty("finalized"))
                object.finalized = message.finalized;
            if (message.finalizedAtUnix != null && message.hasOwnProperty("finalizedAtUnix"))
                if (typeof message.finalizedAtUnix === "number")
                    object.finalizedAtUnix = options.longs === String ? String(message.finalizedAtUnix) : message.finalizedAtUnix;
                else
                    object.finalizedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.finalizedAtUnix) : options.longs === Number ? new $util.LongBits(message.finalizedAtUnix.low >>> 0, message.finalizedAtUnix.high >>> 0).toNumber(true) : message.finalizedAtUnix;
            if (message.distributedRewards != null && message.hasOwnProperty("distributedRewards"))
                if (typeof message.distributedRewards === "number")
                    object.distributedRewards = options.longs === String ? String(message.distributedRewards) : message.distributedRewards;
                else
                    object.distributedRewards = options.longs === String ? $util.Long.prototype.toString.call(message.distributedRewards) : options.longs === Number ? new $util.LongBits(message.distributedRewards.low >>> 0, message.distributedRewards.high >>> 0).toNumber(true) : message.distributedRewards;
            if (message.treasuryLeftover != null && message.hasOwnProperty("treasuryLeftover"))
                if (typeof message.treasuryLeftover === "number")
                    object.treasuryLeftover = options.longs === String ? String(message.treasuryLeftover) : message.treasuryLeftover;
                else
                    object.treasuryLeftover = options.longs === String ? $util.Long.prototype.toString.call(message.treasuryLeftover) : options.longs === Number ? new $util.LongBits(message.treasuryLeftover.low >>> 0, message.treasuryLeftover.high >>> 0).toNumber(true) : message.treasuryLeftover;
            return object;
        };

        /**
         * Converts this DailyPrizePool to JSON.
         * @function toJSON
         * @memberof types.DailyPrizePool
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DailyPrizePool.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DailyPrizePool
         * @function getTypeUrl
         * @memberof types.DailyPrizePool
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DailyPrizePool.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.DailyPrizePool";
        };

        return DailyPrizePool;
    })();

    types.GameTreasury = (function() {

        /**
         * Properties of a GameTreasury.
         * @memberof types
         * @interface IGameTreasury
         * @property {number|Long|null} [platformBalance] GameTreasury platformBalance
         * @property {number|Long|null} [reserveBalance] GameTreasury reserveBalance
         * @property {number|Long|null} [shopBalance] GameTreasury shopBalance
         * @property {number|Long|null} [updatedAtUnix] GameTreasury updatedAtUnix
         */

        /**
         * Constructs a new GameTreasury.
         * @memberof types
         * @classdesc Represents a GameTreasury.
         * @implements IGameTreasury
         * @constructor
         * @param {types.IGameTreasury=} [properties] Properties to set
         */
        function GameTreasury(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameTreasury platformBalance.
         * @member {number|Long} platformBalance
         * @memberof types.GameTreasury
         * @instance
         */
        GameTreasury.prototype.platformBalance = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameTreasury reserveBalance.
         * @member {number|Long} reserveBalance
         * @memberof types.GameTreasury
         * @instance
         */
        GameTreasury.prototype.reserveBalance = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameTreasury shopBalance.
         * @member {number|Long} shopBalance
         * @memberof types.GameTreasury
         * @instance
         */
        GameTreasury.prototype.shopBalance = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * GameTreasury updatedAtUnix.
         * @member {number|Long} updatedAtUnix
         * @memberof types.GameTreasury
         * @instance
         */
        GameTreasury.prototype.updatedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new GameTreasury instance using the specified properties.
         * @function create
         * @memberof types.GameTreasury
         * @static
         * @param {types.IGameTreasury=} [properties] Properties to set
         * @returns {types.GameTreasury} GameTreasury instance
         */
        GameTreasury.create = function create(properties) {
            return new GameTreasury(properties);
        };

        /**
         * Encodes the specified GameTreasury message. Does not implicitly {@link types.GameTreasury.verify|verify} messages.
         * @function encode
         * @memberof types.GameTreasury
         * @static
         * @param {types.IGameTreasury} message GameTreasury message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameTreasury.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.platformBalance != null && Object.hasOwnProperty.call(message, "platformBalance"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.platformBalance);
            if (message.reserveBalance != null && Object.hasOwnProperty.call(message, "reserveBalance"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.reserveBalance);
            if (message.shopBalance != null && Object.hasOwnProperty.call(message, "shopBalance"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.shopBalance);
            if (message.updatedAtUnix != null && Object.hasOwnProperty.call(message, "updatedAtUnix"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.updatedAtUnix);
            return writer;
        };

        /**
         * Encodes the specified GameTreasury message, length delimited. Does not implicitly {@link types.GameTreasury.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.GameTreasury
         * @static
         * @param {types.IGameTreasury} message GameTreasury message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameTreasury.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameTreasury message from the specified reader or buffer.
         * @function decode
         * @memberof types.GameTreasury
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.GameTreasury} GameTreasury
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameTreasury.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.GameTreasury();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.platformBalance = reader.uint64();
                        break;
                    }
                case 2: {
                        message.reserveBalance = reader.uint64();
                        break;
                    }
                case 3: {
                        message.shopBalance = reader.uint64();
                        break;
                    }
                case 4: {
                        message.updatedAtUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameTreasury message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.GameTreasury
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.GameTreasury} GameTreasury
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameTreasury.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameTreasury message.
         * @function verify
         * @memberof types.GameTreasury
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameTreasury.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.platformBalance != null && message.hasOwnProperty("platformBalance"))
                if (!$util.isInteger(message.platformBalance) && !(message.platformBalance && $util.isInteger(message.platformBalance.low) && $util.isInteger(message.platformBalance.high)))
                    return "platformBalance: integer|Long expected";
            if (message.reserveBalance != null && message.hasOwnProperty("reserveBalance"))
                if (!$util.isInteger(message.reserveBalance) && !(message.reserveBalance && $util.isInteger(message.reserveBalance.low) && $util.isInteger(message.reserveBalance.high)))
                    return "reserveBalance: integer|Long expected";
            if (message.shopBalance != null && message.hasOwnProperty("shopBalance"))
                if (!$util.isInteger(message.shopBalance) && !(message.shopBalance && $util.isInteger(message.shopBalance.low) && $util.isInteger(message.shopBalance.high)))
                    return "shopBalance: integer|Long expected";
            if (message.updatedAtUnix != null && message.hasOwnProperty("updatedAtUnix"))
                if (!$util.isInteger(message.updatedAtUnix) && !(message.updatedAtUnix && $util.isInteger(message.updatedAtUnix.low) && $util.isInteger(message.updatedAtUnix.high)))
                    return "updatedAtUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a GameTreasury message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.GameTreasury
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.GameTreasury} GameTreasury
         */
        GameTreasury.fromObject = function fromObject(object) {
            if (object instanceof $root.types.GameTreasury)
                return object;
            var message = new $root.types.GameTreasury();
            if (object.platformBalance != null)
                if ($util.Long)
                    (message.platformBalance = $util.Long.fromValue(object.platformBalance)).unsigned = true;
                else if (typeof object.platformBalance === "string")
                    message.platformBalance = parseInt(object.platformBalance, 10);
                else if (typeof object.platformBalance === "number")
                    message.platformBalance = object.platformBalance;
                else if (typeof object.platformBalance === "object")
                    message.platformBalance = new $util.LongBits(object.platformBalance.low >>> 0, object.platformBalance.high >>> 0).toNumber(true);
            if (object.reserveBalance != null)
                if ($util.Long)
                    (message.reserveBalance = $util.Long.fromValue(object.reserveBalance)).unsigned = true;
                else if (typeof object.reserveBalance === "string")
                    message.reserveBalance = parseInt(object.reserveBalance, 10);
                else if (typeof object.reserveBalance === "number")
                    message.reserveBalance = object.reserveBalance;
                else if (typeof object.reserveBalance === "object")
                    message.reserveBalance = new $util.LongBits(object.reserveBalance.low >>> 0, object.reserveBalance.high >>> 0).toNumber(true);
            if (object.shopBalance != null)
                if ($util.Long)
                    (message.shopBalance = $util.Long.fromValue(object.shopBalance)).unsigned = true;
                else if (typeof object.shopBalance === "string")
                    message.shopBalance = parseInt(object.shopBalance, 10);
                else if (typeof object.shopBalance === "number")
                    message.shopBalance = object.shopBalance;
                else if (typeof object.shopBalance === "object")
                    message.shopBalance = new $util.LongBits(object.shopBalance.low >>> 0, object.shopBalance.high >>> 0).toNumber(true);
            if (object.updatedAtUnix != null)
                if ($util.Long)
                    (message.updatedAtUnix = $util.Long.fromValue(object.updatedAtUnix)).unsigned = true;
                else if (typeof object.updatedAtUnix === "string")
                    message.updatedAtUnix = parseInt(object.updatedAtUnix, 10);
                else if (typeof object.updatedAtUnix === "number")
                    message.updatedAtUnix = object.updatedAtUnix;
                else if (typeof object.updatedAtUnix === "object")
                    message.updatedAtUnix = new $util.LongBits(object.updatedAtUnix.low >>> 0, object.updatedAtUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a GameTreasury message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.GameTreasury
         * @static
         * @param {types.GameTreasury} message GameTreasury
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameTreasury.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.platformBalance = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.platformBalance = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.reserveBalance = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.reserveBalance = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.shopBalance = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.shopBalance = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.updatedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.updatedAtUnix = options.longs === String ? "0" : 0;
            }
            if (message.platformBalance != null && message.hasOwnProperty("platformBalance"))
                if (typeof message.platformBalance === "number")
                    object.platformBalance = options.longs === String ? String(message.platformBalance) : message.platformBalance;
                else
                    object.platformBalance = options.longs === String ? $util.Long.prototype.toString.call(message.platformBalance) : options.longs === Number ? new $util.LongBits(message.platformBalance.low >>> 0, message.platformBalance.high >>> 0).toNumber(true) : message.platformBalance;
            if (message.reserveBalance != null && message.hasOwnProperty("reserveBalance"))
                if (typeof message.reserveBalance === "number")
                    object.reserveBalance = options.longs === String ? String(message.reserveBalance) : message.reserveBalance;
                else
                    object.reserveBalance = options.longs === String ? $util.Long.prototype.toString.call(message.reserveBalance) : options.longs === Number ? new $util.LongBits(message.reserveBalance.low >>> 0, message.reserveBalance.high >>> 0).toNumber(true) : message.reserveBalance;
            if (message.shopBalance != null && message.hasOwnProperty("shopBalance"))
                if (typeof message.shopBalance === "number")
                    object.shopBalance = options.longs === String ? String(message.shopBalance) : message.shopBalance;
                else
                    object.shopBalance = options.longs === String ? $util.Long.prototype.toString.call(message.shopBalance) : options.longs === Number ? new $util.LongBits(message.shopBalance.low >>> 0, message.shopBalance.high >>> 0).toNumber(true) : message.shopBalance;
            if (message.updatedAtUnix != null && message.hasOwnProperty("updatedAtUnix"))
                if (typeof message.updatedAtUnix === "number")
                    object.updatedAtUnix = options.longs === String ? String(message.updatedAtUnix) : message.updatedAtUnix;
                else
                    object.updatedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.updatedAtUnix) : options.longs === Number ? new $util.LongBits(message.updatedAtUnix.low >>> 0, message.updatedAtUnix.high >>> 0).toNumber(true) : message.updatedAtUnix;
            return object;
        };

        /**
         * Converts this GameTreasury to JSON.
         * @function toJSON
         * @memberof types.GameTreasury
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameTreasury.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GameTreasury
         * @function getTypeUrl
         * @memberof types.GameTreasury
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GameTreasury.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.GameTreasury";
        };

        return GameTreasury;
    })();

    types.LeaderboardEntry = (function() {

        /**
         * Properties of a LeaderboardEntry.
         * @memberof types
         * @interface ILeaderboardEntry
         * @property {Uint8Array|null} [gameId] LeaderboardEntry gameId
         * @property {Uint8Array|null} [playerAddress] LeaderboardEntry playerAddress
         * @property {number|Long|null} [score] LeaderboardEntry score
         * @property {number|Long|null} [maxTile] LeaderboardEntry maxTile
         * @property {number|Long|null} [moveCount] LeaderboardEntry moveCount
         * @property {number|Long|null} [endedAtUnix] LeaderboardEntry endedAtUnix
         * @property {string|null} [username] LeaderboardEntry username
         */

        /**
         * Constructs a new LeaderboardEntry.
         * @memberof types
         * @classdesc Represents a LeaderboardEntry.
         * @implements ILeaderboardEntry
         * @constructor
         * @param {types.ILeaderboardEntry=} [properties] Properties to set
         */
        function LeaderboardEntry(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LeaderboardEntry gameId.
         * @member {Uint8Array} gameId
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.gameId = $util.newBuffer([]);

        /**
         * LeaderboardEntry playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.playerAddress = $util.newBuffer([]);

        /**
         * LeaderboardEntry score.
         * @member {number|Long} score
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.score = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * LeaderboardEntry maxTile.
         * @member {number|Long} maxTile
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.maxTile = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * LeaderboardEntry moveCount.
         * @member {number|Long} moveCount
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.moveCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * LeaderboardEntry endedAtUnix.
         * @member {number|Long} endedAtUnix
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.endedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * LeaderboardEntry username.
         * @member {string} username
         * @memberof types.LeaderboardEntry
         * @instance
         */
        LeaderboardEntry.prototype.username = "";

        /**
         * Creates a new LeaderboardEntry instance using the specified properties.
         * @function create
         * @memberof types.LeaderboardEntry
         * @static
         * @param {types.ILeaderboardEntry=} [properties] Properties to set
         * @returns {types.LeaderboardEntry} LeaderboardEntry instance
         */
        LeaderboardEntry.create = function create(properties) {
            return new LeaderboardEntry(properties);
        };

        /**
         * Encodes the specified LeaderboardEntry message. Does not implicitly {@link types.LeaderboardEntry.verify|verify} messages.
         * @function encode
         * @memberof types.LeaderboardEntry
         * @static
         * @param {types.ILeaderboardEntry} message LeaderboardEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LeaderboardEntry.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.gameId);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.score);
            if (message.maxTile != null && Object.hasOwnProperty.call(message, "maxTile"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.maxTile);
            if (message.moveCount != null && Object.hasOwnProperty.call(message, "moveCount"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.moveCount);
            if (message.endedAtUnix != null && Object.hasOwnProperty.call(message, "endedAtUnix"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.endedAtUnix);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.username);
            return writer;
        };

        /**
         * Encodes the specified LeaderboardEntry message, length delimited. Does not implicitly {@link types.LeaderboardEntry.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.LeaderboardEntry
         * @static
         * @param {types.ILeaderboardEntry} message LeaderboardEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LeaderboardEntry.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LeaderboardEntry message from the specified reader or buffer.
         * @function decode
         * @memberof types.LeaderboardEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.LeaderboardEntry} LeaderboardEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LeaderboardEntry.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.LeaderboardEntry();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.gameId = reader.bytes();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.score = reader.uint64();
                        break;
                    }
                case 4: {
                        message.maxTile = reader.uint64();
                        break;
                    }
                case 5: {
                        message.moveCount = reader.uint64();
                        break;
                    }
                case 6: {
                        message.endedAtUnix = reader.uint64();
                        break;
                    }
                case 7: {
                        message.username = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LeaderboardEntry message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.LeaderboardEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.LeaderboardEntry} LeaderboardEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LeaderboardEntry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LeaderboardEntry message.
         * @function verify
         * @memberof types.LeaderboardEntry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LeaderboardEntry.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.score != null && message.hasOwnProperty("score"))
                if (!$util.isInteger(message.score) && !(message.score && $util.isInteger(message.score.low) && $util.isInteger(message.score.high)))
                    return "score: integer|Long expected";
            if (message.maxTile != null && message.hasOwnProperty("maxTile"))
                if (!$util.isInteger(message.maxTile) && !(message.maxTile && $util.isInteger(message.maxTile.low) && $util.isInteger(message.maxTile.high)))
                    return "maxTile: integer|Long expected";
            if (message.moveCount != null && message.hasOwnProperty("moveCount"))
                if (!$util.isInteger(message.moveCount) && !(message.moveCount && $util.isInteger(message.moveCount.low) && $util.isInteger(message.moveCount.high)))
                    return "moveCount: integer|Long expected";
            if (message.endedAtUnix != null && message.hasOwnProperty("endedAtUnix"))
                if (!$util.isInteger(message.endedAtUnix) && !(message.endedAtUnix && $util.isInteger(message.endedAtUnix.low) && $util.isInteger(message.endedAtUnix.high)))
                    return "endedAtUnix: integer|Long expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            return null;
        };

        /**
         * Creates a LeaderboardEntry message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.LeaderboardEntry
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.LeaderboardEntry} LeaderboardEntry
         */
        LeaderboardEntry.fromObject = function fromObject(object) {
            if (object instanceof $root.types.LeaderboardEntry)
                return object;
            var message = new $root.types.LeaderboardEntry();
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.score != null)
                if ($util.Long)
                    (message.score = $util.Long.fromValue(object.score)).unsigned = true;
                else if (typeof object.score === "string")
                    message.score = parseInt(object.score, 10);
                else if (typeof object.score === "number")
                    message.score = object.score;
                else if (typeof object.score === "object")
                    message.score = new $util.LongBits(object.score.low >>> 0, object.score.high >>> 0).toNumber(true);
            if (object.maxTile != null)
                if ($util.Long)
                    (message.maxTile = $util.Long.fromValue(object.maxTile)).unsigned = true;
                else if (typeof object.maxTile === "string")
                    message.maxTile = parseInt(object.maxTile, 10);
                else if (typeof object.maxTile === "number")
                    message.maxTile = object.maxTile;
                else if (typeof object.maxTile === "object")
                    message.maxTile = new $util.LongBits(object.maxTile.low >>> 0, object.maxTile.high >>> 0).toNumber(true);
            if (object.moveCount != null)
                if ($util.Long)
                    (message.moveCount = $util.Long.fromValue(object.moveCount)).unsigned = true;
                else if (typeof object.moveCount === "string")
                    message.moveCount = parseInt(object.moveCount, 10);
                else if (typeof object.moveCount === "number")
                    message.moveCount = object.moveCount;
                else if (typeof object.moveCount === "object")
                    message.moveCount = new $util.LongBits(object.moveCount.low >>> 0, object.moveCount.high >>> 0).toNumber(true);
            if (object.endedAtUnix != null)
                if ($util.Long)
                    (message.endedAtUnix = $util.Long.fromValue(object.endedAtUnix)).unsigned = true;
                else if (typeof object.endedAtUnix === "string")
                    message.endedAtUnix = parseInt(object.endedAtUnix, 10);
                else if (typeof object.endedAtUnix === "number")
                    message.endedAtUnix = object.endedAtUnix;
                else if (typeof object.endedAtUnix === "object")
                    message.endedAtUnix = new $util.LongBits(object.endedAtUnix.low >>> 0, object.endedAtUnix.high >>> 0).toNumber(true);
            if (object.username != null)
                message.username = String(object.username);
            return message;
        };

        /**
         * Creates a plain object from a LeaderboardEntry message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.LeaderboardEntry
         * @static
         * @param {types.LeaderboardEntry} message LeaderboardEntry
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LeaderboardEntry.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.score = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.score = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.maxTile = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxTile = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.moveCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.moveCount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.endedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.endedAtUnix = options.longs === String ? "0" : 0;
                object.username = "";
            }
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.score != null && message.hasOwnProperty("score"))
                if (typeof message.score === "number")
                    object.score = options.longs === String ? String(message.score) : message.score;
                else
                    object.score = options.longs === String ? $util.Long.prototype.toString.call(message.score) : options.longs === Number ? new $util.LongBits(message.score.low >>> 0, message.score.high >>> 0).toNumber(true) : message.score;
            if (message.maxTile != null && message.hasOwnProperty("maxTile"))
                if (typeof message.maxTile === "number")
                    object.maxTile = options.longs === String ? String(message.maxTile) : message.maxTile;
                else
                    object.maxTile = options.longs === String ? $util.Long.prototype.toString.call(message.maxTile) : options.longs === Number ? new $util.LongBits(message.maxTile.low >>> 0, message.maxTile.high >>> 0).toNumber(true) : message.maxTile;
            if (message.moveCount != null && message.hasOwnProperty("moveCount"))
                if (typeof message.moveCount === "number")
                    object.moveCount = options.longs === String ? String(message.moveCount) : message.moveCount;
                else
                    object.moveCount = options.longs === String ? $util.Long.prototype.toString.call(message.moveCount) : options.longs === Number ? new $util.LongBits(message.moveCount.low >>> 0, message.moveCount.high >>> 0).toNumber(true) : message.moveCount;
            if (message.endedAtUnix != null && message.hasOwnProperty("endedAtUnix"))
                if (typeof message.endedAtUnix === "number")
                    object.endedAtUnix = options.longs === String ? String(message.endedAtUnix) : message.endedAtUnix;
                else
                    object.endedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.endedAtUnix) : options.longs === Number ? new $util.LongBits(message.endedAtUnix.low >>> 0, message.endedAtUnix.high >>> 0).toNumber(true) : message.endedAtUnix;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            return object;
        };

        /**
         * Converts this LeaderboardEntry to JSON.
         * @function toJSON
         * @memberof types.LeaderboardEntry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LeaderboardEntry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LeaderboardEntry
         * @function getTypeUrl
         * @memberof types.LeaderboardEntry
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LeaderboardEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.LeaderboardEntry";
        };

        return LeaderboardEntry;
    })();

    types.DailyRewardAllocation = (function() {

        /**
         * Properties of a DailyRewardAllocation.
         * @memberof types
         * @interface IDailyRewardAllocation
         * @property {string|null} [utcDate] DailyRewardAllocation utcDate
         * @property {Uint8Array|null} [playerAddress] DailyRewardAllocation playerAddress
         * @property {Uint8Array|null} [gameId] DailyRewardAllocation gameId
         * @property {number|Long|null} [rank] DailyRewardAllocation rank
         * @property {number|Long|null} [rewardAmount] DailyRewardAllocation rewardAmount
         * @property {number|Long|null} [score] DailyRewardAllocation score
         * @property {number|Long|null} [maxTile] DailyRewardAllocation maxTile
         * @property {number|Long|null} [moveCount] DailyRewardAllocation moveCount
         * @property {number|Long|null} [endedAtUnix] DailyRewardAllocation endedAtUnix
         */

        /**
         * Constructs a new DailyRewardAllocation.
         * @memberof types
         * @classdesc Represents a DailyRewardAllocation.
         * @implements IDailyRewardAllocation
         * @constructor
         * @param {types.IDailyRewardAllocation=} [properties] Properties to set
         */
        function DailyRewardAllocation(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DailyRewardAllocation utcDate.
         * @member {string} utcDate
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.utcDate = "";

        /**
         * DailyRewardAllocation playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.playerAddress = $util.newBuffer([]);

        /**
         * DailyRewardAllocation gameId.
         * @member {Uint8Array} gameId
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.gameId = $util.newBuffer([]);

        /**
         * DailyRewardAllocation rank.
         * @member {number|Long} rank
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.rank = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardAllocation rewardAmount.
         * @member {number|Long} rewardAmount
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.rewardAmount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardAllocation score.
         * @member {number|Long} score
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.score = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardAllocation maxTile.
         * @member {number|Long} maxTile
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.maxTile = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardAllocation moveCount.
         * @member {number|Long} moveCount
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.moveCount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardAllocation endedAtUnix.
         * @member {number|Long} endedAtUnix
         * @memberof types.DailyRewardAllocation
         * @instance
         */
        DailyRewardAllocation.prototype.endedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new DailyRewardAllocation instance using the specified properties.
         * @function create
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {types.IDailyRewardAllocation=} [properties] Properties to set
         * @returns {types.DailyRewardAllocation} DailyRewardAllocation instance
         */
        DailyRewardAllocation.create = function create(properties) {
            return new DailyRewardAllocation(properties);
        };

        /**
         * Encodes the specified DailyRewardAllocation message. Does not implicitly {@link types.DailyRewardAllocation.verify|verify} messages.
         * @function encode
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {types.IDailyRewardAllocation} message DailyRewardAllocation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyRewardAllocation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.gameId);
            if (message.rank != null && Object.hasOwnProperty.call(message, "rank"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.rank);
            if (message.rewardAmount != null && Object.hasOwnProperty.call(message, "rewardAmount"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.rewardAmount);
            if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.score);
            if (message.maxTile != null && Object.hasOwnProperty.call(message, "maxTile"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.maxTile);
            if (message.moveCount != null && Object.hasOwnProperty.call(message, "moveCount"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.moveCount);
            if (message.endedAtUnix != null && Object.hasOwnProperty.call(message, "endedAtUnix"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.endedAtUnix);
            return writer;
        };

        /**
         * Encodes the specified DailyRewardAllocation message, length delimited. Does not implicitly {@link types.DailyRewardAllocation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {types.IDailyRewardAllocation} message DailyRewardAllocation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyRewardAllocation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DailyRewardAllocation message from the specified reader or buffer.
         * @function decode
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.DailyRewardAllocation} DailyRewardAllocation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyRewardAllocation.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.DailyRewardAllocation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.gameId = reader.bytes();
                        break;
                    }
                case 4: {
                        message.rank = reader.uint64();
                        break;
                    }
                case 5: {
                        message.rewardAmount = reader.uint64();
                        break;
                    }
                case 6: {
                        message.score = reader.uint64();
                        break;
                    }
                case 7: {
                        message.maxTile = reader.uint64();
                        break;
                    }
                case 8: {
                        message.moveCount = reader.uint64();
                        break;
                    }
                case 9: {
                        message.endedAtUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DailyRewardAllocation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.DailyRewardAllocation} DailyRewardAllocation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyRewardAllocation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DailyRewardAllocation message.
         * @function verify
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DailyRewardAllocation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            if (message.rank != null && message.hasOwnProperty("rank"))
                if (!$util.isInteger(message.rank) && !(message.rank && $util.isInteger(message.rank.low) && $util.isInteger(message.rank.high)))
                    return "rank: integer|Long expected";
            if (message.rewardAmount != null && message.hasOwnProperty("rewardAmount"))
                if (!$util.isInteger(message.rewardAmount) && !(message.rewardAmount && $util.isInteger(message.rewardAmount.low) && $util.isInteger(message.rewardAmount.high)))
                    return "rewardAmount: integer|Long expected";
            if (message.score != null && message.hasOwnProperty("score"))
                if (!$util.isInteger(message.score) && !(message.score && $util.isInteger(message.score.low) && $util.isInteger(message.score.high)))
                    return "score: integer|Long expected";
            if (message.maxTile != null && message.hasOwnProperty("maxTile"))
                if (!$util.isInteger(message.maxTile) && !(message.maxTile && $util.isInteger(message.maxTile.low) && $util.isInteger(message.maxTile.high)))
                    return "maxTile: integer|Long expected";
            if (message.moveCount != null && message.hasOwnProperty("moveCount"))
                if (!$util.isInteger(message.moveCount) && !(message.moveCount && $util.isInteger(message.moveCount.low) && $util.isInteger(message.moveCount.high)))
                    return "moveCount: integer|Long expected";
            if (message.endedAtUnix != null && message.hasOwnProperty("endedAtUnix"))
                if (!$util.isInteger(message.endedAtUnix) && !(message.endedAtUnix && $util.isInteger(message.endedAtUnix.low) && $util.isInteger(message.endedAtUnix.high)))
                    return "endedAtUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a DailyRewardAllocation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.DailyRewardAllocation} DailyRewardAllocation
         */
        DailyRewardAllocation.fromObject = function fromObject(object) {
            if (object instanceof $root.types.DailyRewardAllocation)
                return object;
            var message = new $root.types.DailyRewardAllocation();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            if (object.rank != null)
                if ($util.Long)
                    (message.rank = $util.Long.fromValue(object.rank)).unsigned = true;
                else if (typeof object.rank === "string")
                    message.rank = parseInt(object.rank, 10);
                else if (typeof object.rank === "number")
                    message.rank = object.rank;
                else if (typeof object.rank === "object")
                    message.rank = new $util.LongBits(object.rank.low >>> 0, object.rank.high >>> 0).toNumber(true);
            if (object.rewardAmount != null)
                if ($util.Long)
                    (message.rewardAmount = $util.Long.fromValue(object.rewardAmount)).unsigned = true;
                else if (typeof object.rewardAmount === "string")
                    message.rewardAmount = parseInt(object.rewardAmount, 10);
                else if (typeof object.rewardAmount === "number")
                    message.rewardAmount = object.rewardAmount;
                else if (typeof object.rewardAmount === "object")
                    message.rewardAmount = new $util.LongBits(object.rewardAmount.low >>> 0, object.rewardAmount.high >>> 0).toNumber(true);
            if (object.score != null)
                if ($util.Long)
                    (message.score = $util.Long.fromValue(object.score)).unsigned = true;
                else if (typeof object.score === "string")
                    message.score = parseInt(object.score, 10);
                else if (typeof object.score === "number")
                    message.score = object.score;
                else if (typeof object.score === "object")
                    message.score = new $util.LongBits(object.score.low >>> 0, object.score.high >>> 0).toNumber(true);
            if (object.maxTile != null)
                if ($util.Long)
                    (message.maxTile = $util.Long.fromValue(object.maxTile)).unsigned = true;
                else if (typeof object.maxTile === "string")
                    message.maxTile = parseInt(object.maxTile, 10);
                else if (typeof object.maxTile === "number")
                    message.maxTile = object.maxTile;
                else if (typeof object.maxTile === "object")
                    message.maxTile = new $util.LongBits(object.maxTile.low >>> 0, object.maxTile.high >>> 0).toNumber(true);
            if (object.moveCount != null)
                if ($util.Long)
                    (message.moveCount = $util.Long.fromValue(object.moveCount)).unsigned = true;
                else if (typeof object.moveCount === "string")
                    message.moveCount = parseInt(object.moveCount, 10);
                else if (typeof object.moveCount === "number")
                    message.moveCount = object.moveCount;
                else if (typeof object.moveCount === "object")
                    message.moveCount = new $util.LongBits(object.moveCount.low >>> 0, object.moveCount.high >>> 0).toNumber(true);
            if (object.endedAtUnix != null)
                if ($util.Long)
                    (message.endedAtUnix = $util.Long.fromValue(object.endedAtUnix)).unsigned = true;
                else if (typeof object.endedAtUnix === "string")
                    message.endedAtUnix = parseInt(object.endedAtUnix, 10);
                else if (typeof object.endedAtUnix === "number")
                    message.endedAtUnix = object.endedAtUnix;
                else if (typeof object.endedAtUnix === "object")
                    message.endedAtUnix = new $util.LongBits(object.endedAtUnix.low >>> 0, object.endedAtUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a DailyRewardAllocation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {types.DailyRewardAllocation} message DailyRewardAllocation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DailyRewardAllocation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.rank = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.rank = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.rewardAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.rewardAmount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.score = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.score = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.maxTile = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxTile = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.moveCount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.moveCount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.endedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.endedAtUnix = options.longs === String ? "0" : 0;
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            if (message.rank != null && message.hasOwnProperty("rank"))
                if (typeof message.rank === "number")
                    object.rank = options.longs === String ? String(message.rank) : message.rank;
                else
                    object.rank = options.longs === String ? $util.Long.prototype.toString.call(message.rank) : options.longs === Number ? new $util.LongBits(message.rank.low >>> 0, message.rank.high >>> 0).toNumber(true) : message.rank;
            if (message.rewardAmount != null && message.hasOwnProperty("rewardAmount"))
                if (typeof message.rewardAmount === "number")
                    object.rewardAmount = options.longs === String ? String(message.rewardAmount) : message.rewardAmount;
                else
                    object.rewardAmount = options.longs === String ? $util.Long.prototype.toString.call(message.rewardAmount) : options.longs === Number ? new $util.LongBits(message.rewardAmount.low >>> 0, message.rewardAmount.high >>> 0).toNumber(true) : message.rewardAmount;
            if (message.score != null && message.hasOwnProperty("score"))
                if (typeof message.score === "number")
                    object.score = options.longs === String ? String(message.score) : message.score;
                else
                    object.score = options.longs === String ? $util.Long.prototype.toString.call(message.score) : options.longs === Number ? new $util.LongBits(message.score.low >>> 0, message.score.high >>> 0).toNumber(true) : message.score;
            if (message.maxTile != null && message.hasOwnProperty("maxTile"))
                if (typeof message.maxTile === "number")
                    object.maxTile = options.longs === String ? String(message.maxTile) : message.maxTile;
                else
                    object.maxTile = options.longs === String ? $util.Long.prototype.toString.call(message.maxTile) : options.longs === Number ? new $util.LongBits(message.maxTile.low >>> 0, message.maxTile.high >>> 0).toNumber(true) : message.maxTile;
            if (message.moveCount != null && message.hasOwnProperty("moveCount"))
                if (typeof message.moveCount === "number")
                    object.moveCount = options.longs === String ? String(message.moveCount) : message.moveCount;
                else
                    object.moveCount = options.longs === String ? $util.Long.prototype.toString.call(message.moveCount) : options.longs === Number ? new $util.LongBits(message.moveCount.low >>> 0, message.moveCount.high >>> 0).toNumber(true) : message.moveCount;
            if (message.endedAtUnix != null && message.hasOwnProperty("endedAtUnix"))
                if (typeof message.endedAtUnix === "number")
                    object.endedAtUnix = options.longs === String ? String(message.endedAtUnix) : message.endedAtUnix;
                else
                    object.endedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.endedAtUnix) : options.longs === Number ? new $util.LongBits(message.endedAtUnix.low >>> 0, message.endedAtUnix.high >>> 0).toNumber(true) : message.endedAtUnix;
            return object;
        };

        /**
         * Converts this DailyRewardAllocation to JSON.
         * @function toJSON
         * @memberof types.DailyRewardAllocation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DailyRewardAllocation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DailyRewardAllocation
         * @function getTypeUrl
         * @memberof types.DailyRewardAllocation
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DailyRewardAllocation.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.DailyRewardAllocation";
        };

        return DailyRewardAllocation;
    })();

    types.DailyRewardClaim = (function() {

        /**
         * Properties of a DailyRewardClaim.
         * @memberof types
         * @interface IDailyRewardClaim
         * @property {string|null} [utcDate] DailyRewardClaim utcDate
         * @property {Uint8Array|null} [playerAddress] DailyRewardClaim playerAddress
         * @property {Uint8Array|null} [gameId] DailyRewardClaim gameId
         * @property {number|Long|null} [rank] DailyRewardClaim rank
         * @property {number|Long|null} [claimedAmount] DailyRewardClaim claimedAmount
         * @property {number|Long|null} [claimedAtUnix] DailyRewardClaim claimedAtUnix
         * @property {string|null} [txHash] DailyRewardClaim txHash
         */

        /**
         * Constructs a new DailyRewardClaim.
         * @memberof types
         * @classdesc Represents a DailyRewardClaim.
         * @implements IDailyRewardClaim
         * @constructor
         * @param {types.IDailyRewardClaim=} [properties] Properties to set
         */
        function DailyRewardClaim(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DailyRewardClaim utcDate.
         * @member {string} utcDate
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.utcDate = "";

        /**
         * DailyRewardClaim playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.playerAddress = $util.newBuffer([]);

        /**
         * DailyRewardClaim gameId.
         * @member {Uint8Array} gameId
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.gameId = $util.newBuffer([]);

        /**
         * DailyRewardClaim rank.
         * @member {number|Long} rank
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.rank = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardClaim claimedAmount.
         * @member {number|Long} claimedAmount
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.claimedAmount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardClaim claimedAtUnix.
         * @member {number|Long} claimedAtUnix
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.claimedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyRewardClaim txHash.
         * @member {string} txHash
         * @memberof types.DailyRewardClaim
         * @instance
         */
        DailyRewardClaim.prototype.txHash = "";

        /**
         * Creates a new DailyRewardClaim instance using the specified properties.
         * @function create
         * @memberof types.DailyRewardClaim
         * @static
         * @param {types.IDailyRewardClaim=} [properties] Properties to set
         * @returns {types.DailyRewardClaim} DailyRewardClaim instance
         */
        DailyRewardClaim.create = function create(properties) {
            return new DailyRewardClaim(properties);
        };

        /**
         * Encodes the specified DailyRewardClaim message. Does not implicitly {@link types.DailyRewardClaim.verify|verify} messages.
         * @function encode
         * @memberof types.DailyRewardClaim
         * @static
         * @param {types.IDailyRewardClaim} message DailyRewardClaim message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyRewardClaim.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.gameId);
            if (message.rank != null && Object.hasOwnProperty.call(message, "rank"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.rank);
            if (message.claimedAmount != null && Object.hasOwnProperty.call(message, "claimedAmount"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.claimedAmount);
            if (message.claimedAtUnix != null && Object.hasOwnProperty.call(message, "claimedAtUnix"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.claimedAtUnix);
            if (message.txHash != null && Object.hasOwnProperty.call(message, "txHash"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.txHash);
            return writer;
        };

        /**
         * Encodes the specified DailyRewardClaim message, length delimited. Does not implicitly {@link types.DailyRewardClaim.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.DailyRewardClaim
         * @static
         * @param {types.IDailyRewardClaim} message DailyRewardClaim message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyRewardClaim.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DailyRewardClaim message from the specified reader or buffer.
         * @function decode
         * @memberof types.DailyRewardClaim
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.DailyRewardClaim} DailyRewardClaim
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyRewardClaim.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.DailyRewardClaim();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.gameId = reader.bytes();
                        break;
                    }
                case 4: {
                        message.rank = reader.uint64();
                        break;
                    }
                case 5: {
                        message.claimedAmount = reader.uint64();
                        break;
                    }
                case 6: {
                        message.claimedAtUnix = reader.uint64();
                        break;
                    }
                case 7: {
                        message.txHash = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DailyRewardClaim message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.DailyRewardClaim
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.DailyRewardClaim} DailyRewardClaim
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyRewardClaim.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DailyRewardClaim message.
         * @function verify
         * @memberof types.DailyRewardClaim
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DailyRewardClaim.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                if (!(message.gameId && typeof message.gameId.length === "number" || $util.isString(message.gameId)))
                    return "gameId: buffer expected";
            if (message.rank != null && message.hasOwnProperty("rank"))
                if (!$util.isInteger(message.rank) && !(message.rank && $util.isInteger(message.rank.low) && $util.isInteger(message.rank.high)))
                    return "rank: integer|Long expected";
            if (message.claimedAmount != null && message.hasOwnProperty("claimedAmount"))
                if (!$util.isInteger(message.claimedAmount) && !(message.claimedAmount && $util.isInteger(message.claimedAmount.low) && $util.isInteger(message.claimedAmount.high)))
                    return "claimedAmount: integer|Long expected";
            if (message.claimedAtUnix != null && message.hasOwnProperty("claimedAtUnix"))
                if (!$util.isInteger(message.claimedAtUnix) && !(message.claimedAtUnix && $util.isInteger(message.claimedAtUnix.low) && $util.isInteger(message.claimedAtUnix.high)))
                    return "claimedAtUnix: integer|Long expected";
            if (message.txHash != null && message.hasOwnProperty("txHash"))
                if (!$util.isString(message.txHash))
                    return "txHash: string expected";
            return null;
        };

        /**
         * Creates a DailyRewardClaim message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.DailyRewardClaim
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.DailyRewardClaim} DailyRewardClaim
         */
        DailyRewardClaim.fromObject = function fromObject(object) {
            if (object instanceof $root.types.DailyRewardClaim)
                return object;
            var message = new $root.types.DailyRewardClaim();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.gameId != null)
                if (typeof object.gameId === "string")
                    $util.base64.decode(object.gameId, message.gameId = $util.newBuffer($util.base64.length(object.gameId)), 0);
                else if (object.gameId.length >= 0)
                    message.gameId = object.gameId;
            if (object.rank != null)
                if ($util.Long)
                    (message.rank = $util.Long.fromValue(object.rank)).unsigned = true;
                else if (typeof object.rank === "string")
                    message.rank = parseInt(object.rank, 10);
                else if (typeof object.rank === "number")
                    message.rank = object.rank;
                else if (typeof object.rank === "object")
                    message.rank = new $util.LongBits(object.rank.low >>> 0, object.rank.high >>> 0).toNumber(true);
            if (object.claimedAmount != null)
                if ($util.Long)
                    (message.claimedAmount = $util.Long.fromValue(object.claimedAmount)).unsigned = true;
                else if (typeof object.claimedAmount === "string")
                    message.claimedAmount = parseInt(object.claimedAmount, 10);
                else if (typeof object.claimedAmount === "number")
                    message.claimedAmount = object.claimedAmount;
                else if (typeof object.claimedAmount === "object")
                    message.claimedAmount = new $util.LongBits(object.claimedAmount.low >>> 0, object.claimedAmount.high >>> 0).toNumber(true);
            if (object.claimedAtUnix != null)
                if ($util.Long)
                    (message.claimedAtUnix = $util.Long.fromValue(object.claimedAtUnix)).unsigned = true;
                else if (typeof object.claimedAtUnix === "string")
                    message.claimedAtUnix = parseInt(object.claimedAtUnix, 10);
                else if (typeof object.claimedAtUnix === "number")
                    message.claimedAtUnix = object.claimedAtUnix;
                else if (typeof object.claimedAtUnix === "object")
                    message.claimedAtUnix = new $util.LongBits(object.claimedAtUnix.low >>> 0, object.claimedAtUnix.high >>> 0).toNumber(true);
            if (object.txHash != null)
                message.txHash = String(object.txHash);
            return message;
        };

        /**
         * Creates a plain object from a DailyRewardClaim message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.DailyRewardClaim
         * @static
         * @param {types.DailyRewardClaim} message DailyRewardClaim
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DailyRewardClaim.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if (options.bytes === String)
                    object.gameId = "";
                else {
                    object.gameId = [];
                    if (options.bytes !== Array)
                        object.gameId = $util.newBuffer(object.gameId);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.rank = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.rank = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.claimedAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.claimedAmount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.claimedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.claimedAtUnix = options.longs === String ? "0" : 0;
                object.txHash = "";
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.gameId != null && message.hasOwnProperty("gameId"))
                object.gameId = options.bytes === String ? $util.base64.encode(message.gameId, 0, message.gameId.length) : options.bytes === Array ? Array.prototype.slice.call(message.gameId) : message.gameId;
            if (message.rank != null && message.hasOwnProperty("rank"))
                if (typeof message.rank === "number")
                    object.rank = options.longs === String ? String(message.rank) : message.rank;
                else
                    object.rank = options.longs === String ? $util.Long.prototype.toString.call(message.rank) : options.longs === Number ? new $util.LongBits(message.rank.low >>> 0, message.rank.high >>> 0).toNumber(true) : message.rank;
            if (message.claimedAmount != null && message.hasOwnProperty("claimedAmount"))
                if (typeof message.claimedAmount === "number")
                    object.claimedAmount = options.longs === String ? String(message.claimedAmount) : message.claimedAmount;
                else
                    object.claimedAmount = options.longs === String ? $util.Long.prototype.toString.call(message.claimedAmount) : options.longs === Number ? new $util.LongBits(message.claimedAmount.low >>> 0, message.claimedAmount.high >>> 0).toNumber(true) : message.claimedAmount;
            if (message.claimedAtUnix != null && message.hasOwnProperty("claimedAtUnix"))
                if (typeof message.claimedAtUnix === "number")
                    object.claimedAtUnix = options.longs === String ? String(message.claimedAtUnix) : message.claimedAtUnix;
                else
                    object.claimedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.claimedAtUnix) : options.longs === Number ? new $util.LongBits(message.claimedAtUnix.low >>> 0, message.claimedAtUnix.high >>> 0).toNumber(true) : message.claimedAtUnix;
            if (message.txHash != null && message.hasOwnProperty("txHash"))
                object.txHash = message.txHash;
            return object;
        };

        /**
         * Converts this DailyRewardClaim to JSON.
         * @function toJSON
         * @memberof types.DailyRewardClaim
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DailyRewardClaim.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DailyRewardClaim
         * @function getTypeUrl
         * @memberof types.DailyRewardClaim
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DailyRewardClaim.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.DailyRewardClaim";
        };

        return DailyRewardClaim;
    })();

    types.ClassicPointsDailyLedger = (function() {

        /**
         * Properties of a ClassicPointsDailyLedger.
         * @memberof types
         * @interface IClassicPointsDailyLedger
         * @property {string|null} [utcDate] ClassicPointsDailyLedger utcDate
         * @property {Uint8Array|null} [playerAddress] ClassicPointsDailyLedger playerAddress
         * @property {number|Long|null} [earnedPoints] ClassicPointsDailyLedger earnedPoints
         */

        /**
         * Constructs a new ClassicPointsDailyLedger.
         * @memberof types
         * @classdesc Represents a ClassicPointsDailyLedger.
         * @implements IClassicPointsDailyLedger
         * @constructor
         * @param {types.IClassicPointsDailyLedger=} [properties] Properties to set
         */
        function ClassicPointsDailyLedger(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ClassicPointsDailyLedger utcDate.
         * @member {string} utcDate
         * @memberof types.ClassicPointsDailyLedger
         * @instance
         */
        ClassicPointsDailyLedger.prototype.utcDate = "";

        /**
         * ClassicPointsDailyLedger playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.ClassicPointsDailyLedger
         * @instance
         */
        ClassicPointsDailyLedger.prototype.playerAddress = $util.newBuffer([]);

        /**
         * ClassicPointsDailyLedger earnedPoints.
         * @member {number|Long} earnedPoints
         * @memberof types.ClassicPointsDailyLedger
         * @instance
         */
        ClassicPointsDailyLedger.prototype.earnedPoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new ClassicPointsDailyLedger instance using the specified properties.
         * @function create
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {types.IClassicPointsDailyLedger=} [properties] Properties to set
         * @returns {types.ClassicPointsDailyLedger} ClassicPointsDailyLedger instance
         */
        ClassicPointsDailyLedger.create = function create(properties) {
            return new ClassicPointsDailyLedger(properties);
        };

        /**
         * Encodes the specified ClassicPointsDailyLedger message. Does not implicitly {@link types.ClassicPointsDailyLedger.verify|verify} messages.
         * @function encode
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {types.IClassicPointsDailyLedger} message ClassicPointsDailyLedger message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClassicPointsDailyLedger.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.earnedPoints != null && Object.hasOwnProperty.call(message, "earnedPoints"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.earnedPoints);
            return writer;
        };

        /**
         * Encodes the specified ClassicPointsDailyLedger message, length delimited. Does not implicitly {@link types.ClassicPointsDailyLedger.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {types.IClassicPointsDailyLedger} message ClassicPointsDailyLedger message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClassicPointsDailyLedger.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ClassicPointsDailyLedger message from the specified reader or buffer.
         * @function decode
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.ClassicPointsDailyLedger} ClassicPointsDailyLedger
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClassicPointsDailyLedger.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.ClassicPointsDailyLedger();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.earnedPoints = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ClassicPointsDailyLedger message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.ClassicPointsDailyLedger} ClassicPointsDailyLedger
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClassicPointsDailyLedger.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ClassicPointsDailyLedger message.
         * @function verify
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ClassicPointsDailyLedger.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.earnedPoints != null && message.hasOwnProperty("earnedPoints"))
                if (!$util.isInteger(message.earnedPoints) && !(message.earnedPoints && $util.isInteger(message.earnedPoints.low) && $util.isInteger(message.earnedPoints.high)))
                    return "earnedPoints: integer|Long expected";
            return null;
        };

        /**
         * Creates a ClassicPointsDailyLedger message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.ClassicPointsDailyLedger} ClassicPointsDailyLedger
         */
        ClassicPointsDailyLedger.fromObject = function fromObject(object) {
            if (object instanceof $root.types.ClassicPointsDailyLedger)
                return object;
            var message = new $root.types.ClassicPointsDailyLedger();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.earnedPoints != null)
                if ($util.Long)
                    (message.earnedPoints = $util.Long.fromValue(object.earnedPoints)).unsigned = true;
                else if (typeof object.earnedPoints === "string")
                    message.earnedPoints = parseInt(object.earnedPoints, 10);
                else if (typeof object.earnedPoints === "number")
                    message.earnedPoints = object.earnedPoints;
                else if (typeof object.earnedPoints === "object")
                    message.earnedPoints = new $util.LongBits(object.earnedPoints.low >>> 0, object.earnedPoints.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a ClassicPointsDailyLedger message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {types.ClassicPointsDailyLedger} message ClassicPointsDailyLedger
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ClassicPointsDailyLedger.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.earnedPoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.earnedPoints = options.longs === String ? "0" : 0;
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.earnedPoints != null && message.hasOwnProperty("earnedPoints"))
                if (typeof message.earnedPoints === "number")
                    object.earnedPoints = options.longs === String ? String(message.earnedPoints) : message.earnedPoints;
                else
                    object.earnedPoints = options.longs === String ? $util.Long.prototype.toString.call(message.earnedPoints) : options.longs === Number ? new $util.LongBits(message.earnedPoints.low >>> 0, message.earnedPoints.high >>> 0).toNumber(true) : message.earnedPoints;
            return object;
        };

        /**
         * Converts this ClassicPointsDailyLedger to JSON.
         * @function toJSON
         * @memberof types.ClassicPointsDailyLedger
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ClassicPointsDailyLedger.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ClassicPointsDailyLedger
         * @function getTypeUrl
         * @memberof types.ClassicPointsDailyLedger
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ClassicPointsDailyLedger.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.ClassicPointsDailyLedger";
        };

        return ClassicPointsDailyLedger;
    })();

    types.ClassicPointRedemption = (function() {

        /**
         * Properties of a ClassicPointRedemption.
         * @memberof types
         * @interface IClassicPointRedemption
         * @property {Uint8Array|null} [playerAddress] ClassicPointRedemption playerAddress
         * @property {number|Long|null} [burnPoints] ClassicPointRedemption burnPoints
         * @property {number|Long|null} [payoutAmount] ClassicPointRedemption payoutAmount
         * @property {number|Long|null} [redeemedAtUnix] ClassicPointRedemption redeemedAtUnix
         * @property {string|null} [txHash] ClassicPointRedemption txHash
         */

        /**
         * Constructs a new ClassicPointRedemption.
         * @memberof types
         * @classdesc Represents a ClassicPointRedemption.
         * @implements IClassicPointRedemption
         * @constructor
         * @param {types.IClassicPointRedemption=} [properties] Properties to set
         */
        function ClassicPointRedemption(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ClassicPointRedemption playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.ClassicPointRedemption
         * @instance
         */
        ClassicPointRedemption.prototype.playerAddress = $util.newBuffer([]);

        /**
         * ClassicPointRedemption burnPoints.
         * @member {number|Long} burnPoints
         * @memberof types.ClassicPointRedemption
         * @instance
         */
        ClassicPointRedemption.prototype.burnPoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * ClassicPointRedemption payoutAmount.
         * @member {number|Long} payoutAmount
         * @memberof types.ClassicPointRedemption
         * @instance
         */
        ClassicPointRedemption.prototype.payoutAmount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * ClassicPointRedemption redeemedAtUnix.
         * @member {number|Long} redeemedAtUnix
         * @memberof types.ClassicPointRedemption
         * @instance
         */
        ClassicPointRedemption.prototype.redeemedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * ClassicPointRedemption txHash.
         * @member {string} txHash
         * @memberof types.ClassicPointRedemption
         * @instance
         */
        ClassicPointRedemption.prototype.txHash = "";

        /**
         * Creates a new ClassicPointRedemption instance using the specified properties.
         * @function create
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {types.IClassicPointRedemption=} [properties] Properties to set
         * @returns {types.ClassicPointRedemption} ClassicPointRedemption instance
         */
        ClassicPointRedemption.create = function create(properties) {
            return new ClassicPointRedemption(properties);
        };

        /**
         * Encodes the specified ClassicPointRedemption message. Does not implicitly {@link types.ClassicPointRedemption.verify|verify} messages.
         * @function encode
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {types.IClassicPointRedemption} message ClassicPointRedemption message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClassicPointRedemption.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.burnPoints != null && Object.hasOwnProperty.call(message, "burnPoints"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.burnPoints);
            if (message.payoutAmount != null && Object.hasOwnProperty.call(message, "payoutAmount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.payoutAmount);
            if (message.redeemedAtUnix != null && Object.hasOwnProperty.call(message, "redeemedAtUnix"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.redeemedAtUnix);
            if (message.txHash != null && Object.hasOwnProperty.call(message, "txHash"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.txHash);
            return writer;
        };

        /**
         * Encodes the specified ClassicPointRedemption message, length delimited. Does not implicitly {@link types.ClassicPointRedemption.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {types.IClassicPointRedemption} message ClassicPointRedemption message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClassicPointRedemption.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ClassicPointRedemption message from the specified reader or buffer.
         * @function decode
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.ClassicPointRedemption} ClassicPointRedemption
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClassicPointRedemption.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.ClassicPointRedemption();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.burnPoints = reader.uint64();
                        break;
                    }
                case 3: {
                        message.payoutAmount = reader.uint64();
                        break;
                    }
                case 4: {
                        message.redeemedAtUnix = reader.uint64();
                        break;
                    }
                case 5: {
                        message.txHash = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ClassicPointRedemption message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.ClassicPointRedemption} ClassicPointRedemption
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClassicPointRedemption.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ClassicPointRedemption message.
         * @function verify
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ClassicPointRedemption.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.burnPoints != null && message.hasOwnProperty("burnPoints"))
                if (!$util.isInteger(message.burnPoints) && !(message.burnPoints && $util.isInteger(message.burnPoints.low) && $util.isInteger(message.burnPoints.high)))
                    return "burnPoints: integer|Long expected";
            if (message.payoutAmount != null && message.hasOwnProperty("payoutAmount"))
                if (!$util.isInteger(message.payoutAmount) && !(message.payoutAmount && $util.isInteger(message.payoutAmount.low) && $util.isInteger(message.payoutAmount.high)))
                    return "payoutAmount: integer|Long expected";
            if (message.redeemedAtUnix != null && message.hasOwnProperty("redeemedAtUnix"))
                if (!$util.isInteger(message.redeemedAtUnix) && !(message.redeemedAtUnix && $util.isInteger(message.redeemedAtUnix.low) && $util.isInteger(message.redeemedAtUnix.high)))
                    return "redeemedAtUnix: integer|Long expected";
            if (message.txHash != null && message.hasOwnProperty("txHash"))
                if (!$util.isString(message.txHash))
                    return "txHash: string expected";
            return null;
        };

        /**
         * Creates a ClassicPointRedemption message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.ClassicPointRedemption} ClassicPointRedemption
         */
        ClassicPointRedemption.fromObject = function fromObject(object) {
            if (object instanceof $root.types.ClassicPointRedemption)
                return object;
            var message = new $root.types.ClassicPointRedemption();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.burnPoints != null)
                if ($util.Long)
                    (message.burnPoints = $util.Long.fromValue(object.burnPoints)).unsigned = true;
                else if (typeof object.burnPoints === "string")
                    message.burnPoints = parseInt(object.burnPoints, 10);
                else if (typeof object.burnPoints === "number")
                    message.burnPoints = object.burnPoints;
                else if (typeof object.burnPoints === "object")
                    message.burnPoints = new $util.LongBits(object.burnPoints.low >>> 0, object.burnPoints.high >>> 0).toNumber(true);
            if (object.payoutAmount != null)
                if ($util.Long)
                    (message.payoutAmount = $util.Long.fromValue(object.payoutAmount)).unsigned = true;
                else if (typeof object.payoutAmount === "string")
                    message.payoutAmount = parseInt(object.payoutAmount, 10);
                else if (typeof object.payoutAmount === "number")
                    message.payoutAmount = object.payoutAmount;
                else if (typeof object.payoutAmount === "object")
                    message.payoutAmount = new $util.LongBits(object.payoutAmount.low >>> 0, object.payoutAmount.high >>> 0).toNumber(true);
            if (object.redeemedAtUnix != null)
                if ($util.Long)
                    (message.redeemedAtUnix = $util.Long.fromValue(object.redeemedAtUnix)).unsigned = true;
                else if (typeof object.redeemedAtUnix === "string")
                    message.redeemedAtUnix = parseInt(object.redeemedAtUnix, 10);
                else if (typeof object.redeemedAtUnix === "number")
                    message.redeemedAtUnix = object.redeemedAtUnix;
                else if (typeof object.redeemedAtUnix === "object")
                    message.redeemedAtUnix = new $util.LongBits(object.redeemedAtUnix.low >>> 0, object.redeemedAtUnix.high >>> 0).toNumber(true);
            if (object.txHash != null)
                message.txHash = String(object.txHash);
            return message;
        };

        /**
         * Creates a plain object from a ClassicPointRedemption message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {types.ClassicPointRedemption} message ClassicPointRedemption
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ClassicPointRedemption.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.burnPoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.burnPoints = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.payoutAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.payoutAmount = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.redeemedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.redeemedAtUnix = options.longs === String ? "0" : 0;
                object.txHash = "";
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.burnPoints != null && message.hasOwnProperty("burnPoints"))
                if (typeof message.burnPoints === "number")
                    object.burnPoints = options.longs === String ? String(message.burnPoints) : message.burnPoints;
                else
                    object.burnPoints = options.longs === String ? $util.Long.prototype.toString.call(message.burnPoints) : options.longs === Number ? new $util.LongBits(message.burnPoints.low >>> 0, message.burnPoints.high >>> 0).toNumber(true) : message.burnPoints;
            if (message.payoutAmount != null && message.hasOwnProperty("payoutAmount"))
                if (typeof message.payoutAmount === "number")
                    object.payoutAmount = options.longs === String ? String(message.payoutAmount) : message.payoutAmount;
                else
                    object.payoutAmount = options.longs === String ? $util.Long.prototype.toString.call(message.payoutAmount) : options.longs === Number ? new $util.LongBits(message.payoutAmount.low >>> 0, message.payoutAmount.high >>> 0).toNumber(true) : message.payoutAmount;
            if (message.redeemedAtUnix != null && message.hasOwnProperty("redeemedAtUnix"))
                if (typeof message.redeemedAtUnix === "number")
                    object.redeemedAtUnix = options.longs === String ? String(message.redeemedAtUnix) : message.redeemedAtUnix;
                else
                    object.redeemedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.redeemedAtUnix) : options.longs === Number ? new $util.LongBits(message.redeemedAtUnix.low >>> 0, message.redeemedAtUnix.high >>> 0).toNumber(true) : message.redeemedAtUnix;
            if (message.txHash != null && message.hasOwnProperty("txHash"))
                object.txHash = message.txHash;
            return object;
        };

        /**
         * Converts this ClassicPointRedemption to JSON.
         * @function toJSON
         * @memberof types.ClassicPointRedemption
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ClassicPointRedemption.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ClassicPointRedemption
         * @function getTypeUrl
         * @memberof types.ClassicPointRedemption
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ClassicPointRedemption.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.ClassicPointRedemption";
        };

        return ClassicPointRedemption;
    })();

    types.DailyLoginClaim = (function() {

        /**
         * Properties of a DailyLoginClaim.
         * @memberof types
         * @interface IDailyLoginClaim
         * @property {string|null} [utcDate] DailyLoginClaim utcDate
         * @property {Uint8Array|null} [playerAddress] DailyLoginClaim playerAddress
         * @property {number|Long|null} [streakDay] DailyLoginClaim streakDay
         * @property {number|Long|null} [rewardPoints] DailyLoginClaim rewardPoints
         * @property {number|Long|null} [bonusBps] DailyLoginClaim bonusBps
         * @property {number|Long|null} [claimedAtUnix] DailyLoginClaim claimedAtUnix
         */

        /**
         * Constructs a new DailyLoginClaim.
         * @memberof types
         * @classdesc Represents a DailyLoginClaim.
         * @implements IDailyLoginClaim
         * @constructor
         * @param {types.IDailyLoginClaim=} [properties] Properties to set
         */
        function DailyLoginClaim(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DailyLoginClaim utcDate.
         * @member {string} utcDate
         * @memberof types.DailyLoginClaim
         * @instance
         */
        DailyLoginClaim.prototype.utcDate = "";

        /**
         * DailyLoginClaim playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.DailyLoginClaim
         * @instance
         */
        DailyLoginClaim.prototype.playerAddress = $util.newBuffer([]);

        /**
         * DailyLoginClaim streakDay.
         * @member {number|Long} streakDay
         * @memberof types.DailyLoginClaim
         * @instance
         */
        DailyLoginClaim.prototype.streakDay = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyLoginClaim rewardPoints.
         * @member {number|Long} rewardPoints
         * @memberof types.DailyLoginClaim
         * @instance
         */
        DailyLoginClaim.prototype.rewardPoints = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyLoginClaim bonusBps.
         * @member {number|Long} bonusBps
         * @memberof types.DailyLoginClaim
         * @instance
         */
        DailyLoginClaim.prototype.bonusBps = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DailyLoginClaim claimedAtUnix.
         * @member {number|Long} claimedAtUnix
         * @memberof types.DailyLoginClaim
         * @instance
         */
        DailyLoginClaim.prototype.claimedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new DailyLoginClaim instance using the specified properties.
         * @function create
         * @memberof types.DailyLoginClaim
         * @static
         * @param {types.IDailyLoginClaim=} [properties] Properties to set
         * @returns {types.DailyLoginClaim} DailyLoginClaim instance
         */
        DailyLoginClaim.create = function create(properties) {
            return new DailyLoginClaim(properties);
        };

        /**
         * Encodes the specified DailyLoginClaim message. Does not implicitly {@link types.DailyLoginClaim.verify|verify} messages.
         * @function encode
         * @memberof types.DailyLoginClaim
         * @static
         * @param {types.IDailyLoginClaim} message DailyLoginClaim message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyLoginClaim.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.utcDate != null && Object.hasOwnProperty.call(message, "utcDate"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.utcDate);
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.playerAddress);
            if (message.streakDay != null && Object.hasOwnProperty.call(message, "streakDay"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.streakDay);
            if (message.rewardPoints != null && Object.hasOwnProperty.call(message, "rewardPoints"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.rewardPoints);
            if (message.bonusBps != null && Object.hasOwnProperty.call(message, "bonusBps"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.bonusBps);
            if (message.claimedAtUnix != null && Object.hasOwnProperty.call(message, "claimedAtUnix"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.claimedAtUnix);
            return writer;
        };

        /**
         * Encodes the specified DailyLoginClaim message, length delimited. Does not implicitly {@link types.DailyLoginClaim.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.DailyLoginClaim
         * @static
         * @param {types.IDailyLoginClaim} message DailyLoginClaim message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DailyLoginClaim.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DailyLoginClaim message from the specified reader or buffer.
         * @function decode
         * @memberof types.DailyLoginClaim
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.DailyLoginClaim} DailyLoginClaim
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyLoginClaim.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.DailyLoginClaim();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.utcDate = reader.string();
                        break;
                    }
                case 2: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.streakDay = reader.uint64();
                        break;
                    }
                case 4: {
                        message.rewardPoints = reader.uint64();
                        break;
                    }
                case 5: {
                        message.bonusBps = reader.uint64();
                        break;
                    }
                case 6: {
                        message.claimedAtUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DailyLoginClaim message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.DailyLoginClaim
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.DailyLoginClaim} DailyLoginClaim
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DailyLoginClaim.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DailyLoginClaim message.
         * @function verify
         * @memberof types.DailyLoginClaim
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DailyLoginClaim.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                if (!$util.isString(message.utcDate))
                    return "utcDate: string expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.streakDay != null && message.hasOwnProperty("streakDay"))
                if (!$util.isInteger(message.streakDay) && !(message.streakDay && $util.isInteger(message.streakDay.low) && $util.isInteger(message.streakDay.high)))
                    return "streakDay: integer|Long expected";
            if (message.rewardPoints != null && message.hasOwnProperty("rewardPoints"))
                if (!$util.isInteger(message.rewardPoints) && !(message.rewardPoints && $util.isInteger(message.rewardPoints.low) && $util.isInteger(message.rewardPoints.high)))
                    return "rewardPoints: integer|Long expected";
            if (message.bonusBps != null && message.hasOwnProperty("bonusBps"))
                if (!$util.isInteger(message.bonusBps) && !(message.bonusBps && $util.isInteger(message.bonusBps.low) && $util.isInteger(message.bonusBps.high)))
                    return "bonusBps: integer|Long expected";
            if (message.claimedAtUnix != null && message.hasOwnProperty("claimedAtUnix"))
                if (!$util.isInteger(message.claimedAtUnix) && !(message.claimedAtUnix && $util.isInteger(message.claimedAtUnix.low) && $util.isInteger(message.claimedAtUnix.high)))
                    return "claimedAtUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a DailyLoginClaim message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.DailyLoginClaim
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.DailyLoginClaim} DailyLoginClaim
         */
        DailyLoginClaim.fromObject = function fromObject(object) {
            if (object instanceof $root.types.DailyLoginClaim)
                return object;
            var message = new $root.types.DailyLoginClaim();
            if (object.utcDate != null)
                message.utcDate = String(object.utcDate);
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.streakDay != null)
                if ($util.Long)
                    (message.streakDay = $util.Long.fromValue(object.streakDay)).unsigned = true;
                else if (typeof object.streakDay === "string")
                    message.streakDay = parseInt(object.streakDay, 10);
                else if (typeof object.streakDay === "number")
                    message.streakDay = object.streakDay;
                else if (typeof object.streakDay === "object")
                    message.streakDay = new $util.LongBits(object.streakDay.low >>> 0, object.streakDay.high >>> 0).toNumber(true);
            if (object.rewardPoints != null)
                if ($util.Long)
                    (message.rewardPoints = $util.Long.fromValue(object.rewardPoints)).unsigned = true;
                else if (typeof object.rewardPoints === "string")
                    message.rewardPoints = parseInt(object.rewardPoints, 10);
                else if (typeof object.rewardPoints === "number")
                    message.rewardPoints = object.rewardPoints;
                else if (typeof object.rewardPoints === "object")
                    message.rewardPoints = new $util.LongBits(object.rewardPoints.low >>> 0, object.rewardPoints.high >>> 0).toNumber(true);
            if (object.bonusBps != null)
                if ($util.Long)
                    (message.bonusBps = $util.Long.fromValue(object.bonusBps)).unsigned = true;
                else if (typeof object.bonusBps === "string")
                    message.bonusBps = parseInt(object.bonusBps, 10);
                else if (typeof object.bonusBps === "number")
                    message.bonusBps = object.bonusBps;
                else if (typeof object.bonusBps === "object")
                    message.bonusBps = new $util.LongBits(object.bonusBps.low >>> 0, object.bonusBps.high >>> 0).toNumber(true);
            if (object.claimedAtUnix != null)
                if ($util.Long)
                    (message.claimedAtUnix = $util.Long.fromValue(object.claimedAtUnix)).unsigned = true;
                else if (typeof object.claimedAtUnix === "string")
                    message.claimedAtUnix = parseInt(object.claimedAtUnix, 10);
                else if (typeof object.claimedAtUnix === "number")
                    message.claimedAtUnix = object.claimedAtUnix;
                else if (typeof object.claimedAtUnix === "object")
                    message.claimedAtUnix = new $util.LongBits(object.claimedAtUnix.low >>> 0, object.claimedAtUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a DailyLoginClaim message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.DailyLoginClaim
         * @static
         * @param {types.DailyLoginClaim} message DailyLoginClaim
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DailyLoginClaim.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.utcDate = "";
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.streakDay = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.streakDay = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.rewardPoints = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.rewardPoints = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.bonusBps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.bonusBps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.claimedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.claimedAtUnix = options.longs === String ? "0" : 0;
            }
            if (message.utcDate != null && message.hasOwnProperty("utcDate"))
                object.utcDate = message.utcDate;
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.streakDay != null && message.hasOwnProperty("streakDay"))
                if (typeof message.streakDay === "number")
                    object.streakDay = options.longs === String ? String(message.streakDay) : message.streakDay;
                else
                    object.streakDay = options.longs === String ? $util.Long.prototype.toString.call(message.streakDay) : options.longs === Number ? new $util.LongBits(message.streakDay.low >>> 0, message.streakDay.high >>> 0).toNumber(true) : message.streakDay;
            if (message.rewardPoints != null && message.hasOwnProperty("rewardPoints"))
                if (typeof message.rewardPoints === "number")
                    object.rewardPoints = options.longs === String ? String(message.rewardPoints) : message.rewardPoints;
                else
                    object.rewardPoints = options.longs === String ? $util.Long.prototype.toString.call(message.rewardPoints) : options.longs === Number ? new $util.LongBits(message.rewardPoints.low >>> 0, message.rewardPoints.high >>> 0).toNumber(true) : message.rewardPoints;
            if (message.bonusBps != null && message.hasOwnProperty("bonusBps"))
                if (typeof message.bonusBps === "number")
                    object.bonusBps = options.longs === String ? String(message.bonusBps) : message.bonusBps;
                else
                    object.bonusBps = options.longs === String ? $util.Long.prototype.toString.call(message.bonusBps) : options.longs === Number ? new $util.LongBits(message.bonusBps.low >>> 0, message.bonusBps.high >>> 0).toNumber(true) : message.bonusBps;
            if (message.claimedAtUnix != null && message.hasOwnProperty("claimedAtUnix"))
                if (typeof message.claimedAtUnix === "number")
                    object.claimedAtUnix = options.longs === String ? String(message.claimedAtUnix) : message.claimedAtUnix;
                else
                    object.claimedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.claimedAtUnix) : options.longs === Number ? new $util.LongBits(message.claimedAtUnix.low >>> 0, message.claimedAtUnix.high >>> 0).toNumber(true) : message.claimedAtUnix;
            return object;
        };

        /**
         * Converts this DailyLoginClaim to JSON.
         * @function toJSON
         * @memberof types.DailyLoginClaim
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DailyLoginClaim.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DailyLoginClaim
         * @function getTypeUrl
         * @memberof types.DailyLoginClaim
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DailyLoginClaim.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.DailyLoginClaim";
        };

        return DailyLoginClaim;
    })();

    types.UsernameRegistration = (function() {

        /**
         * Properties of a UsernameRegistration.
         * @memberof types
         * @interface IUsernameRegistration
         * @property {Uint8Array|null} [playerAddress] UsernameRegistration playerAddress
         * @property {string|null} [username] UsernameRegistration username
         * @property {number|Long|null} [registeredAtUnix] UsernameRegistration registeredAtUnix
         * @property {number|Long|null} [lastChangedAtUnix] UsernameRegistration lastChangedAtUnix
         */

        /**
         * Constructs a new UsernameRegistration.
         * @memberof types
         * @classdesc Represents a UsernameRegistration.
         * @implements IUsernameRegistration
         * @constructor
         * @param {types.IUsernameRegistration=} [properties] Properties to set
         */
        function UsernameRegistration(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UsernameRegistration playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.UsernameRegistration
         * @instance
         */
        UsernameRegistration.prototype.playerAddress = $util.newBuffer([]);

        /**
         * UsernameRegistration username.
         * @member {string} username
         * @memberof types.UsernameRegistration
         * @instance
         */
        UsernameRegistration.prototype.username = "";

        /**
         * UsernameRegistration registeredAtUnix.
         * @member {number|Long} registeredAtUnix
         * @memberof types.UsernameRegistration
         * @instance
         */
        UsernameRegistration.prototype.registeredAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * UsernameRegistration lastChangedAtUnix.
         * @member {number|Long} lastChangedAtUnix
         * @memberof types.UsernameRegistration
         * @instance
         */
        UsernameRegistration.prototype.lastChangedAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new UsernameRegistration instance using the specified properties.
         * @function create
         * @memberof types.UsernameRegistration
         * @static
         * @param {types.IUsernameRegistration=} [properties] Properties to set
         * @returns {types.UsernameRegistration} UsernameRegistration instance
         */
        UsernameRegistration.create = function create(properties) {
            return new UsernameRegistration(properties);
        };

        /**
         * Encodes the specified UsernameRegistration message. Does not implicitly {@link types.UsernameRegistration.verify|verify} messages.
         * @function encode
         * @memberof types.UsernameRegistration
         * @static
         * @param {types.IUsernameRegistration} message UsernameRegistration message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UsernameRegistration.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
            if (message.registeredAtUnix != null && Object.hasOwnProperty.call(message, "registeredAtUnix"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.registeredAtUnix);
            if (message.lastChangedAtUnix != null && Object.hasOwnProperty.call(message, "lastChangedAtUnix"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.lastChangedAtUnix);
            return writer;
        };

        /**
         * Encodes the specified UsernameRegistration message, length delimited. Does not implicitly {@link types.UsernameRegistration.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.UsernameRegistration
         * @static
         * @param {types.IUsernameRegistration} message UsernameRegistration message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UsernameRegistration.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UsernameRegistration message from the specified reader or buffer.
         * @function decode
         * @memberof types.UsernameRegistration
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.UsernameRegistration} UsernameRegistration
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UsernameRegistration.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.UsernameRegistration();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.username = reader.string();
                        break;
                    }
                case 3: {
                        message.registeredAtUnix = reader.uint64();
                        break;
                    }
                case 4: {
                        message.lastChangedAtUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a UsernameRegistration message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.UsernameRegistration
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.UsernameRegistration} UsernameRegistration
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UsernameRegistration.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UsernameRegistration message.
         * @function verify
         * @memberof types.UsernameRegistration
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UsernameRegistration.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            if (message.registeredAtUnix != null && message.hasOwnProperty("registeredAtUnix"))
                if (!$util.isInteger(message.registeredAtUnix) && !(message.registeredAtUnix && $util.isInteger(message.registeredAtUnix.low) && $util.isInteger(message.registeredAtUnix.high)))
                    return "registeredAtUnix: integer|Long expected";
            if (message.lastChangedAtUnix != null && message.hasOwnProperty("lastChangedAtUnix"))
                if (!$util.isInteger(message.lastChangedAtUnix) && !(message.lastChangedAtUnix && $util.isInteger(message.lastChangedAtUnix.low) && $util.isInteger(message.lastChangedAtUnix.high)))
                    return "lastChangedAtUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a UsernameRegistration message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.UsernameRegistration
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.UsernameRegistration} UsernameRegistration
         */
        UsernameRegistration.fromObject = function fromObject(object) {
            if (object instanceof $root.types.UsernameRegistration)
                return object;
            var message = new $root.types.UsernameRegistration();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.username != null)
                message.username = String(object.username);
            if (object.registeredAtUnix != null)
                if ($util.Long)
                    (message.registeredAtUnix = $util.Long.fromValue(object.registeredAtUnix)).unsigned = true;
                else if (typeof object.registeredAtUnix === "string")
                    message.registeredAtUnix = parseInt(object.registeredAtUnix, 10);
                else if (typeof object.registeredAtUnix === "number")
                    message.registeredAtUnix = object.registeredAtUnix;
                else if (typeof object.registeredAtUnix === "object")
                    message.registeredAtUnix = new $util.LongBits(object.registeredAtUnix.low >>> 0, object.registeredAtUnix.high >>> 0).toNumber(true);
            if (object.lastChangedAtUnix != null)
                if ($util.Long)
                    (message.lastChangedAtUnix = $util.Long.fromValue(object.lastChangedAtUnix)).unsigned = true;
                else if (typeof object.lastChangedAtUnix === "string")
                    message.lastChangedAtUnix = parseInt(object.lastChangedAtUnix, 10);
                else if (typeof object.lastChangedAtUnix === "number")
                    message.lastChangedAtUnix = object.lastChangedAtUnix;
                else if (typeof object.lastChangedAtUnix === "object")
                    message.lastChangedAtUnix = new $util.LongBits(object.lastChangedAtUnix.low >>> 0, object.lastChangedAtUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a UsernameRegistration message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.UsernameRegistration
         * @static
         * @param {types.UsernameRegistration} message UsernameRegistration
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UsernameRegistration.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                object.username = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.registeredAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.registeredAtUnix = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.lastChangedAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastChangedAtUnix = options.longs === String ? "0" : 0;
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            if (message.registeredAtUnix != null && message.hasOwnProperty("registeredAtUnix"))
                if (typeof message.registeredAtUnix === "number")
                    object.registeredAtUnix = options.longs === String ? String(message.registeredAtUnix) : message.registeredAtUnix;
                else
                    object.registeredAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.registeredAtUnix) : options.longs === Number ? new $util.LongBits(message.registeredAtUnix.low >>> 0, message.registeredAtUnix.high >>> 0).toNumber(true) : message.registeredAtUnix;
            if (message.lastChangedAtUnix != null && message.hasOwnProperty("lastChangedAtUnix"))
                if (typeof message.lastChangedAtUnix === "number")
                    object.lastChangedAtUnix = options.longs === String ? String(message.lastChangedAtUnix) : message.lastChangedAtUnix;
                else
                    object.lastChangedAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.lastChangedAtUnix) : options.longs === Number ? new $util.LongBits(message.lastChangedAtUnix.low >>> 0, message.lastChangedAtUnix.high >>> 0).toNumber(true) : message.lastChangedAtUnix;
            return object;
        };

        /**
         * Converts this UsernameRegistration to JSON.
         * @function toJSON
         * @memberof types.UsernameRegistration
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UsernameRegistration.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UsernameRegistration
         * @function getTypeUrl
         * @memberof types.UsernameRegistration
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UsernameRegistration.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.UsernameRegistration";
        };

        return UsernameRegistration;
    })();

    types.PlayerIdentity = (function() {

        /**
         * Properties of a PlayerIdentity.
         * @memberof types
         * @interface IPlayerIdentity
         * @property {Uint8Array|null} [playerAddress] PlayerIdentity playerAddress
         * @property {string|null} [username] PlayerIdentity username
         * @property {string|null} [avatarUrl] PlayerIdentity avatarUrl
         * @property {string|null} [title] PlayerIdentity title
         * @property {string|null} [bio] PlayerIdentity bio
         * @property {number|Long|null} [registeredAtUnix] PlayerIdentity registeredAtUnix
         * @property {number|Long|null} [lastUpdatedUnix] PlayerIdentity lastUpdatedUnix
         */

        /**
         * Constructs a new PlayerIdentity.
         * @memberof types
         * @classdesc Represents a PlayerIdentity.
         * @implements IPlayerIdentity
         * @constructor
         * @param {types.IPlayerIdentity=} [properties] Properties to set
         */
        function PlayerIdentity(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayerIdentity playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.playerAddress = $util.newBuffer([]);

        /**
         * PlayerIdentity username.
         * @member {string} username
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.username = "";

        /**
         * PlayerIdentity avatarUrl.
         * @member {string} avatarUrl
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.avatarUrl = "";

        /**
         * PlayerIdentity title.
         * @member {string} title
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.title = "";

        /**
         * PlayerIdentity bio.
         * @member {string} bio
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.bio = "";

        /**
         * PlayerIdentity registeredAtUnix.
         * @member {number|Long} registeredAtUnix
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.registeredAtUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerIdentity lastUpdatedUnix.
         * @member {number|Long} lastUpdatedUnix
         * @memberof types.PlayerIdentity
         * @instance
         */
        PlayerIdentity.prototype.lastUpdatedUnix = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new PlayerIdentity instance using the specified properties.
         * @function create
         * @memberof types.PlayerIdentity
         * @static
         * @param {types.IPlayerIdentity=} [properties] Properties to set
         * @returns {types.PlayerIdentity} PlayerIdentity instance
         */
        PlayerIdentity.create = function create(properties) {
            return new PlayerIdentity(properties);
        };

        /**
         * Encodes the specified PlayerIdentity message. Does not implicitly {@link types.PlayerIdentity.verify|verify} messages.
         * @function encode
         * @memberof types.PlayerIdentity
         * @static
         * @param {types.IPlayerIdentity} message PlayerIdentity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerIdentity.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
            if (message.avatarUrl != null && Object.hasOwnProperty.call(message, "avatarUrl"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.avatarUrl);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.title);
            if (message.bio != null && Object.hasOwnProperty.call(message, "bio"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.bio);
            if (message.registeredAtUnix != null && Object.hasOwnProperty.call(message, "registeredAtUnix"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.registeredAtUnix);
            if (message.lastUpdatedUnix != null && Object.hasOwnProperty.call(message, "lastUpdatedUnix"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.lastUpdatedUnix);
            return writer;
        };

        /**
         * Encodes the specified PlayerIdentity message, length delimited. Does not implicitly {@link types.PlayerIdentity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PlayerIdentity
         * @static
         * @param {types.IPlayerIdentity} message PlayerIdentity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerIdentity.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayerIdentity message from the specified reader or buffer.
         * @function decode
         * @memberof types.PlayerIdentity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PlayerIdentity} PlayerIdentity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerIdentity.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PlayerIdentity();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.username = reader.string();
                        break;
                    }
                case 3: {
                        message.avatarUrl = reader.string();
                        break;
                    }
                case 4: {
                        message.title = reader.string();
                        break;
                    }
                case 5: {
                        message.bio = reader.string();
                        break;
                    }
                case 6: {
                        message.registeredAtUnix = reader.uint64();
                        break;
                    }
                case 7: {
                        message.lastUpdatedUnix = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayerIdentity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PlayerIdentity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PlayerIdentity} PlayerIdentity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerIdentity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayerIdentity message.
         * @function verify
         * @memberof types.PlayerIdentity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayerIdentity.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            if (message.avatarUrl != null && message.hasOwnProperty("avatarUrl"))
                if (!$util.isString(message.avatarUrl))
                    return "avatarUrl: string expected";
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.bio != null && message.hasOwnProperty("bio"))
                if (!$util.isString(message.bio))
                    return "bio: string expected";
            if (message.registeredAtUnix != null && message.hasOwnProperty("registeredAtUnix"))
                if (!$util.isInteger(message.registeredAtUnix) && !(message.registeredAtUnix && $util.isInteger(message.registeredAtUnix.low) && $util.isInteger(message.registeredAtUnix.high)))
                    return "registeredAtUnix: integer|Long expected";
            if (message.lastUpdatedUnix != null && message.hasOwnProperty("lastUpdatedUnix"))
                if (!$util.isInteger(message.lastUpdatedUnix) && !(message.lastUpdatedUnix && $util.isInteger(message.lastUpdatedUnix.low) && $util.isInteger(message.lastUpdatedUnix.high)))
                    return "lastUpdatedUnix: integer|Long expected";
            return null;
        };

        /**
         * Creates a PlayerIdentity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PlayerIdentity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PlayerIdentity} PlayerIdentity
         */
        PlayerIdentity.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PlayerIdentity)
                return object;
            var message = new $root.types.PlayerIdentity();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.username != null)
                message.username = String(object.username);
            if (object.avatarUrl != null)
                message.avatarUrl = String(object.avatarUrl);
            if (object.title != null)
                message.title = String(object.title);
            if (object.bio != null)
                message.bio = String(object.bio);
            if (object.registeredAtUnix != null)
                if ($util.Long)
                    (message.registeredAtUnix = $util.Long.fromValue(object.registeredAtUnix)).unsigned = true;
                else if (typeof object.registeredAtUnix === "string")
                    message.registeredAtUnix = parseInt(object.registeredAtUnix, 10);
                else if (typeof object.registeredAtUnix === "number")
                    message.registeredAtUnix = object.registeredAtUnix;
                else if (typeof object.registeredAtUnix === "object")
                    message.registeredAtUnix = new $util.LongBits(object.registeredAtUnix.low >>> 0, object.registeredAtUnix.high >>> 0).toNumber(true);
            if (object.lastUpdatedUnix != null)
                if ($util.Long)
                    (message.lastUpdatedUnix = $util.Long.fromValue(object.lastUpdatedUnix)).unsigned = true;
                else if (typeof object.lastUpdatedUnix === "string")
                    message.lastUpdatedUnix = parseInt(object.lastUpdatedUnix, 10);
                else if (typeof object.lastUpdatedUnix === "number")
                    message.lastUpdatedUnix = object.lastUpdatedUnix;
                else if (typeof object.lastUpdatedUnix === "object")
                    message.lastUpdatedUnix = new $util.LongBits(object.lastUpdatedUnix.low >>> 0, object.lastUpdatedUnix.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a PlayerIdentity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PlayerIdentity
         * @static
         * @param {types.PlayerIdentity} message PlayerIdentity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerIdentity.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                object.username = "";
                object.avatarUrl = "";
                object.title = "";
                object.bio = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.registeredAtUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.registeredAtUnix = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.lastUpdatedUnix = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.lastUpdatedUnix = options.longs === String ? "0" : 0;
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            if (message.avatarUrl != null && message.hasOwnProperty("avatarUrl"))
                object.avatarUrl = message.avatarUrl;
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.bio != null && message.hasOwnProperty("bio"))
                object.bio = message.bio;
            if (message.registeredAtUnix != null && message.hasOwnProperty("registeredAtUnix"))
                if (typeof message.registeredAtUnix === "number")
                    object.registeredAtUnix = options.longs === String ? String(message.registeredAtUnix) : message.registeredAtUnix;
                else
                    object.registeredAtUnix = options.longs === String ? $util.Long.prototype.toString.call(message.registeredAtUnix) : options.longs === Number ? new $util.LongBits(message.registeredAtUnix.low >>> 0, message.registeredAtUnix.high >>> 0).toNumber(true) : message.registeredAtUnix;
            if (message.lastUpdatedUnix != null && message.hasOwnProperty("lastUpdatedUnix"))
                if (typeof message.lastUpdatedUnix === "number")
                    object.lastUpdatedUnix = options.longs === String ? String(message.lastUpdatedUnix) : message.lastUpdatedUnix;
                else
                    object.lastUpdatedUnix = options.longs === String ? $util.Long.prototype.toString.call(message.lastUpdatedUnix) : options.longs === Number ? new $util.LongBits(message.lastUpdatedUnix.low >>> 0, message.lastUpdatedUnix.high >>> 0).toNumber(true) : message.lastUpdatedUnix;
            return object;
        };

        /**
         * Converts this PlayerIdentity to JSON.
         * @function toJSON
         * @memberof types.PlayerIdentity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayerIdentity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayerIdentity
         * @function getTypeUrl
         * @memberof types.PlayerIdentity
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayerIdentity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PlayerIdentity";
        };

        return PlayerIdentity;
    })();

    types.PlayerStats = (function() {

        /**
         * Properties of a PlayerStats.
         * @memberof types
         * @interface IPlayerStats
         * @property {Uint8Array|null} [playerAddress] PlayerStats playerAddress
         * @property {number|Long|null} [dailyGamesStarted] PlayerStats dailyGamesStarted
         * @property {number|Long|null} [classicGamesStarted] PlayerStats classicGamesStarted
         * @property {number|Long|null} [gamesCompleted] PlayerStats gamesCompleted
         * @property {number|Long|null} [wins] PlayerStats wins
         * @property {number|Long|null} [losses] PlayerStats losses
         * @property {number|Long|null} [bestDailyScore] PlayerStats bestDailyScore
         * @property {number|Long|null} [bestClassicScore] PlayerStats bestClassicScore
         * @property {number|Long|null} [bestTile] PlayerStats bestTile
         * @property {number|Long|null} [totalScore] PlayerStats totalScore
         * @property {number|Long|null} [classicPointsBalance] PlayerStats classicPointsBalance
         * @property {number|Long|null} [classicPointsEarned] PlayerStats classicPointsEarned
         * @property {number|Long|null} [loginStreak] PlayerStats loginStreak
         * @property {string|null} [lastLoginClaimUtcDate] PlayerStats lastLoginClaimUtcDate
         * @property {string|null} [classicPointsBonusUtcDate] PlayerStats classicPointsBonusUtcDate
         */

        /**
         * Constructs a new PlayerStats.
         * @memberof types
         * @classdesc Represents a PlayerStats.
         * @implements IPlayerStats
         * @constructor
         * @param {types.IPlayerStats=} [properties] Properties to set
         */
        function PlayerStats(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayerStats playerAddress.
         * @member {Uint8Array} playerAddress
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.playerAddress = $util.newBuffer([]);

        /**
         * PlayerStats dailyGamesStarted.
         * @member {number|Long} dailyGamesStarted
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.dailyGamesStarted = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats classicGamesStarted.
         * @member {number|Long} classicGamesStarted
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.classicGamesStarted = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats gamesCompleted.
         * @member {number|Long} gamesCompleted
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.gamesCompleted = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats wins.
         * @member {number|Long} wins
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.wins = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats losses.
         * @member {number|Long} losses
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.losses = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats bestDailyScore.
         * @member {number|Long} bestDailyScore
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.bestDailyScore = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats bestClassicScore.
         * @member {number|Long} bestClassicScore
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.bestClassicScore = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats bestTile.
         * @member {number|Long} bestTile
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.bestTile = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats totalScore.
         * @member {number|Long} totalScore
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.totalScore = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats classicPointsBalance.
         * @member {number|Long} classicPointsBalance
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.classicPointsBalance = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats classicPointsEarned.
         * @member {number|Long} classicPointsEarned
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.classicPointsEarned = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats loginStreak.
         * @member {number|Long} loginStreak
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.loginStreak = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PlayerStats lastLoginClaimUtcDate.
         * @member {string} lastLoginClaimUtcDate
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.lastLoginClaimUtcDate = "";

        /**
         * PlayerStats classicPointsBonusUtcDate.
         * @member {string} classicPointsBonusUtcDate
         * @memberof types.PlayerStats
         * @instance
         */
        PlayerStats.prototype.classicPointsBonusUtcDate = "";

        /**
         * Creates a new PlayerStats instance using the specified properties.
         * @function create
         * @memberof types.PlayerStats
         * @static
         * @param {types.IPlayerStats=} [properties] Properties to set
         * @returns {types.PlayerStats} PlayerStats instance
         */
        PlayerStats.create = function create(properties) {
            return new PlayerStats(properties);
        };

        /**
         * Encodes the specified PlayerStats message. Does not implicitly {@link types.PlayerStats.verify|verify} messages.
         * @function encode
         * @memberof types.PlayerStats
         * @static
         * @param {types.IPlayerStats} message PlayerStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerStats.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.playerAddress != null && Object.hasOwnProperty.call(message, "playerAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.playerAddress);
            if (message.dailyGamesStarted != null && Object.hasOwnProperty.call(message, "dailyGamesStarted"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.dailyGamesStarted);
            if (message.classicGamesStarted != null && Object.hasOwnProperty.call(message, "classicGamesStarted"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.classicGamesStarted);
            if (message.gamesCompleted != null && Object.hasOwnProperty.call(message, "gamesCompleted"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.gamesCompleted);
            if (message.wins != null && Object.hasOwnProperty.call(message, "wins"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.wins);
            if (message.losses != null && Object.hasOwnProperty.call(message, "losses"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.losses);
            if (message.bestDailyScore != null && Object.hasOwnProperty.call(message, "bestDailyScore"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.bestDailyScore);
            if (message.bestClassicScore != null && Object.hasOwnProperty.call(message, "bestClassicScore"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.bestClassicScore);
            if (message.bestTile != null && Object.hasOwnProperty.call(message, "bestTile"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.bestTile);
            if (message.totalScore != null && Object.hasOwnProperty.call(message, "totalScore"))
                writer.uint32(/* id 10, wireType 0 =*/80).uint64(message.totalScore);
            if (message.classicPointsBalance != null && Object.hasOwnProperty.call(message, "classicPointsBalance"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint64(message.classicPointsBalance);
            if (message.classicPointsEarned != null && Object.hasOwnProperty.call(message, "classicPointsEarned"))
                writer.uint32(/* id 12, wireType 0 =*/96).uint64(message.classicPointsEarned);
            if (message.loginStreak != null && Object.hasOwnProperty.call(message, "loginStreak"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint64(message.loginStreak);
            if (message.lastLoginClaimUtcDate != null && Object.hasOwnProperty.call(message, "lastLoginClaimUtcDate"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.lastLoginClaimUtcDate);
            if (message.classicPointsBonusUtcDate != null && Object.hasOwnProperty.call(message, "classicPointsBonusUtcDate"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.classicPointsBonusUtcDate);
            return writer;
        };

        /**
         * Encodes the specified PlayerStats message, length delimited. Does not implicitly {@link types.PlayerStats.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PlayerStats
         * @static
         * @param {types.IPlayerStats} message PlayerStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerStats.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayerStats message from the specified reader or buffer.
         * @function decode
         * @memberof types.PlayerStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PlayerStats} PlayerStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerStats.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PlayerStats();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.playerAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.dailyGamesStarted = reader.uint64();
                        break;
                    }
                case 3: {
                        message.classicGamesStarted = reader.uint64();
                        break;
                    }
                case 4: {
                        message.gamesCompleted = reader.uint64();
                        break;
                    }
                case 5: {
                        message.wins = reader.uint64();
                        break;
                    }
                case 6: {
                        message.losses = reader.uint64();
                        break;
                    }
                case 7: {
                        message.bestDailyScore = reader.uint64();
                        break;
                    }
                case 8: {
                        message.bestClassicScore = reader.uint64();
                        break;
                    }
                case 9: {
                        message.bestTile = reader.uint64();
                        break;
                    }
                case 10: {
                        message.totalScore = reader.uint64();
                        break;
                    }
                case 11: {
                        message.classicPointsBalance = reader.uint64();
                        break;
                    }
                case 12: {
                        message.classicPointsEarned = reader.uint64();
                        break;
                    }
                case 13: {
                        message.loginStreak = reader.uint64();
                        break;
                    }
                case 14: {
                        message.lastLoginClaimUtcDate = reader.string();
                        break;
                    }
                case 15: {
                        message.classicPointsBonusUtcDate = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayerStats message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PlayerStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PlayerStats} PlayerStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerStats.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayerStats message.
         * @function verify
         * @memberof types.PlayerStats
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayerStats.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                if (!(message.playerAddress && typeof message.playerAddress.length === "number" || $util.isString(message.playerAddress)))
                    return "playerAddress: buffer expected";
            if (message.dailyGamesStarted != null && message.hasOwnProperty("dailyGamesStarted"))
                if (!$util.isInteger(message.dailyGamesStarted) && !(message.dailyGamesStarted && $util.isInteger(message.dailyGamesStarted.low) && $util.isInteger(message.dailyGamesStarted.high)))
                    return "dailyGamesStarted: integer|Long expected";
            if (message.classicGamesStarted != null && message.hasOwnProperty("classicGamesStarted"))
                if (!$util.isInteger(message.classicGamesStarted) && !(message.classicGamesStarted && $util.isInteger(message.classicGamesStarted.low) && $util.isInteger(message.classicGamesStarted.high)))
                    return "classicGamesStarted: integer|Long expected";
            if (message.gamesCompleted != null && message.hasOwnProperty("gamesCompleted"))
                if (!$util.isInteger(message.gamesCompleted) && !(message.gamesCompleted && $util.isInteger(message.gamesCompleted.low) && $util.isInteger(message.gamesCompleted.high)))
                    return "gamesCompleted: integer|Long expected";
            if (message.wins != null && message.hasOwnProperty("wins"))
                if (!$util.isInteger(message.wins) && !(message.wins && $util.isInteger(message.wins.low) && $util.isInteger(message.wins.high)))
                    return "wins: integer|Long expected";
            if (message.losses != null && message.hasOwnProperty("losses"))
                if (!$util.isInteger(message.losses) && !(message.losses && $util.isInteger(message.losses.low) && $util.isInteger(message.losses.high)))
                    return "losses: integer|Long expected";
            if (message.bestDailyScore != null && message.hasOwnProperty("bestDailyScore"))
                if (!$util.isInteger(message.bestDailyScore) && !(message.bestDailyScore && $util.isInteger(message.bestDailyScore.low) && $util.isInteger(message.bestDailyScore.high)))
                    return "bestDailyScore: integer|Long expected";
            if (message.bestClassicScore != null && message.hasOwnProperty("bestClassicScore"))
                if (!$util.isInteger(message.bestClassicScore) && !(message.bestClassicScore && $util.isInteger(message.bestClassicScore.low) && $util.isInteger(message.bestClassicScore.high)))
                    return "bestClassicScore: integer|Long expected";
            if (message.bestTile != null && message.hasOwnProperty("bestTile"))
                if (!$util.isInteger(message.bestTile) && !(message.bestTile && $util.isInteger(message.bestTile.low) && $util.isInteger(message.bestTile.high)))
                    return "bestTile: integer|Long expected";
            if (message.totalScore != null && message.hasOwnProperty("totalScore"))
                if (!$util.isInteger(message.totalScore) && !(message.totalScore && $util.isInteger(message.totalScore.low) && $util.isInteger(message.totalScore.high)))
                    return "totalScore: integer|Long expected";
            if (message.classicPointsBalance != null && message.hasOwnProperty("classicPointsBalance"))
                if (!$util.isInteger(message.classicPointsBalance) && !(message.classicPointsBalance && $util.isInteger(message.classicPointsBalance.low) && $util.isInteger(message.classicPointsBalance.high)))
                    return "classicPointsBalance: integer|Long expected";
            if (message.classicPointsEarned != null && message.hasOwnProperty("classicPointsEarned"))
                if (!$util.isInteger(message.classicPointsEarned) && !(message.classicPointsEarned && $util.isInteger(message.classicPointsEarned.low) && $util.isInteger(message.classicPointsEarned.high)))
                    return "classicPointsEarned: integer|Long expected";
            if (message.loginStreak != null && message.hasOwnProperty("loginStreak"))
                if (!$util.isInteger(message.loginStreak) && !(message.loginStreak && $util.isInteger(message.loginStreak.low) && $util.isInteger(message.loginStreak.high)))
                    return "loginStreak: integer|Long expected";
            if (message.lastLoginClaimUtcDate != null && message.hasOwnProperty("lastLoginClaimUtcDate"))
                if (!$util.isString(message.lastLoginClaimUtcDate))
                    return "lastLoginClaimUtcDate: string expected";
            if (message.classicPointsBonusUtcDate != null && message.hasOwnProperty("classicPointsBonusUtcDate"))
                if (!$util.isString(message.classicPointsBonusUtcDate))
                    return "classicPointsBonusUtcDate: string expected";
            return null;
        };

        /**
         * Creates a PlayerStats message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PlayerStats
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PlayerStats} PlayerStats
         */
        PlayerStats.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PlayerStats)
                return object;
            var message = new $root.types.PlayerStats();
            if (object.playerAddress != null)
                if (typeof object.playerAddress === "string")
                    $util.base64.decode(object.playerAddress, message.playerAddress = $util.newBuffer($util.base64.length(object.playerAddress)), 0);
                else if (object.playerAddress.length >= 0)
                    message.playerAddress = object.playerAddress;
            if (object.dailyGamesStarted != null)
                if ($util.Long)
                    (message.dailyGamesStarted = $util.Long.fromValue(object.dailyGamesStarted)).unsigned = true;
                else if (typeof object.dailyGamesStarted === "string")
                    message.dailyGamesStarted = parseInt(object.dailyGamesStarted, 10);
                else if (typeof object.dailyGamesStarted === "number")
                    message.dailyGamesStarted = object.dailyGamesStarted;
                else if (typeof object.dailyGamesStarted === "object")
                    message.dailyGamesStarted = new $util.LongBits(object.dailyGamesStarted.low >>> 0, object.dailyGamesStarted.high >>> 0).toNumber(true);
            if (object.classicGamesStarted != null)
                if ($util.Long)
                    (message.classicGamesStarted = $util.Long.fromValue(object.classicGamesStarted)).unsigned = true;
                else if (typeof object.classicGamesStarted === "string")
                    message.classicGamesStarted = parseInt(object.classicGamesStarted, 10);
                else if (typeof object.classicGamesStarted === "number")
                    message.classicGamesStarted = object.classicGamesStarted;
                else if (typeof object.classicGamesStarted === "object")
                    message.classicGamesStarted = new $util.LongBits(object.classicGamesStarted.low >>> 0, object.classicGamesStarted.high >>> 0).toNumber(true);
            if (object.gamesCompleted != null)
                if ($util.Long)
                    (message.gamesCompleted = $util.Long.fromValue(object.gamesCompleted)).unsigned = true;
                else if (typeof object.gamesCompleted === "string")
                    message.gamesCompleted = parseInt(object.gamesCompleted, 10);
                else if (typeof object.gamesCompleted === "number")
                    message.gamesCompleted = object.gamesCompleted;
                else if (typeof object.gamesCompleted === "object")
                    message.gamesCompleted = new $util.LongBits(object.gamesCompleted.low >>> 0, object.gamesCompleted.high >>> 0).toNumber(true);
            if (object.wins != null)
                if ($util.Long)
                    (message.wins = $util.Long.fromValue(object.wins)).unsigned = true;
                else if (typeof object.wins === "string")
                    message.wins = parseInt(object.wins, 10);
                else if (typeof object.wins === "number")
                    message.wins = object.wins;
                else if (typeof object.wins === "object")
                    message.wins = new $util.LongBits(object.wins.low >>> 0, object.wins.high >>> 0).toNumber(true);
            if (object.losses != null)
                if ($util.Long)
                    (message.losses = $util.Long.fromValue(object.losses)).unsigned = true;
                else if (typeof object.losses === "string")
                    message.losses = parseInt(object.losses, 10);
                else if (typeof object.losses === "number")
                    message.losses = object.losses;
                else if (typeof object.losses === "object")
                    message.losses = new $util.LongBits(object.losses.low >>> 0, object.losses.high >>> 0).toNumber(true);
            if (object.bestDailyScore != null)
                if ($util.Long)
                    (message.bestDailyScore = $util.Long.fromValue(object.bestDailyScore)).unsigned = true;
                else if (typeof object.bestDailyScore === "string")
                    message.bestDailyScore = parseInt(object.bestDailyScore, 10);
                else if (typeof object.bestDailyScore === "number")
                    message.bestDailyScore = object.bestDailyScore;
                else if (typeof object.bestDailyScore === "object")
                    message.bestDailyScore = new $util.LongBits(object.bestDailyScore.low >>> 0, object.bestDailyScore.high >>> 0).toNumber(true);
            if (object.bestClassicScore != null)
                if ($util.Long)
                    (message.bestClassicScore = $util.Long.fromValue(object.bestClassicScore)).unsigned = true;
                else if (typeof object.bestClassicScore === "string")
                    message.bestClassicScore = parseInt(object.bestClassicScore, 10);
                else if (typeof object.bestClassicScore === "number")
                    message.bestClassicScore = object.bestClassicScore;
                else if (typeof object.bestClassicScore === "object")
                    message.bestClassicScore = new $util.LongBits(object.bestClassicScore.low >>> 0, object.bestClassicScore.high >>> 0).toNumber(true);
            if (object.bestTile != null)
                if ($util.Long)
                    (message.bestTile = $util.Long.fromValue(object.bestTile)).unsigned = true;
                else if (typeof object.bestTile === "string")
                    message.bestTile = parseInt(object.bestTile, 10);
                else if (typeof object.bestTile === "number")
                    message.bestTile = object.bestTile;
                else if (typeof object.bestTile === "object")
                    message.bestTile = new $util.LongBits(object.bestTile.low >>> 0, object.bestTile.high >>> 0).toNumber(true);
            if (object.totalScore != null)
                if ($util.Long)
                    (message.totalScore = $util.Long.fromValue(object.totalScore)).unsigned = true;
                else if (typeof object.totalScore === "string")
                    message.totalScore = parseInt(object.totalScore, 10);
                else if (typeof object.totalScore === "number")
                    message.totalScore = object.totalScore;
                else if (typeof object.totalScore === "object")
                    message.totalScore = new $util.LongBits(object.totalScore.low >>> 0, object.totalScore.high >>> 0).toNumber(true);
            if (object.classicPointsBalance != null)
                if ($util.Long)
                    (message.classicPointsBalance = $util.Long.fromValue(object.classicPointsBalance)).unsigned = true;
                else if (typeof object.classicPointsBalance === "string")
                    message.classicPointsBalance = parseInt(object.classicPointsBalance, 10);
                else if (typeof object.classicPointsBalance === "number")
                    message.classicPointsBalance = object.classicPointsBalance;
                else if (typeof object.classicPointsBalance === "object")
                    message.classicPointsBalance = new $util.LongBits(object.classicPointsBalance.low >>> 0, object.classicPointsBalance.high >>> 0).toNumber(true);
            if (object.classicPointsEarned != null)
                if ($util.Long)
                    (message.classicPointsEarned = $util.Long.fromValue(object.classicPointsEarned)).unsigned = true;
                else if (typeof object.classicPointsEarned === "string")
                    message.classicPointsEarned = parseInt(object.classicPointsEarned, 10);
                else if (typeof object.classicPointsEarned === "number")
                    message.classicPointsEarned = object.classicPointsEarned;
                else if (typeof object.classicPointsEarned === "object")
                    message.classicPointsEarned = new $util.LongBits(object.classicPointsEarned.low >>> 0, object.classicPointsEarned.high >>> 0).toNumber(true);
            if (object.loginStreak != null)
                if ($util.Long)
                    (message.loginStreak = $util.Long.fromValue(object.loginStreak)).unsigned = true;
                else if (typeof object.loginStreak === "string")
                    message.loginStreak = parseInt(object.loginStreak, 10);
                else if (typeof object.loginStreak === "number")
                    message.loginStreak = object.loginStreak;
                else if (typeof object.loginStreak === "object")
                    message.loginStreak = new $util.LongBits(object.loginStreak.low >>> 0, object.loginStreak.high >>> 0).toNumber(true);
            if (object.lastLoginClaimUtcDate != null)
                message.lastLoginClaimUtcDate = String(object.lastLoginClaimUtcDate);
            if (object.classicPointsBonusUtcDate != null)
                message.classicPointsBonusUtcDate = String(object.classicPointsBonusUtcDate);
            return message;
        };

        /**
         * Creates a plain object from a PlayerStats message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PlayerStats
         * @static
         * @param {types.PlayerStats} message PlayerStats
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerStats.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.playerAddress = "";
                else {
                    object.playerAddress = [];
                    if (options.bytes !== Array)
                        object.playerAddress = $util.newBuffer(object.playerAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.dailyGamesStarted = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dailyGamesStarted = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicGamesStarted = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicGamesStarted = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.gamesCompleted = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.gamesCompleted = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.wins = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.wins = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.losses = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.losses = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.bestDailyScore = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.bestDailyScore = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.bestClassicScore = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.bestClassicScore = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.bestTile = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.bestTile = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.totalScore = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.totalScore = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicPointsBalance = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicPointsBalance = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.classicPointsEarned = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.classicPointsEarned = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.loginStreak = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.loginStreak = options.longs === String ? "0" : 0;
                object.lastLoginClaimUtcDate = "";
                object.classicPointsBonusUtcDate = "";
            }
            if (message.playerAddress != null && message.hasOwnProperty("playerAddress"))
                object.playerAddress = options.bytes === String ? $util.base64.encode(message.playerAddress, 0, message.playerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.playerAddress) : message.playerAddress;
            if (message.dailyGamesStarted != null && message.hasOwnProperty("dailyGamesStarted"))
                if (typeof message.dailyGamesStarted === "number")
                    object.dailyGamesStarted = options.longs === String ? String(message.dailyGamesStarted) : message.dailyGamesStarted;
                else
                    object.dailyGamesStarted = options.longs === String ? $util.Long.prototype.toString.call(message.dailyGamesStarted) : options.longs === Number ? new $util.LongBits(message.dailyGamesStarted.low >>> 0, message.dailyGamesStarted.high >>> 0).toNumber(true) : message.dailyGamesStarted;
            if (message.classicGamesStarted != null && message.hasOwnProperty("classicGamesStarted"))
                if (typeof message.classicGamesStarted === "number")
                    object.classicGamesStarted = options.longs === String ? String(message.classicGamesStarted) : message.classicGamesStarted;
                else
                    object.classicGamesStarted = options.longs === String ? $util.Long.prototype.toString.call(message.classicGamesStarted) : options.longs === Number ? new $util.LongBits(message.classicGamesStarted.low >>> 0, message.classicGamesStarted.high >>> 0).toNumber(true) : message.classicGamesStarted;
            if (message.gamesCompleted != null && message.hasOwnProperty("gamesCompleted"))
                if (typeof message.gamesCompleted === "number")
                    object.gamesCompleted = options.longs === String ? String(message.gamesCompleted) : message.gamesCompleted;
                else
                    object.gamesCompleted = options.longs === String ? $util.Long.prototype.toString.call(message.gamesCompleted) : options.longs === Number ? new $util.LongBits(message.gamesCompleted.low >>> 0, message.gamesCompleted.high >>> 0).toNumber(true) : message.gamesCompleted;
            if (message.wins != null && message.hasOwnProperty("wins"))
                if (typeof message.wins === "number")
                    object.wins = options.longs === String ? String(message.wins) : message.wins;
                else
                    object.wins = options.longs === String ? $util.Long.prototype.toString.call(message.wins) : options.longs === Number ? new $util.LongBits(message.wins.low >>> 0, message.wins.high >>> 0).toNumber(true) : message.wins;
            if (message.losses != null && message.hasOwnProperty("losses"))
                if (typeof message.losses === "number")
                    object.losses = options.longs === String ? String(message.losses) : message.losses;
                else
                    object.losses = options.longs === String ? $util.Long.prototype.toString.call(message.losses) : options.longs === Number ? new $util.LongBits(message.losses.low >>> 0, message.losses.high >>> 0).toNumber(true) : message.losses;
            if (message.bestDailyScore != null && message.hasOwnProperty("bestDailyScore"))
                if (typeof message.bestDailyScore === "number")
                    object.bestDailyScore = options.longs === String ? String(message.bestDailyScore) : message.bestDailyScore;
                else
                    object.bestDailyScore = options.longs === String ? $util.Long.prototype.toString.call(message.bestDailyScore) : options.longs === Number ? new $util.LongBits(message.bestDailyScore.low >>> 0, message.bestDailyScore.high >>> 0).toNumber(true) : message.bestDailyScore;
            if (message.bestClassicScore != null && message.hasOwnProperty("bestClassicScore"))
                if (typeof message.bestClassicScore === "number")
                    object.bestClassicScore = options.longs === String ? String(message.bestClassicScore) : message.bestClassicScore;
                else
                    object.bestClassicScore = options.longs === String ? $util.Long.prototype.toString.call(message.bestClassicScore) : options.longs === Number ? new $util.LongBits(message.bestClassicScore.low >>> 0, message.bestClassicScore.high >>> 0).toNumber(true) : message.bestClassicScore;
            if (message.bestTile != null && message.hasOwnProperty("bestTile"))
                if (typeof message.bestTile === "number")
                    object.bestTile = options.longs === String ? String(message.bestTile) : message.bestTile;
                else
                    object.bestTile = options.longs === String ? $util.Long.prototype.toString.call(message.bestTile) : options.longs === Number ? new $util.LongBits(message.bestTile.low >>> 0, message.bestTile.high >>> 0).toNumber(true) : message.bestTile;
            if (message.totalScore != null && message.hasOwnProperty("totalScore"))
                if (typeof message.totalScore === "number")
                    object.totalScore = options.longs === String ? String(message.totalScore) : message.totalScore;
                else
                    object.totalScore = options.longs === String ? $util.Long.prototype.toString.call(message.totalScore) : options.longs === Number ? new $util.LongBits(message.totalScore.low >>> 0, message.totalScore.high >>> 0).toNumber(true) : message.totalScore;
            if (message.classicPointsBalance != null && message.hasOwnProperty("classicPointsBalance"))
                if (typeof message.classicPointsBalance === "number")
                    object.classicPointsBalance = options.longs === String ? String(message.classicPointsBalance) : message.classicPointsBalance;
                else
                    object.classicPointsBalance = options.longs === String ? $util.Long.prototype.toString.call(message.classicPointsBalance) : options.longs === Number ? new $util.LongBits(message.classicPointsBalance.low >>> 0, message.classicPointsBalance.high >>> 0).toNumber(true) : message.classicPointsBalance;
            if (message.classicPointsEarned != null && message.hasOwnProperty("classicPointsEarned"))
                if (typeof message.classicPointsEarned === "number")
                    object.classicPointsEarned = options.longs === String ? String(message.classicPointsEarned) : message.classicPointsEarned;
                else
                    object.classicPointsEarned = options.longs === String ? $util.Long.prototype.toString.call(message.classicPointsEarned) : options.longs === Number ? new $util.LongBits(message.classicPointsEarned.low >>> 0, message.classicPointsEarned.high >>> 0).toNumber(true) : message.classicPointsEarned;
            if (message.loginStreak != null && message.hasOwnProperty("loginStreak"))
                if (typeof message.loginStreak === "number")
                    object.loginStreak = options.longs === String ? String(message.loginStreak) : message.loginStreak;
                else
                    object.loginStreak = options.longs === String ? $util.Long.prototype.toString.call(message.loginStreak) : options.longs === Number ? new $util.LongBits(message.loginStreak.low >>> 0, message.loginStreak.high >>> 0).toNumber(true) : message.loginStreak;
            if (message.lastLoginClaimUtcDate != null && message.hasOwnProperty("lastLoginClaimUtcDate"))
                object.lastLoginClaimUtcDate = message.lastLoginClaimUtcDate;
            if (message.classicPointsBonusUtcDate != null && message.hasOwnProperty("classicPointsBonusUtcDate"))
                object.classicPointsBonusUtcDate = message.classicPointsBonusUtcDate;
            return object;
        };

        /**
         * Converts this PlayerStats to JSON.
         * @function toJSON
         * @memberof types.PlayerStats
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayerStats.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayerStats
         * @function getTypeUrl
         * @memberof types.PlayerStats
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayerStats.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PlayerStats";
        };

        return PlayerStats;
    })();

    types.FSMToPlugin = (function() {

        /**
         * Properties of a FSMToPlugin.
         * @memberof types
         * @interface IFSMToPlugin
         * @property {number|Long|null} [id] FSMToPlugin id
         * @property {types.IPluginFSMConfig|null} [config] FSMToPlugin config
         * @property {types.IPluginGenesisRequest|null} [genesis] FSMToPlugin genesis
         * @property {types.IPluginBeginRequest|null} [begin] FSMToPlugin begin
         * @property {types.IPluginCheckRequest|null} [check] FSMToPlugin check
         * @property {types.IPluginDeliverRequest|null} [deliver] FSMToPlugin deliver
         * @property {types.IPluginEndRequest|null} [end] FSMToPlugin end
         * @property {types.IPluginStateReadResponse|null} [stateRead] FSMToPlugin stateRead
         * @property {types.IPluginStateWriteResponse|null} [stateWrite] FSMToPlugin stateWrite
         * @property {types.IPluginQueryResponse|null} [query] FSMToPlugin query
         * @property {types.IPluginError|null} [error] FSMToPlugin error
         */

        /**
         * Constructs a new FSMToPlugin.
         * @memberof types
         * @classdesc Represents a FSMToPlugin.
         * @implements IFSMToPlugin
         * @constructor
         * @param {types.IFSMToPlugin=} [properties] Properties to set
         */
        function FSMToPlugin(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FSMToPlugin id.
         * @member {number|Long} id
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * FSMToPlugin config.
         * @member {types.IPluginFSMConfig|null|undefined} config
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.config = null;

        /**
         * FSMToPlugin genesis.
         * @member {types.IPluginGenesisRequest|null|undefined} genesis
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.genesis = null;

        /**
         * FSMToPlugin begin.
         * @member {types.IPluginBeginRequest|null|undefined} begin
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.begin = null;

        /**
         * FSMToPlugin check.
         * @member {types.IPluginCheckRequest|null|undefined} check
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.check = null;

        /**
         * FSMToPlugin deliver.
         * @member {types.IPluginDeliverRequest|null|undefined} deliver
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.deliver = null;

        /**
         * FSMToPlugin end.
         * @member {types.IPluginEndRequest|null|undefined} end
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.end = null;

        /**
         * FSMToPlugin stateRead.
         * @member {types.IPluginStateReadResponse|null|undefined} stateRead
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.stateRead = null;

        /**
         * FSMToPlugin stateWrite.
         * @member {types.IPluginStateWriteResponse|null|undefined} stateWrite
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.stateWrite = null;

        /**
         * FSMToPlugin query.
         * @member {types.IPluginQueryResponse|null|undefined} query
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.query = null;

        /**
         * FSMToPlugin error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.FSMToPlugin
         * @instance
         */
        FSMToPlugin.prototype.error = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * FSMToPlugin payload.
         * @member {"config"|"genesis"|"begin"|"check"|"deliver"|"end"|"stateRead"|"stateWrite"|"query"|"error"|undefined} payload
         * @memberof types.FSMToPlugin
         * @instance
         */
        Object.defineProperty(FSMToPlugin.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["config", "genesis", "begin", "check", "deliver", "end", "stateRead", "stateWrite", "query", "error"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new FSMToPlugin instance using the specified properties.
         * @function create
         * @memberof types.FSMToPlugin
         * @static
         * @param {types.IFSMToPlugin=} [properties] Properties to set
         * @returns {types.FSMToPlugin} FSMToPlugin instance
         */
        FSMToPlugin.create = function create(properties) {
            return new FSMToPlugin(properties);
        };

        /**
         * Encodes the specified FSMToPlugin message. Does not implicitly {@link types.FSMToPlugin.verify|verify} messages.
         * @function encode
         * @memberof types.FSMToPlugin
         * @static
         * @param {types.IFSMToPlugin} message FSMToPlugin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FSMToPlugin.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                $root.types.PluginFSMConfig.encode(message.config, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.genesis != null && Object.hasOwnProperty.call(message, "genesis"))
                $root.types.PluginGenesisRequest.encode(message.genesis, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.begin != null && Object.hasOwnProperty.call(message, "begin"))
                $root.types.PluginBeginRequest.encode(message.begin, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.check != null && Object.hasOwnProperty.call(message, "check"))
                $root.types.PluginCheckRequest.encode(message.check, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.deliver != null && Object.hasOwnProperty.call(message, "deliver"))
                $root.types.PluginDeliverRequest.encode(message.deliver, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.end != null && Object.hasOwnProperty.call(message, "end"))
                $root.types.PluginEndRequest.encode(message.end, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.stateRead != null && Object.hasOwnProperty.call(message, "stateRead"))
                $root.types.PluginStateReadResponse.encode(message.stateRead, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.stateWrite != null && Object.hasOwnProperty.call(message, "stateWrite"))
                $root.types.PluginStateWriteResponse.encode(message.stateWrite, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.query != null && Object.hasOwnProperty.call(message, "query"))
                $root.types.PluginQueryResponse.encode(message.query, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified FSMToPlugin message, length delimited. Does not implicitly {@link types.FSMToPlugin.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.FSMToPlugin
         * @static
         * @param {types.IFSMToPlugin} message FSMToPlugin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FSMToPlugin.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FSMToPlugin message from the specified reader or buffer.
         * @function decode
         * @memberof types.FSMToPlugin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.FSMToPlugin} FSMToPlugin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FSMToPlugin.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.FSMToPlugin();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.config = $root.types.PluginFSMConfig.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.genesis = $root.types.PluginGenesisRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.begin = $root.types.PluginBeginRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.check = $root.types.PluginCheckRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.deliver = $root.types.PluginDeliverRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.end = $root.types.PluginEndRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.stateRead = $root.types.PluginStateReadResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.stateWrite = $root.types.PluginStateWriteResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.query = $root.types.PluginQueryResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FSMToPlugin message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.FSMToPlugin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.FSMToPlugin} FSMToPlugin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FSMToPlugin.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FSMToPlugin message.
         * @function verify
         * @memberof types.FSMToPlugin
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FSMToPlugin.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.config != null && message.hasOwnProperty("config")) {
                properties.payload = 1;
                {
                    var error = $root.types.PluginFSMConfig.verify(message.config);
                    if (error)
                        return "config." + error;
                }
            }
            if (message.genesis != null && message.hasOwnProperty("genesis")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginGenesisRequest.verify(message.genesis);
                    if (error)
                        return "genesis." + error;
                }
            }
            if (message.begin != null && message.hasOwnProperty("begin")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginBeginRequest.verify(message.begin);
                    if (error)
                        return "begin." + error;
                }
            }
            if (message.check != null && message.hasOwnProperty("check")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginCheckRequest.verify(message.check);
                    if (error)
                        return "check." + error;
                }
            }
            if (message.deliver != null && message.hasOwnProperty("deliver")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginDeliverRequest.verify(message.deliver);
                    if (error)
                        return "deliver." + error;
                }
            }
            if (message.end != null && message.hasOwnProperty("end")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginEndRequest.verify(message.end);
                    if (error)
                        return "end." + error;
                }
            }
            if (message.stateRead != null && message.hasOwnProperty("stateRead")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginStateReadResponse.verify(message.stateRead);
                    if (error)
                        return "stateRead." + error;
                }
            }
            if (message.stateWrite != null && message.hasOwnProperty("stateWrite")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginStateWriteResponse.verify(message.stateWrite);
                    if (error)
                        return "stateWrite." + error;
                }
            }
            if (message.query != null && message.hasOwnProperty("query")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginQueryResponse.verify(message.query);
                    if (error)
                        return "query." + error;
                }
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginError.verify(message.error);
                    if (error)
                        return "error." + error;
                }
            }
            return null;
        };

        /**
         * Creates a FSMToPlugin message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.FSMToPlugin
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.FSMToPlugin} FSMToPlugin
         */
        FSMToPlugin.fromObject = function fromObject(object) {
            if (object instanceof $root.types.FSMToPlugin)
                return object;
            var message = new $root.types.FSMToPlugin();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.config != null) {
                if (typeof object.config !== "object")
                    throw TypeError(".types.FSMToPlugin.config: object expected");
                message.config = $root.types.PluginFSMConfig.fromObject(object.config);
            }
            if (object.genesis != null) {
                if (typeof object.genesis !== "object")
                    throw TypeError(".types.FSMToPlugin.genesis: object expected");
                message.genesis = $root.types.PluginGenesisRequest.fromObject(object.genesis);
            }
            if (object.begin != null) {
                if (typeof object.begin !== "object")
                    throw TypeError(".types.FSMToPlugin.begin: object expected");
                message.begin = $root.types.PluginBeginRequest.fromObject(object.begin);
            }
            if (object.check != null) {
                if (typeof object.check !== "object")
                    throw TypeError(".types.FSMToPlugin.check: object expected");
                message.check = $root.types.PluginCheckRequest.fromObject(object.check);
            }
            if (object.deliver != null) {
                if (typeof object.deliver !== "object")
                    throw TypeError(".types.FSMToPlugin.deliver: object expected");
                message.deliver = $root.types.PluginDeliverRequest.fromObject(object.deliver);
            }
            if (object.end != null) {
                if (typeof object.end !== "object")
                    throw TypeError(".types.FSMToPlugin.end: object expected");
                message.end = $root.types.PluginEndRequest.fromObject(object.end);
            }
            if (object.stateRead != null) {
                if (typeof object.stateRead !== "object")
                    throw TypeError(".types.FSMToPlugin.stateRead: object expected");
                message.stateRead = $root.types.PluginStateReadResponse.fromObject(object.stateRead);
            }
            if (object.stateWrite != null) {
                if (typeof object.stateWrite !== "object")
                    throw TypeError(".types.FSMToPlugin.stateWrite: object expected");
                message.stateWrite = $root.types.PluginStateWriteResponse.fromObject(object.stateWrite);
            }
            if (object.query != null) {
                if (typeof object.query !== "object")
                    throw TypeError(".types.FSMToPlugin.query: object expected");
                message.query = $root.types.PluginQueryResponse.fromObject(object.query);
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.FSMToPlugin.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a FSMToPlugin message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.FSMToPlugin
         * @static
         * @param {types.FSMToPlugin} message FSMToPlugin
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FSMToPlugin.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.config != null && message.hasOwnProperty("config")) {
                object.config = $root.types.PluginFSMConfig.toObject(message.config, options);
                if (options.oneofs)
                    object.payload = "config";
            }
            if (message.genesis != null && message.hasOwnProperty("genesis")) {
                object.genesis = $root.types.PluginGenesisRequest.toObject(message.genesis, options);
                if (options.oneofs)
                    object.payload = "genesis";
            }
            if (message.begin != null && message.hasOwnProperty("begin")) {
                object.begin = $root.types.PluginBeginRequest.toObject(message.begin, options);
                if (options.oneofs)
                    object.payload = "begin";
            }
            if (message.check != null && message.hasOwnProperty("check")) {
                object.check = $root.types.PluginCheckRequest.toObject(message.check, options);
                if (options.oneofs)
                    object.payload = "check";
            }
            if (message.deliver != null && message.hasOwnProperty("deliver")) {
                object.deliver = $root.types.PluginDeliverRequest.toObject(message.deliver, options);
                if (options.oneofs)
                    object.payload = "deliver";
            }
            if (message.end != null && message.hasOwnProperty("end")) {
                object.end = $root.types.PluginEndRequest.toObject(message.end, options);
                if (options.oneofs)
                    object.payload = "end";
            }
            if (message.stateRead != null && message.hasOwnProperty("stateRead")) {
                object.stateRead = $root.types.PluginStateReadResponse.toObject(message.stateRead, options);
                if (options.oneofs)
                    object.payload = "stateRead";
            }
            if (message.stateWrite != null && message.hasOwnProperty("stateWrite")) {
                object.stateWrite = $root.types.PluginStateWriteResponse.toObject(message.stateWrite, options);
                if (options.oneofs)
                    object.payload = "stateWrite";
            }
            if (message.query != null && message.hasOwnProperty("query")) {
                object.query = $root.types.PluginQueryResponse.toObject(message.query, options);
                if (options.oneofs)
                    object.payload = "query";
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                object.error = $root.types.PluginError.toObject(message.error, options);
                if (options.oneofs)
                    object.payload = "error";
            }
            return object;
        };

        /**
         * Converts this FSMToPlugin to JSON.
         * @function toJSON
         * @memberof types.FSMToPlugin
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FSMToPlugin.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FSMToPlugin
         * @function getTypeUrl
         * @memberof types.FSMToPlugin
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FSMToPlugin.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.FSMToPlugin";
        };

        return FSMToPlugin;
    })();

    types.PluginToFSM = (function() {

        /**
         * Properties of a PluginToFSM.
         * @memberof types
         * @interface IPluginToFSM
         * @property {number|Long|null} [id] PluginToFSM id
         * @property {types.IPluginConfig|null} [config] PluginToFSM config
         * @property {types.IPluginGenesisResponse|null} [genesis] PluginToFSM genesis
         * @property {types.IPluginBeginResponse|null} [begin] PluginToFSM begin
         * @property {types.IPluginCheckResponse|null} [check] PluginToFSM check
         * @property {types.IPluginDeliverResponse|null} [deliver] PluginToFSM deliver
         * @property {types.IPluginEndResponse|null} [end] PluginToFSM end
         * @property {types.IPluginStateReadRequest|null} [stateRead] PluginToFSM stateRead
         * @property {types.IPluginStateWriteRequest|null} [stateWrite] PluginToFSM stateWrite
         * @property {types.IPluginQueryRequest|null} [query] PluginToFSM query
         */

        /**
         * Constructs a new PluginToFSM.
         * @memberof types
         * @classdesc Represents a PluginToFSM.
         * @implements IPluginToFSM
         * @constructor
         * @param {types.IPluginToFSM=} [properties] Properties to set
         */
        function PluginToFSM(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginToFSM id.
         * @member {number|Long} id
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginToFSM config.
         * @member {types.IPluginConfig|null|undefined} config
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.config = null;

        /**
         * PluginToFSM genesis.
         * @member {types.IPluginGenesisResponse|null|undefined} genesis
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.genesis = null;

        /**
         * PluginToFSM begin.
         * @member {types.IPluginBeginResponse|null|undefined} begin
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.begin = null;

        /**
         * PluginToFSM check.
         * @member {types.IPluginCheckResponse|null|undefined} check
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.check = null;

        /**
         * PluginToFSM deliver.
         * @member {types.IPluginDeliverResponse|null|undefined} deliver
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.deliver = null;

        /**
         * PluginToFSM end.
         * @member {types.IPluginEndResponse|null|undefined} end
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.end = null;

        /**
         * PluginToFSM stateRead.
         * @member {types.IPluginStateReadRequest|null|undefined} stateRead
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.stateRead = null;

        /**
         * PluginToFSM stateWrite.
         * @member {types.IPluginStateWriteRequest|null|undefined} stateWrite
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.stateWrite = null;

        /**
         * PluginToFSM query.
         * @member {types.IPluginQueryRequest|null|undefined} query
         * @memberof types.PluginToFSM
         * @instance
         */
        PluginToFSM.prototype.query = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * PluginToFSM payload.
         * @member {"config"|"genesis"|"begin"|"check"|"deliver"|"end"|"stateRead"|"stateWrite"|"query"|undefined} payload
         * @memberof types.PluginToFSM
         * @instance
         */
        Object.defineProperty(PluginToFSM.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["config", "genesis", "begin", "check", "deliver", "end", "stateRead", "stateWrite", "query"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new PluginToFSM instance using the specified properties.
         * @function create
         * @memberof types.PluginToFSM
         * @static
         * @param {types.IPluginToFSM=} [properties] Properties to set
         * @returns {types.PluginToFSM} PluginToFSM instance
         */
        PluginToFSM.create = function create(properties) {
            return new PluginToFSM(properties);
        };

        /**
         * Encodes the specified PluginToFSM message. Does not implicitly {@link types.PluginToFSM.verify|verify} messages.
         * @function encode
         * @memberof types.PluginToFSM
         * @static
         * @param {types.IPluginToFSM} message PluginToFSM message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginToFSM.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                $root.types.PluginConfig.encode(message.config, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.genesis != null && Object.hasOwnProperty.call(message, "genesis"))
                $root.types.PluginGenesisResponse.encode(message.genesis, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.begin != null && Object.hasOwnProperty.call(message, "begin"))
                $root.types.PluginBeginResponse.encode(message.begin, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.check != null && Object.hasOwnProperty.call(message, "check"))
                $root.types.PluginCheckResponse.encode(message.check, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.deliver != null && Object.hasOwnProperty.call(message, "deliver"))
                $root.types.PluginDeliverResponse.encode(message.deliver, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.end != null && Object.hasOwnProperty.call(message, "end"))
                $root.types.PluginEndResponse.encode(message.end, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.stateRead != null && Object.hasOwnProperty.call(message, "stateRead"))
                $root.types.PluginStateReadRequest.encode(message.stateRead, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.stateWrite != null && Object.hasOwnProperty.call(message, "stateWrite"))
                $root.types.PluginStateWriteRequest.encode(message.stateWrite, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.query != null && Object.hasOwnProperty.call(message, "query"))
                $root.types.PluginQueryRequest.encode(message.query, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginToFSM message, length delimited. Does not implicitly {@link types.PluginToFSM.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginToFSM
         * @static
         * @param {types.IPluginToFSM} message PluginToFSM message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginToFSM.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginToFSM message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginToFSM
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginToFSM} PluginToFSM
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginToFSM.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginToFSM();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.config = $root.types.PluginConfig.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.genesis = $root.types.PluginGenesisResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.begin = $root.types.PluginBeginResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.check = $root.types.PluginCheckResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.deliver = $root.types.PluginDeliverResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.end = $root.types.PluginEndResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.stateRead = $root.types.PluginStateReadRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.stateWrite = $root.types.PluginStateWriteRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.query = $root.types.PluginQueryRequest.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginToFSM message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginToFSM
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginToFSM} PluginToFSM
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginToFSM.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginToFSM message.
         * @function verify
         * @memberof types.PluginToFSM
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginToFSM.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.config != null && message.hasOwnProperty("config")) {
                properties.payload = 1;
                {
                    var error = $root.types.PluginConfig.verify(message.config);
                    if (error)
                        return "config." + error;
                }
            }
            if (message.genesis != null && message.hasOwnProperty("genesis")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginGenesisResponse.verify(message.genesis);
                    if (error)
                        return "genesis." + error;
                }
            }
            if (message.begin != null && message.hasOwnProperty("begin")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginBeginResponse.verify(message.begin);
                    if (error)
                        return "begin." + error;
                }
            }
            if (message.check != null && message.hasOwnProperty("check")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginCheckResponse.verify(message.check);
                    if (error)
                        return "check." + error;
                }
            }
            if (message.deliver != null && message.hasOwnProperty("deliver")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginDeliverResponse.verify(message.deliver);
                    if (error)
                        return "deliver." + error;
                }
            }
            if (message.end != null && message.hasOwnProperty("end")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginEndResponse.verify(message.end);
                    if (error)
                        return "end." + error;
                }
            }
            if (message.stateRead != null && message.hasOwnProperty("stateRead")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginStateReadRequest.verify(message.stateRead);
                    if (error)
                        return "stateRead." + error;
                }
            }
            if (message.stateWrite != null && message.hasOwnProperty("stateWrite")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginStateWriteRequest.verify(message.stateWrite);
                    if (error)
                        return "stateWrite." + error;
                }
            }
            if (message.query != null && message.hasOwnProperty("query")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.types.PluginQueryRequest.verify(message.query);
                    if (error)
                        return "query." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PluginToFSM message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginToFSM
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginToFSM} PluginToFSM
         */
        PluginToFSM.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginToFSM)
                return object;
            var message = new $root.types.PluginToFSM();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.config != null) {
                if (typeof object.config !== "object")
                    throw TypeError(".types.PluginToFSM.config: object expected");
                message.config = $root.types.PluginConfig.fromObject(object.config);
            }
            if (object.genesis != null) {
                if (typeof object.genesis !== "object")
                    throw TypeError(".types.PluginToFSM.genesis: object expected");
                message.genesis = $root.types.PluginGenesisResponse.fromObject(object.genesis);
            }
            if (object.begin != null) {
                if (typeof object.begin !== "object")
                    throw TypeError(".types.PluginToFSM.begin: object expected");
                message.begin = $root.types.PluginBeginResponse.fromObject(object.begin);
            }
            if (object.check != null) {
                if (typeof object.check !== "object")
                    throw TypeError(".types.PluginToFSM.check: object expected");
                message.check = $root.types.PluginCheckResponse.fromObject(object.check);
            }
            if (object.deliver != null) {
                if (typeof object.deliver !== "object")
                    throw TypeError(".types.PluginToFSM.deliver: object expected");
                message.deliver = $root.types.PluginDeliverResponse.fromObject(object.deliver);
            }
            if (object.end != null) {
                if (typeof object.end !== "object")
                    throw TypeError(".types.PluginToFSM.end: object expected");
                message.end = $root.types.PluginEndResponse.fromObject(object.end);
            }
            if (object.stateRead != null) {
                if (typeof object.stateRead !== "object")
                    throw TypeError(".types.PluginToFSM.stateRead: object expected");
                message.stateRead = $root.types.PluginStateReadRequest.fromObject(object.stateRead);
            }
            if (object.stateWrite != null) {
                if (typeof object.stateWrite !== "object")
                    throw TypeError(".types.PluginToFSM.stateWrite: object expected");
                message.stateWrite = $root.types.PluginStateWriteRequest.fromObject(object.stateWrite);
            }
            if (object.query != null) {
                if (typeof object.query !== "object")
                    throw TypeError(".types.PluginToFSM.query: object expected");
                message.query = $root.types.PluginQueryRequest.fromObject(object.query);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginToFSM message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginToFSM
         * @static
         * @param {types.PluginToFSM} message PluginToFSM
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginToFSM.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.config != null && message.hasOwnProperty("config")) {
                object.config = $root.types.PluginConfig.toObject(message.config, options);
                if (options.oneofs)
                    object.payload = "config";
            }
            if (message.genesis != null && message.hasOwnProperty("genesis")) {
                object.genesis = $root.types.PluginGenesisResponse.toObject(message.genesis, options);
                if (options.oneofs)
                    object.payload = "genesis";
            }
            if (message.begin != null && message.hasOwnProperty("begin")) {
                object.begin = $root.types.PluginBeginResponse.toObject(message.begin, options);
                if (options.oneofs)
                    object.payload = "begin";
            }
            if (message.check != null && message.hasOwnProperty("check")) {
                object.check = $root.types.PluginCheckResponse.toObject(message.check, options);
                if (options.oneofs)
                    object.payload = "check";
            }
            if (message.deliver != null && message.hasOwnProperty("deliver")) {
                object.deliver = $root.types.PluginDeliverResponse.toObject(message.deliver, options);
                if (options.oneofs)
                    object.payload = "deliver";
            }
            if (message.end != null && message.hasOwnProperty("end")) {
                object.end = $root.types.PluginEndResponse.toObject(message.end, options);
                if (options.oneofs)
                    object.payload = "end";
            }
            if (message.stateRead != null && message.hasOwnProperty("stateRead")) {
                object.stateRead = $root.types.PluginStateReadRequest.toObject(message.stateRead, options);
                if (options.oneofs)
                    object.payload = "stateRead";
            }
            if (message.stateWrite != null && message.hasOwnProperty("stateWrite")) {
                object.stateWrite = $root.types.PluginStateWriteRequest.toObject(message.stateWrite, options);
                if (options.oneofs)
                    object.payload = "stateWrite";
            }
            if (message.query != null && message.hasOwnProperty("query")) {
                object.query = $root.types.PluginQueryRequest.toObject(message.query, options);
                if (options.oneofs)
                    object.payload = "query";
            }
            return object;
        };

        /**
         * Converts this PluginToFSM to JSON.
         * @function toJSON
         * @memberof types.PluginToFSM
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginToFSM.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginToFSM
         * @function getTypeUrl
         * @memberof types.PluginToFSM
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginToFSM.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginToFSM";
        };

        return PluginToFSM;
    })();

    types.PluginConfig = (function() {

        /**
         * Properties of a PluginConfig.
         * @memberof types
         * @interface IPluginConfig
         * @property {string|null} [name] PluginConfig name
         * @property {number|Long|null} [id] PluginConfig id
         * @property {number|Long|null} [version] PluginConfig version
         * @property {Array.<string>|null} [supportedTransactions] PluginConfig supportedTransactions
         * @property {Array.<Uint8Array>|null} [fileDescriptorProtos] PluginConfig fileDescriptorProtos
         * @property {Array.<string>|null} [transactionTypeUrls] PluginConfig transactionTypeUrls
         * @property {Array.<string>|null} [eventTypeUrls] PluginConfig eventTypeUrls
         * @property {Array.<Uint8Array>|null} [customStatePrefixes] PluginConfig customStatePrefixes
         */

        /**
         * Constructs a new PluginConfig.
         * @memberof types
         * @classdesc Represents a PluginConfig.
         * @implements IPluginConfig
         * @constructor
         * @param {types.IPluginConfig=} [properties] Properties to set
         */
        function PluginConfig(properties) {
            this.supportedTransactions = [];
            this.fileDescriptorProtos = [];
            this.transactionTypeUrls = [];
            this.eventTypeUrls = [];
            this.customStatePrefixes = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginConfig name.
         * @member {string} name
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.name = "";

        /**
         * PluginConfig id.
         * @member {number|Long} id
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginConfig version.
         * @member {number|Long} version
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.version = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginConfig supportedTransactions.
         * @member {Array.<string>} supportedTransactions
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.supportedTransactions = $util.emptyArray;

        /**
         * PluginConfig fileDescriptorProtos.
         * @member {Array.<Uint8Array>} fileDescriptorProtos
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.fileDescriptorProtos = $util.emptyArray;

        /**
         * PluginConfig transactionTypeUrls.
         * @member {Array.<string>} transactionTypeUrls
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.transactionTypeUrls = $util.emptyArray;

        /**
         * PluginConfig eventTypeUrls.
         * @member {Array.<string>} eventTypeUrls
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.eventTypeUrls = $util.emptyArray;

        /**
         * PluginConfig customStatePrefixes.
         * @member {Array.<Uint8Array>} customStatePrefixes
         * @memberof types.PluginConfig
         * @instance
         */
        PluginConfig.prototype.customStatePrefixes = $util.emptyArray;

        /**
         * Creates a new PluginConfig instance using the specified properties.
         * @function create
         * @memberof types.PluginConfig
         * @static
         * @param {types.IPluginConfig=} [properties] Properties to set
         * @returns {types.PluginConfig} PluginConfig instance
         */
        PluginConfig.create = function create(properties) {
            return new PluginConfig(properties);
        };

        /**
         * Encodes the specified PluginConfig message. Does not implicitly {@link types.PluginConfig.verify|verify} messages.
         * @function encode
         * @memberof types.PluginConfig
         * @static
         * @param {types.IPluginConfig} message PluginConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.id);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.version);
            if (message.supportedTransactions != null && message.supportedTransactions.length)
                for (var i = 0; i < message.supportedTransactions.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.supportedTransactions[i]);
            if (message.fileDescriptorProtos != null && message.fileDescriptorProtos.length)
                for (var i = 0; i < message.fileDescriptorProtos.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.fileDescriptorProtos[i]);
            if (message.transactionTypeUrls != null && message.transactionTypeUrls.length)
                for (var i = 0; i < message.transactionTypeUrls.length; ++i)
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.transactionTypeUrls[i]);
            if (message.eventTypeUrls != null && message.eventTypeUrls.length)
                for (var i = 0; i < message.eventTypeUrls.length; ++i)
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.eventTypeUrls[i]);
            if (message.customStatePrefixes != null && message.customStatePrefixes.length)
                for (var i = 0; i < message.customStatePrefixes.length; ++i)
                    writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.customStatePrefixes[i]);
            return writer;
        };

        /**
         * Encodes the specified PluginConfig message, length delimited. Does not implicitly {@link types.PluginConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginConfig
         * @static
         * @param {types.IPluginConfig} message PluginConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginConfig message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginConfig} PluginConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.id = reader.uint64();
                        break;
                    }
                case 3: {
                        message.version = reader.uint64();
                        break;
                    }
                case 4: {
                        if (!(message.supportedTransactions && message.supportedTransactions.length))
                            message.supportedTransactions = [];
                        message.supportedTransactions.push(reader.string());
                        break;
                    }
                case 5: {
                        if (!(message.fileDescriptorProtos && message.fileDescriptorProtos.length))
                            message.fileDescriptorProtos = [];
                        message.fileDescriptorProtos.push(reader.bytes());
                        break;
                    }
                case 6: {
                        if (!(message.transactionTypeUrls && message.transactionTypeUrls.length))
                            message.transactionTypeUrls = [];
                        message.transactionTypeUrls.push(reader.string());
                        break;
                    }
                case 7: {
                        if (!(message.eventTypeUrls && message.eventTypeUrls.length))
                            message.eventTypeUrls = [];
                        message.eventTypeUrls.push(reader.string());
                        break;
                    }
                case 8: {
                        if (!(message.customStatePrefixes && message.customStatePrefixes.length))
                            message.customStatePrefixes = [];
                        message.customStatePrefixes.push(reader.bytes());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginConfig} PluginConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginConfig message.
         * @function verify
         * @memberof types.PluginConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isInteger(message.version) && !(message.version && $util.isInteger(message.version.low) && $util.isInteger(message.version.high)))
                    return "version: integer|Long expected";
            if (message.supportedTransactions != null && message.hasOwnProperty("supportedTransactions")) {
                if (!Array.isArray(message.supportedTransactions))
                    return "supportedTransactions: array expected";
                for (var i = 0; i < message.supportedTransactions.length; ++i)
                    if (!$util.isString(message.supportedTransactions[i]))
                        return "supportedTransactions: string[] expected";
            }
            if (message.fileDescriptorProtos != null && message.hasOwnProperty("fileDescriptorProtos")) {
                if (!Array.isArray(message.fileDescriptorProtos))
                    return "fileDescriptorProtos: array expected";
                for (var i = 0; i < message.fileDescriptorProtos.length; ++i)
                    if (!(message.fileDescriptorProtos[i] && typeof message.fileDescriptorProtos[i].length === "number" || $util.isString(message.fileDescriptorProtos[i])))
                        return "fileDescriptorProtos: buffer[] expected";
            }
            if (message.transactionTypeUrls != null && message.hasOwnProperty("transactionTypeUrls")) {
                if (!Array.isArray(message.transactionTypeUrls))
                    return "transactionTypeUrls: array expected";
                for (var i = 0; i < message.transactionTypeUrls.length; ++i)
                    if (!$util.isString(message.transactionTypeUrls[i]))
                        return "transactionTypeUrls: string[] expected";
            }
            if (message.eventTypeUrls != null && message.hasOwnProperty("eventTypeUrls")) {
                if (!Array.isArray(message.eventTypeUrls))
                    return "eventTypeUrls: array expected";
                for (var i = 0; i < message.eventTypeUrls.length; ++i)
                    if (!$util.isString(message.eventTypeUrls[i]))
                        return "eventTypeUrls: string[] expected";
            }
            if (message.customStatePrefixes != null && message.hasOwnProperty("customStatePrefixes")) {
                if (!Array.isArray(message.customStatePrefixes))
                    return "customStatePrefixes: array expected";
                for (var i = 0; i < message.customStatePrefixes.length; ++i)
                    if (!(message.customStatePrefixes[i] && typeof message.customStatePrefixes[i].length === "number" || $util.isString(message.customStatePrefixes[i])))
                        return "customStatePrefixes: buffer[] expected";
            }
            return null;
        };

        /**
         * Creates a PluginConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginConfig} PluginConfig
         */
        PluginConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginConfig)
                return object;
            var message = new $root.types.PluginConfig();
            if (object.name != null)
                message.name = String(object.name);
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.version != null)
                if ($util.Long)
                    (message.version = $util.Long.fromValue(object.version)).unsigned = true;
                else if (typeof object.version === "string")
                    message.version = parseInt(object.version, 10);
                else if (typeof object.version === "number")
                    message.version = object.version;
                else if (typeof object.version === "object")
                    message.version = new $util.LongBits(object.version.low >>> 0, object.version.high >>> 0).toNumber(true);
            if (object.supportedTransactions) {
                if (!Array.isArray(object.supportedTransactions))
                    throw TypeError(".types.PluginConfig.supportedTransactions: array expected");
                message.supportedTransactions = [];
                for (var i = 0; i < object.supportedTransactions.length; ++i)
                    message.supportedTransactions[i] = String(object.supportedTransactions[i]);
            }
            if (object.fileDescriptorProtos) {
                if (!Array.isArray(object.fileDescriptorProtos))
                    throw TypeError(".types.PluginConfig.fileDescriptorProtos: array expected");
                message.fileDescriptorProtos = [];
                for (var i = 0; i < object.fileDescriptorProtos.length; ++i)
                    if (typeof object.fileDescriptorProtos[i] === "string")
                        $util.base64.decode(object.fileDescriptorProtos[i], message.fileDescriptorProtos[i] = $util.newBuffer($util.base64.length(object.fileDescriptorProtos[i])), 0);
                    else if (object.fileDescriptorProtos[i].length >= 0)
                        message.fileDescriptorProtos[i] = object.fileDescriptorProtos[i];
            }
            if (object.transactionTypeUrls) {
                if (!Array.isArray(object.transactionTypeUrls))
                    throw TypeError(".types.PluginConfig.transactionTypeUrls: array expected");
                message.transactionTypeUrls = [];
                for (var i = 0; i < object.transactionTypeUrls.length; ++i)
                    message.transactionTypeUrls[i] = String(object.transactionTypeUrls[i]);
            }
            if (object.eventTypeUrls) {
                if (!Array.isArray(object.eventTypeUrls))
                    throw TypeError(".types.PluginConfig.eventTypeUrls: array expected");
                message.eventTypeUrls = [];
                for (var i = 0; i < object.eventTypeUrls.length; ++i)
                    message.eventTypeUrls[i] = String(object.eventTypeUrls[i]);
            }
            if (object.customStatePrefixes) {
                if (!Array.isArray(object.customStatePrefixes))
                    throw TypeError(".types.PluginConfig.customStatePrefixes: array expected");
                message.customStatePrefixes = [];
                for (var i = 0; i < object.customStatePrefixes.length; ++i)
                    if (typeof object.customStatePrefixes[i] === "string")
                        $util.base64.decode(object.customStatePrefixes[i], message.customStatePrefixes[i] = $util.newBuffer($util.base64.length(object.customStatePrefixes[i])), 0);
                    else if (object.customStatePrefixes[i].length >= 0)
                        message.customStatePrefixes[i] = object.customStatePrefixes[i];
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginConfig
         * @static
         * @param {types.PluginConfig} message PluginConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginConfig.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.supportedTransactions = [];
                object.fileDescriptorProtos = [];
                object.transactionTypeUrls = [];
                object.eventTypeUrls = [];
                object.customStatePrefixes = [];
            }
            if (options.defaults) {
                object.name = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.version = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.version = options.longs === String ? "0" : 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.version != null && message.hasOwnProperty("version"))
                if (typeof message.version === "number")
                    object.version = options.longs === String ? String(message.version) : message.version;
                else
                    object.version = options.longs === String ? $util.Long.prototype.toString.call(message.version) : options.longs === Number ? new $util.LongBits(message.version.low >>> 0, message.version.high >>> 0).toNumber(true) : message.version;
            if (message.supportedTransactions && message.supportedTransactions.length) {
                object.supportedTransactions = [];
                for (var j = 0; j < message.supportedTransactions.length; ++j)
                    object.supportedTransactions[j] = message.supportedTransactions[j];
            }
            if (message.fileDescriptorProtos && message.fileDescriptorProtos.length) {
                object.fileDescriptorProtos = [];
                for (var j = 0; j < message.fileDescriptorProtos.length; ++j)
                    object.fileDescriptorProtos[j] = options.bytes === String ? $util.base64.encode(message.fileDescriptorProtos[j], 0, message.fileDescriptorProtos[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.fileDescriptorProtos[j]) : message.fileDescriptorProtos[j];
            }
            if (message.transactionTypeUrls && message.transactionTypeUrls.length) {
                object.transactionTypeUrls = [];
                for (var j = 0; j < message.transactionTypeUrls.length; ++j)
                    object.transactionTypeUrls[j] = message.transactionTypeUrls[j];
            }
            if (message.eventTypeUrls && message.eventTypeUrls.length) {
                object.eventTypeUrls = [];
                for (var j = 0; j < message.eventTypeUrls.length; ++j)
                    object.eventTypeUrls[j] = message.eventTypeUrls[j];
            }
            if (message.customStatePrefixes && message.customStatePrefixes.length) {
                object.customStatePrefixes = [];
                for (var j = 0; j < message.customStatePrefixes.length; ++j)
                    object.customStatePrefixes[j] = options.bytes === String ? $util.base64.encode(message.customStatePrefixes[j], 0, message.customStatePrefixes[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.customStatePrefixes[j]) : message.customStatePrefixes[j];
            }
            return object;
        };

        /**
         * Converts this PluginConfig to JSON.
         * @function toJSON
         * @memberof types.PluginConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginConfig
         * @function getTypeUrl
         * @memberof types.PluginConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginConfig";
        };

        return PluginConfig;
    })();

    types.PluginFSMConfig = (function() {

        /**
         * Properties of a PluginFSMConfig.
         * @memberof types
         * @interface IPluginFSMConfig
         * @property {types.IPluginConfig|null} [config] PluginFSMConfig config
         */

        /**
         * Constructs a new PluginFSMConfig.
         * @memberof types
         * @classdesc Represents a PluginFSMConfig.
         * @implements IPluginFSMConfig
         * @constructor
         * @param {types.IPluginFSMConfig=} [properties] Properties to set
         */
        function PluginFSMConfig(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginFSMConfig config.
         * @member {types.IPluginConfig|null|undefined} config
         * @memberof types.PluginFSMConfig
         * @instance
         */
        PluginFSMConfig.prototype.config = null;

        /**
         * Creates a new PluginFSMConfig instance using the specified properties.
         * @function create
         * @memberof types.PluginFSMConfig
         * @static
         * @param {types.IPluginFSMConfig=} [properties] Properties to set
         * @returns {types.PluginFSMConfig} PluginFSMConfig instance
         */
        PluginFSMConfig.create = function create(properties) {
            return new PluginFSMConfig(properties);
        };

        /**
         * Encodes the specified PluginFSMConfig message. Does not implicitly {@link types.PluginFSMConfig.verify|verify} messages.
         * @function encode
         * @memberof types.PluginFSMConfig
         * @static
         * @param {types.IPluginFSMConfig} message PluginFSMConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginFSMConfig.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                $root.types.PluginConfig.encode(message.config, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginFSMConfig message, length delimited. Does not implicitly {@link types.PluginFSMConfig.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginFSMConfig
         * @static
         * @param {types.IPluginFSMConfig} message PluginFSMConfig message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginFSMConfig.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginFSMConfig message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginFSMConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginFSMConfig} PluginFSMConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginFSMConfig.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginFSMConfig();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.config = $root.types.PluginConfig.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginFSMConfig message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginFSMConfig
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginFSMConfig} PluginFSMConfig
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginFSMConfig.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginFSMConfig message.
         * @function verify
         * @memberof types.PluginFSMConfig
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginFSMConfig.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.config != null && message.hasOwnProperty("config")) {
                var error = $root.types.PluginConfig.verify(message.config);
                if (error)
                    return "config." + error;
            }
            return null;
        };

        /**
         * Creates a PluginFSMConfig message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginFSMConfig
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginFSMConfig} PluginFSMConfig
         */
        PluginFSMConfig.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginFSMConfig)
                return object;
            var message = new $root.types.PluginFSMConfig();
            if (object.config != null) {
                if (typeof object.config !== "object")
                    throw TypeError(".types.PluginFSMConfig.config: object expected");
                message.config = $root.types.PluginConfig.fromObject(object.config);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginFSMConfig message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginFSMConfig
         * @static
         * @param {types.PluginFSMConfig} message PluginFSMConfig
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginFSMConfig.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.config = null;
            if (message.config != null && message.hasOwnProperty("config"))
                object.config = $root.types.PluginConfig.toObject(message.config, options);
            return object;
        };

        /**
         * Converts this PluginFSMConfig to JSON.
         * @function toJSON
         * @memberof types.PluginFSMConfig
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginFSMConfig.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginFSMConfig
         * @function getTypeUrl
         * @memberof types.PluginFSMConfig
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginFSMConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginFSMConfig";
        };

        return PluginFSMConfig;
    })();

    types.PluginGenesisRequest = (function() {

        /**
         * Properties of a PluginGenesisRequest.
         * @memberof types
         * @interface IPluginGenesisRequest
         * @property {Uint8Array|null} [genesisJson] PluginGenesisRequest genesisJson
         */

        /**
         * Constructs a new PluginGenesisRequest.
         * @memberof types
         * @classdesc Represents a PluginGenesisRequest.
         * @implements IPluginGenesisRequest
         * @constructor
         * @param {types.IPluginGenesisRequest=} [properties] Properties to set
         */
        function PluginGenesisRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginGenesisRequest genesisJson.
         * @member {Uint8Array} genesisJson
         * @memberof types.PluginGenesisRequest
         * @instance
         */
        PluginGenesisRequest.prototype.genesisJson = $util.newBuffer([]);

        /**
         * Creates a new PluginGenesisRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {types.IPluginGenesisRequest=} [properties] Properties to set
         * @returns {types.PluginGenesisRequest} PluginGenesisRequest instance
         */
        PluginGenesisRequest.create = function create(properties) {
            return new PluginGenesisRequest(properties);
        };

        /**
         * Encodes the specified PluginGenesisRequest message. Does not implicitly {@link types.PluginGenesisRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {types.IPluginGenesisRequest} message PluginGenesisRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginGenesisRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.genesisJson != null && Object.hasOwnProperty.call(message, "genesisJson"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.genesisJson);
            return writer;
        };

        /**
         * Encodes the specified PluginGenesisRequest message, length delimited. Does not implicitly {@link types.PluginGenesisRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {types.IPluginGenesisRequest} message PluginGenesisRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginGenesisRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginGenesisRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginGenesisRequest} PluginGenesisRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginGenesisRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginGenesisRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.genesisJson = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginGenesisRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginGenesisRequest} PluginGenesisRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginGenesisRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginGenesisRequest message.
         * @function verify
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginGenesisRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.genesisJson != null && message.hasOwnProperty("genesisJson"))
                if (!(message.genesisJson && typeof message.genesisJson.length === "number" || $util.isString(message.genesisJson)))
                    return "genesisJson: buffer expected";
            return null;
        };

        /**
         * Creates a PluginGenesisRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginGenesisRequest} PluginGenesisRequest
         */
        PluginGenesisRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginGenesisRequest)
                return object;
            var message = new $root.types.PluginGenesisRequest();
            if (object.genesisJson != null)
                if (typeof object.genesisJson === "string")
                    $util.base64.decode(object.genesisJson, message.genesisJson = $util.newBuffer($util.base64.length(object.genesisJson)), 0);
                else if (object.genesisJson.length >= 0)
                    message.genesisJson = object.genesisJson;
            return message;
        };

        /**
         * Creates a plain object from a PluginGenesisRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {types.PluginGenesisRequest} message PluginGenesisRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginGenesisRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.genesisJson = "";
                else {
                    object.genesisJson = [];
                    if (options.bytes !== Array)
                        object.genesisJson = $util.newBuffer(object.genesisJson);
                }
            if (message.genesisJson != null && message.hasOwnProperty("genesisJson"))
                object.genesisJson = options.bytes === String ? $util.base64.encode(message.genesisJson, 0, message.genesisJson.length) : options.bytes === Array ? Array.prototype.slice.call(message.genesisJson) : message.genesisJson;
            return object;
        };

        /**
         * Converts this PluginGenesisRequest to JSON.
         * @function toJSON
         * @memberof types.PluginGenesisRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginGenesisRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginGenesisRequest
         * @function getTypeUrl
         * @memberof types.PluginGenesisRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginGenesisRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginGenesisRequest";
        };

        return PluginGenesisRequest;
    })();

    types.PluginGenesisResponse = (function() {

        /**
         * Properties of a PluginGenesisResponse.
         * @memberof types
         * @interface IPluginGenesisResponse
         * @property {types.IPluginError|null} [error] PluginGenesisResponse error
         */

        /**
         * Constructs a new PluginGenesisResponse.
         * @memberof types
         * @classdesc Represents a PluginGenesisResponse.
         * @implements IPluginGenesisResponse
         * @constructor
         * @param {types.IPluginGenesisResponse=} [properties] Properties to set
         */
        function PluginGenesisResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginGenesisResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginGenesisResponse
         * @instance
         */
        PluginGenesisResponse.prototype.error = null;

        /**
         * Creates a new PluginGenesisResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {types.IPluginGenesisResponse=} [properties] Properties to set
         * @returns {types.PluginGenesisResponse} PluginGenesisResponse instance
         */
        PluginGenesisResponse.create = function create(properties) {
            return new PluginGenesisResponse(properties);
        };

        /**
         * Encodes the specified PluginGenesisResponse message. Does not implicitly {@link types.PluginGenesisResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {types.IPluginGenesisResponse} message PluginGenesisResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginGenesisResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginGenesisResponse message, length delimited. Does not implicitly {@link types.PluginGenesisResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {types.IPluginGenesisResponse} message PluginGenesisResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginGenesisResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginGenesisResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginGenesisResponse} PluginGenesisResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginGenesisResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginGenesisResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginGenesisResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginGenesisResponse} PluginGenesisResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginGenesisResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginGenesisResponse message.
         * @function verify
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginGenesisResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginGenesisResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginGenesisResponse} PluginGenesisResponse
         */
        PluginGenesisResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginGenesisResponse)
                return object;
            var message = new $root.types.PluginGenesisResponse();
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginGenesisResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginGenesisResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {types.PluginGenesisResponse} message PluginGenesisResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginGenesisResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.error = null;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginGenesisResponse to JSON.
         * @function toJSON
         * @memberof types.PluginGenesisResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginGenesisResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginGenesisResponse
         * @function getTypeUrl
         * @memberof types.PluginGenesisResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginGenesisResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginGenesisResponse";
        };

        return PluginGenesisResponse;
    })();

    types.PluginBeginRequest = (function() {

        /**
         * Properties of a PluginBeginRequest.
         * @memberof types
         * @interface IPluginBeginRequest
         * @property {number|Long|null} [height] PluginBeginRequest height
         */

        /**
         * Constructs a new PluginBeginRequest.
         * @memberof types
         * @classdesc Represents a PluginBeginRequest.
         * @implements IPluginBeginRequest
         * @constructor
         * @param {types.IPluginBeginRequest=} [properties] Properties to set
         */
        function PluginBeginRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginBeginRequest height.
         * @member {number|Long} height
         * @memberof types.PluginBeginRequest
         * @instance
         */
        PluginBeginRequest.prototype.height = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new PluginBeginRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginBeginRequest
         * @static
         * @param {types.IPluginBeginRequest=} [properties] Properties to set
         * @returns {types.PluginBeginRequest} PluginBeginRequest instance
         */
        PluginBeginRequest.create = function create(properties) {
            return new PluginBeginRequest(properties);
        };

        /**
         * Encodes the specified PluginBeginRequest message. Does not implicitly {@link types.PluginBeginRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginBeginRequest
         * @static
         * @param {types.IPluginBeginRequest} message PluginBeginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginBeginRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.height);
            return writer;
        };

        /**
         * Encodes the specified PluginBeginRequest message, length delimited. Does not implicitly {@link types.PluginBeginRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginBeginRequest
         * @static
         * @param {types.IPluginBeginRequest} message PluginBeginRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginBeginRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginBeginRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginBeginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginBeginRequest} PluginBeginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginBeginRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginBeginRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.height = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginBeginRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginBeginRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginBeginRequest} PluginBeginRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginBeginRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginBeginRequest message.
         * @function verify
         * @memberof types.PluginBeginRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginBeginRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height) && !(message.height && $util.isInteger(message.height.low) && $util.isInteger(message.height.high)))
                    return "height: integer|Long expected";
            return null;
        };

        /**
         * Creates a PluginBeginRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginBeginRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginBeginRequest} PluginBeginRequest
         */
        PluginBeginRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginBeginRequest)
                return object;
            var message = new $root.types.PluginBeginRequest();
            if (object.height != null)
                if ($util.Long)
                    (message.height = $util.Long.fromValue(object.height)).unsigned = true;
                else if (typeof object.height === "string")
                    message.height = parseInt(object.height, 10);
                else if (typeof object.height === "number")
                    message.height = object.height;
                else if (typeof object.height === "object")
                    message.height = new $util.LongBits(object.height.low >>> 0, object.height.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a PluginBeginRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginBeginRequest
         * @static
         * @param {types.PluginBeginRequest} message PluginBeginRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginBeginRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.height = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.height = options.longs === String ? "0" : 0;
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height === "number")
                    object.height = options.longs === String ? String(message.height) : message.height;
                else
                    object.height = options.longs === String ? $util.Long.prototype.toString.call(message.height) : options.longs === Number ? new $util.LongBits(message.height.low >>> 0, message.height.high >>> 0).toNumber(true) : message.height;
            return object;
        };

        /**
         * Converts this PluginBeginRequest to JSON.
         * @function toJSON
         * @memberof types.PluginBeginRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginBeginRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginBeginRequest
         * @function getTypeUrl
         * @memberof types.PluginBeginRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginBeginRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginBeginRequest";
        };

        return PluginBeginRequest;
    })();

    types.PluginBeginResponse = (function() {

        /**
         * Properties of a PluginBeginResponse.
         * @memberof types
         * @interface IPluginBeginResponse
         * @property {Array.<types.IEvent>|null} [events] PluginBeginResponse events
         * @property {types.IPluginError|null} [error] PluginBeginResponse error
         */

        /**
         * Constructs a new PluginBeginResponse.
         * @memberof types
         * @classdesc Represents a PluginBeginResponse.
         * @implements IPluginBeginResponse
         * @constructor
         * @param {types.IPluginBeginResponse=} [properties] Properties to set
         */
        function PluginBeginResponse(properties) {
            this.events = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginBeginResponse events.
         * @member {Array.<types.IEvent>} events
         * @memberof types.PluginBeginResponse
         * @instance
         */
        PluginBeginResponse.prototype.events = $util.emptyArray;

        /**
         * PluginBeginResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginBeginResponse
         * @instance
         */
        PluginBeginResponse.prototype.error = null;

        /**
         * Creates a new PluginBeginResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginBeginResponse
         * @static
         * @param {types.IPluginBeginResponse=} [properties] Properties to set
         * @returns {types.PluginBeginResponse} PluginBeginResponse instance
         */
        PluginBeginResponse.create = function create(properties) {
            return new PluginBeginResponse(properties);
        };

        /**
         * Encodes the specified PluginBeginResponse message. Does not implicitly {@link types.PluginBeginResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginBeginResponse
         * @static
         * @param {types.IPluginBeginResponse} message PluginBeginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginBeginResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.events != null && message.events.length)
                for (var i = 0; i < message.events.length; ++i)
                    $root.types.Event.encode(message.events[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginBeginResponse message, length delimited. Does not implicitly {@link types.PluginBeginResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginBeginResponse
         * @static
         * @param {types.IPluginBeginResponse} message PluginBeginResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginBeginResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginBeginResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginBeginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginBeginResponse} PluginBeginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginBeginResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginBeginResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.events && message.events.length))
                            message.events = [];
                        message.events.push($root.types.Event.decode(reader, reader.uint32()));
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginBeginResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginBeginResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginBeginResponse} PluginBeginResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginBeginResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginBeginResponse message.
         * @function verify
         * @memberof types.PluginBeginResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginBeginResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.events != null && message.hasOwnProperty("events")) {
                if (!Array.isArray(message.events))
                    return "events: array expected";
                for (var i = 0; i < message.events.length; ++i) {
                    var error = $root.types.Event.verify(message.events[i]);
                    if (error)
                        return "events." + error;
                }
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginBeginResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginBeginResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginBeginResponse} PluginBeginResponse
         */
        PluginBeginResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginBeginResponse)
                return object;
            var message = new $root.types.PluginBeginResponse();
            if (object.events) {
                if (!Array.isArray(object.events))
                    throw TypeError(".types.PluginBeginResponse.events: array expected");
                message.events = [];
                for (var i = 0; i < object.events.length; ++i) {
                    if (typeof object.events[i] !== "object")
                        throw TypeError(".types.PluginBeginResponse.events: object expected");
                    message.events[i] = $root.types.Event.fromObject(object.events[i]);
                }
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginBeginResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginBeginResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginBeginResponse
         * @static
         * @param {types.PluginBeginResponse} message PluginBeginResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginBeginResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.events = [];
            if (options.defaults)
                object.error = null;
            if (message.events && message.events.length) {
                object.events = [];
                for (var j = 0; j < message.events.length; ++j)
                    object.events[j] = $root.types.Event.toObject(message.events[j], options);
            }
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginBeginResponse to JSON.
         * @function toJSON
         * @memberof types.PluginBeginResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginBeginResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginBeginResponse
         * @function getTypeUrl
         * @memberof types.PluginBeginResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginBeginResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginBeginResponse";
        };

        return PluginBeginResponse;
    })();

    types.PluginCheckRequest = (function() {

        /**
         * Properties of a PluginCheckRequest.
         * @memberof types
         * @interface IPluginCheckRequest
         * @property {types.ITransaction|null} [tx] PluginCheckRequest tx
         */

        /**
         * Constructs a new PluginCheckRequest.
         * @memberof types
         * @classdesc Represents a PluginCheckRequest.
         * @implements IPluginCheckRequest
         * @constructor
         * @param {types.IPluginCheckRequest=} [properties] Properties to set
         */
        function PluginCheckRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginCheckRequest tx.
         * @member {types.ITransaction|null|undefined} tx
         * @memberof types.PluginCheckRequest
         * @instance
         */
        PluginCheckRequest.prototype.tx = null;

        /**
         * Creates a new PluginCheckRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginCheckRequest
         * @static
         * @param {types.IPluginCheckRequest=} [properties] Properties to set
         * @returns {types.PluginCheckRequest} PluginCheckRequest instance
         */
        PluginCheckRequest.create = function create(properties) {
            return new PluginCheckRequest(properties);
        };

        /**
         * Encodes the specified PluginCheckRequest message. Does not implicitly {@link types.PluginCheckRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginCheckRequest
         * @static
         * @param {types.IPluginCheckRequest} message PluginCheckRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginCheckRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tx != null && Object.hasOwnProperty.call(message, "tx"))
                $root.types.Transaction.encode(message.tx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginCheckRequest message, length delimited. Does not implicitly {@link types.PluginCheckRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginCheckRequest
         * @static
         * @param {types.IPluginCheckRequest} message PluginCheckRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginCheckRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginCheckRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginCheckRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginCheckRequest} PluginCheckRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginCheckRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginCheckRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tx = $root.types.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginCheckRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginCheckRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginCheckRequest} PluginCheckRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginCheckRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginCheckRequest message.
         * @function verify
         * @memberof types.PluginCheckRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginCheckRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tx != null && message.hasOwnProperty("tx")) {
                var error = $root.types.Transaction.verify(message.tx);
                if (error)
                    return "tx." + error;
            }
            return null;
        };

        /**
         * Creates a PluginCheckRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginCheckRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginCheckRequest} PluginCheckRequest
         */
        PluginCheckRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginCheckRequest)
                return object;
            var message = new $root.types.PluginCheckRequest();
            if (object.tx != null) {
                if (typeof object.tx !== "object")
                    throw TypeError(".types.PluginCheckRequest.tx: object expected");
                message.tx = $root.types.Transaction.fromObject(object.tx);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginCheckRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginCheckRequest
         * @static
         * @param {types.PluginCheckRequest} message PluginCheckRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginCheckRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.tx = null;
            if (message.tx != null && message.hasOwnProperty("tx"))
                object.tx = $root.types.Transaction.toObject(message.tx, options);
            return object;
        };

        /**
         * Converts this PluginCheckRequest to JSON.
         * @function toJSON
         * @memberof types.PluginCheckRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginCheckRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginCheckRequest
         * @function getTypeUrl
         * @memberof types.PluginCheckRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginCheckRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginCheckRequest";
        };

        return PluginCheckRequest;
    })();

    types.PluginCheckResponse = (function() {

        /**
         * Properties of a PluginCheckResponse.
         * @memberof types
         * @interface IPluginCheckResponse
         * @property {Array.<Uint8Array>|null} [authorizedSigners] PluginCheckResponse authorizedSigners
         * @property {Uint8Array|null} [recipient] PluginCheckResponse recipient
         * @property {types.IPluginError|null} [error] PluginCheckResponse error
         */

        /**
         * Constructs a new PluginCheckResponse.
         * @memberof types
         * @classdesc Represents a PluginCheckResponse.
         * @implements IPluginCheckResponse
         * @constructor
         * @param {types.IPluginCheckResponse=} [properties] Properties to set
         */
        function PluginCheckResponse(properties) {
            this.authorizedSigners = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginCheckResponse authorizedSigners.
         * @member {Array.<Uint8Array>} authorizedSigners
         * @memberof types.PluginCheckResponse
         * @instance
         */
        PluginCheckResponse.prototype.authorizedSigners = $util.emptyArray;

        /**
         * PluginCheckResponse recipient.
         * @member {Uint8Array} recipient
         * @memberof types.PluginCheckResponse
         * @instance
         */
        PluginCheckResponse.prototype.recipient = $util.newBuffer([]);

        /**
         * PluginCheckResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginCheckResponse
         * @instance
         */
        PluginCheckResponse.prototype.error = null;

        /**
         * Creates a new PluginCheckResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginCheckResponse
         * @static
         * @param {types.IPluginCheckResponse=} [properties] Properties to set
         * @returns {types.PluginCheckResponse} PluginCheckResponse instance
         */
        PluginCheckResponse.create = function create(properties) {
            return new PluginCheckResponse(properties);
        };

        /**
         * Encodes the specified PluginCheckResponse message. Does not implicitly {@link types.PluginCheckResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginCheckResponse
         * @static
         * @param {types.IPluginCheckResponse} message PluginCheckResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginCheckResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.authorizedSigners != null && message.authorizedSigners.length)
                for (var i = 0; i < message.authorizedSigners.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.authorizedSigners[i]);
            if (message.recipient != null && Object.hasOwnProperty.call(message, "recipient"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.recipient);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginCheckResponse message, length delimited. Does not implicitly {@link types.PluginCheckResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginCheckResponse
         * @static
         * @param {types.IPluginCheckResponse} message PluginCheckResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginCheckResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginCheckResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginCheckResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginCheckResponse} PluginCheckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginCheckResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginCheckResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.authorizedSigners && message.authorizedSigners.length))
                            message.authorizedSigners = [];
                        message.authorizedSigners.push(reader.bytes());
                        break;
                    }
                case 2: {
                        message.recipient = reader.bytes();
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginCheckResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginCheckResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginCheckResponse} PluginCheckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginCheckResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginCheckResponse message.
         * @function verify
         * @memberof types.PluginCheckResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginCheckResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.authorizedSigners != null && message.hasOwnProperty("authorizedSigners")) {
                if (!Array.isArray(message.authorizedSigners))
                    return "authorizedSigners: array expected";
                for (var i = 0; i < message.authorizedSigners.length; ++i)
                    if (!(message.authorizedSigners[i] && typeof message.authorizedSigners[i].length === "number" || $util.isString(message.authorizedSigners[i])))
                        return "authorizedSigners: buffer[] expected";
            }
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                if (!(message.recipient && typeof message.recipient.length === "number" || $util.isString(message.recipient)))
                    return "recipient: buffer expected";
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginCheckResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginCheckResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginCheckResponse} PluginCheckResponse
         */
        PluginCheckResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginCheckResponse)
                return object;
            var message = new $root.types.PluginCheckResponse();
            if (object.authorizedSigners) {
                if (!Array.isArray(object.authorizedSigners))
                    throw TypeError(".types.PluginCheckResponse.authorizedSigners: array expected");
                message.authorizedSigners = [];
                for (var i = 0; i < object.authorizedSigners.length; ++i)
                    if (typeof object.authorizedSigners[i] === "string")
                        $util.base64.decode(object.authorizedSigners[i], message.authorizedSigners[i] = $util.newBuffer($util.base64.length(object.authorizedSigners[i])), 0);
                    else if (object.authorizedSigners[i].length >= 0)
                        message.authorizedSigners[i] = object.authorizedSigners[i];
            }
            if (object.recipient != null)
                if (typeof object.recipient === "string")
                    $util.base64.decode(object.recipient, message.recipient = $util.newBuffer($util.base64.length(object.recipient)), 0);
                else if (object.recipient.length >= 0)
                    message.recipient = object.recipient;
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginCheckResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginCheckResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginCheckResponse
         * @static
         * @param {types.PluginCheckResponse} message PluginCheckResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginCheckResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.authorizedSigners = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.recipient = "";
                else {
                    object.recipient = [];
                    if (options.bytes !== Array)
                        object.recipient = $util.newBuffer(object.recipient);
                }
                object.error = null;
            }
            if (message.authorizedSigners && message.authorizedSigners.length) {
                object.authorizedSigners = [];
                for (var j = 0; j < message.authorizedSigners.length; ++j)
                    object.authorizedSigners[j] = options.bytes === String ? $util.base64.encode(message.authorizedSigners[j], 0, message.authorizedSigners[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.authorizedSigners[j]) : message.authorizedSigners[j];
            }
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                object.recipient = options.bytes === String ? $util.base64.encode(message.recipient, 0, message.recipient.length) : options.bytes === Array ? Array.prototype.slice.call(message.recipient) : message.recipient;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginCheckResponse to JSON.
         * @function toJSON
         * @memberof types.PluginCheckResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginCheckResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginCheckResponse
         * @function getTypeUrl
         * @memberof types.PluginCheckResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginCheckResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginCheckResponse";
        };

        return PluginCheckResponse;
    })();

    types.PluginDeliverRequest = (function() {

        /**
         * Properties of a PluginDeliverRequest.
         * @memberof types
         * @interface IPluginDeliverRequest
         * @property {types.ITransaction|null} [tx] PluginDeliverRequest tx
         */

        /**
         * Constructs a new PluginDeliverRequest.
         * @memberof types
         * @classdesc Represents a PluginDeliverRequest.
         * @implements IPluginDeliverRequest
         * @constructor
         * @param {types.IPluginDeliverRequest=} [properties] Properties to set
         */
        function PluginDeliverRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginDeliverRequest tx.
         * @member {types.ITransaction|null|undefined} tx
         * @memberof types.PluginDeliverRequest
         * @instance
         */
        PluginDeliverRequest.prototype.tx = null;

        /**
         * Creates a new PluginDeliverRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {types.IPluginDeliverRequest=} [properties] Properties to set
         * @returns {types.PluginDeliverRequest} PluginDeliverRequest instance
         */
        PluginDeliverRequest.create = function create(properties) {
            return new PluginDeliverRequest(properties);
        };

        /**
         * Encodes the specified PluginDeliverRequest message. Does not implicitly {@link types.PluginDeliverRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {types.IPluginDeliverRequest} message PluginDeliverRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginDeliverRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tx != null && Object.hasOwnProperty.call(message, "tx"))
                $root.types.Transaction.encode(message.tx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginDeliverRequest message, length delimited. Does not implicitly {@link types.PluginDeliverRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {types.IPluginDeliverRequest} message PluginDeliverRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginDeliverRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginDeliverRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginDeliverRequest} PluginDeliverRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginDeliverRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginDeliverRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tx = $root.types.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginDeliverRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginDeliverRequest} PluginDeliverRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginDeliverRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginDeliverRequest message.
         * @function verify
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginDeliverRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tx != null && message.hasOwnProperty("tx")) {
                var error = $root.types.Transaction.verify(message.tx);
                if (error)
                    return "tx." + error;
            }
            return null;
        };

        /**
         * Creates a PluginDeliverRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginDeliverRequest} PluginDeliverRequest
         */
        PluginDeliverRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginDeliverRequest)
                return object;
            var message = new $root.types.PluginDeliverRequest();
            if (object.tx != null) {
                if (typeof object.tx !== "object")
                    throw TypeError(".types.PluginDeliverRequest.tx: object expected");
                message.tx = $root.types.Transaction.fromObject(object.tx);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginDeliverRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {types.PluginDeliverRequest} message PluginDeliverRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginDeliverRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.tx = null;
            if (message.tx != null && message.hasOwnProperty("tx"))
                object.tx = $root.types.Transaction.toObject(message.tx, options);
            return object;
        };

        /**
         * Converts this PluginDeliverRequest to JSON.
         * @function toJSON
         * @memberof types.PluginDeliverRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginDeliverRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginDeliverRequest
         * @function getTypeUrl
         * @memberof types.PluginDeliverRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginDeliverRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginDeliverRequest";
        };

        return PluginDeliverRequest;
    })();

    types.PluginDeliverResponse = (function() {

        /**
         * Properties of a PluginDeliverResponse.
         * @memberof types
         * @interface IPluginDeliverResponse
         * @property {Array.<types.IEvent>|null} [events] PluginDeliverResponse events
         * @property {types.IPluginError|null} [error] PluginDeliverResponse error
         */

        /**
         * Constructs a new PluginDeliverResponse.
         * @memberof types
         * @classdesc Represents a PluginDeliverResponse.
         * @implements IPluginDeliverResponse
         * @constructor
         * @param {types.IPluginDeliverResponse=} [properties] Properties to set
         */
        function PluginDeliverResponse(properties) {
            this.events = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginDeliverResponse events.
         * @member {Array.<types.IEvent>} events
         * @memberof types.PluginDeliverResponse
         * @instance
         */
        PluginDeliverResponse.prototype.events = $util.emptyArray;

        /**
         * PluginDeliverResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginDeliverResponse
         * @instance
         */
        PluginDeliverResponse.prototype.error = null;

        /**
         * Creates a new PluginDeliverResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {types.IPluginDeliverResponse=} [properties] Properties to set
         * @returns {types.PluginDeliverResponse} PluginDeliverResponse instance
         */
        PluginDeliverResponse.create = function create(properties) {
            return new PluginDeliverResponse(properties);
        };

        /**
         * Encodes the specified PluginDeliverResponse message. Does not implicitly {@link types.PluginDeliverResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {types.IPluginDeliverResponse} message PluginDeliverResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginDeliverResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.events != null && message.events.length)
                for (var i = 0; i < message.events.length; ++i)
                    $root.types.Event.encode(message.events[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginDeliverResponse message, length delimited. Does not implicitly {@link types.PluginDeliverResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {types.IPluginDeliverResponse} message PluginDeliverResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginDeliverResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginDeliverResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginDeliverResponse} PluginDeliverResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginDeliverResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginDeliverResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.events && message.events.length))
                            message.events = [];
                        message.events.push($root.types.Event.decode(reader, reader.uint32()));
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginDeliverResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginDeliverResponse} PluginDeliverResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginDeliverResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginDeliverResponse message.
         * @function verify
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginDeliverResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.events != null && message.hasOwnProperty("events")) {
                if (!Array.isArray(message.events))
                    return "events: array expected";
                for (var i = 0; i < message.events.length; ++i) {
                    var error = $root.types.Event.verify(message.events[i]);
                    if (error)
                        return "events." + error;
                }
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginDeliverResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginDeliverResponse} PluginDeliverResponse
         */
        PluginDeliverResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginDeliverResponse)
                return object;
            var message = new $root.types.PluginDeliverResponse();
            if (object.events) {
                if (!Array.isArray(object.events))
                    throw TypeError(".types.PluginDeliverResponse.events: array expected");
                message.events = [];
                for (var i = 0; i < object.events.length; ++i) {
                    if (typeof object.events[i] !== "object")
                        throw TypeError(".types.PluginDeliverResponse.events: object expected");
                    message.events[i] = $root.types.Event.fromObject(object.events[i]);
                }
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginDeliverResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginDeliverResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {types.PluginDeliverResponse} message PluginDeliverResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginDeliverResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.events = [];
            if (options.defaults)
                object.error = null;
            if (message.events && message.events.length) {
                object.events = [];
                for (var j = 0; j < message.events.length; ++j)
                    object.events[j] = $root.types.Event.toObject(message.events[j], options);
            }
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginDeliverResponse to JSON.
         * @function toJSON
         * @memberof types.PluginDeliverResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginDeliverResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginDeliverResponse
         * @function getTypeUrl
         * @memberof types.PluginDeliverResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginDeliverResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginDeliverResponse";
        };

        return PluginDeliverResponse;
    })();

    types.PluginEndRequest = (function() {

        /**
         * Properties of a PluginEndRequest.
         * @memberof types
         * @interface IPluginEndRequest
         * @property {number|Long|null} [height] PluginEndRequest height
         * @property {Uint8Array|null} [proposerAddress] PluginEndRequest proposerAddress
         */

        /**
         * Constructs a new PluginEndRequest.
         * @memberof types
         * @classdesc Represents a PluginEndRequest.
         * @implements IPluginEndRequest
         * @constructor
         * @param {types.IPluginEndRequest=} [properties] Properties to set
         */
        function PluginEndRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginEndRequest height.
         * @member {number|Long} height
         * @memberof types.PluginEndRequest
         * @instance
         */
        PluginEndRequest.prototype.height = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginEndRequest proposerAddress.
         * @member {Uint8Array} proposerAddress
         * @memberof types.PluginEndRequest
         * @instance
         */
        PluginEndRequest.prototype.proposerAddress = $util.newBuffer([]);

        /**
         * Creates a new PluginEndRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginEndRequest
         * @static
         * @param {types.IPluginEndRequest=} [properties] Properties to set
         * @returns {types.PluginEndRequest} PluginEndRequest instance
         */
        PluginEndRequest.create = function create(properties) {
            return new PluginEndRequest(properties);
        };

        /**
         * Encodes the specified PluginEndRequest message. Does not implicitly {@link types.PluginEndRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginEndRequest
         * @static
         * @param {types.IPluginEndRequest} message PluginEndRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginEndRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.height);
            if (message.proposerAddress != null && Object.hasOwnProperty.call(message, "proposerAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.proposerAddress);
            return writer;
        };

        /**
         * Encodes the specified PluginEndRequest message, length delimited. Does not implicitly {@link types.PluginEndRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginEndRequest
         * @static
         * @param {types.IPluginEndRequest} message PluginEndRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginEndRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginEndRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginEndRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginEndRequest} PluginEndRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginEndRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginEndRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.height = reader.uint64();
                        break;
                    }
                case 2: {
                        message.proposerAddress = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginEndRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginEndRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginEndRequest} PluginEndRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginEndRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginEndRequest message.
         * @function verify
         * @memberof types.PluginEndRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginEndRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height) && !(message.height && $util.isInteger(message.height.low) && $util.isInteger(message.height.high)))
                    return "height: integer|Long expected";
            if (message.proposerAddress != null && message.hasOwnProperty("proposerAddress"))
                if (!(message.proposerAddress && typeof message.proposerAddress.length === "number" || $util.isString(message.proposerAddress)))
                    return "proposerAddress: buffer expected";
            return null;
        };

        /**
         * Creates a PluginEndRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginEndRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginEndRequest} PluginEndRequest
         */
        PluginEndRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginEndRequest)
                return object;
            var message = new $root.types.PluginEndRequest();
            if (object.height != null)
                if ($util.Long)
                    (message.height = $util.Long.fromValue(object.height)).unsigned = true;
                else if (typeof object.height === "string")
                    message.height = parseInt(object.height, 10);
                else if (typeof object.height === "number")
                    message.height = object.height;
                else if (typeof object.height === "object")
                    message.height = new $util.LongBits(object.height.low >>> 0, object.height.high >>> 0).toNumber(true);
            if (object.proposerAddress != null)
                if (typeof object.proposerAddress === "string")
                    $util.base64.decode(object.proposerAddress, message.proposerAddress = $util.newBuffer($util.base64.length(object.proposerAddress)), 0);
                else if (object.proposerAddress.length >= 0)
                    message.proposerAddress = object.proposerAddress;
            return message;
        };

        /**
         * Creates a plain object from a PluginEndRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginEndRequest
         * @static
         * @param {types.PluginEndRequest} message PluginEndRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginEndRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.height = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.height = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.proposerAddress = "";
                else {
                    object.proposerAddress = [];
                    if (options.bytes !== Array)
                        object.proposerAddress = $util.newBuffer(object.proposerAddress);
                }
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height === "number")
                    object.height = options.longs === String ? String(message.height) : message.height;
                else
                    object.height = options.longs === String ? $util.Long.prototype.toString.call(message.height) : options.longs === Number ? new $util.LongBits(message.height.low >>> 0, message.height.high >>> 0).toNumber(true) : message.height;
            if (message.proposerAddress != null && message.hasOwnProperty("proposerAddress"))
                object.proposerAddress = options.bytes === String ? $util.base64.encode(message.proposerAddress, 0, message.proposerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.proposerAddress) : message.proposerAddress;
            return object;
        };

        /**
         * Converts this PluginEndRequest to JSON.
         * @function toJSON
         * @memberof types.PluginEndRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginEndRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginEndRequest
         * @function getTypeUrl
         * @memberof types.PluginEndRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginEndRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginEndRequest";
        };

        return PluginEndRequest;
    })();

    types.PluginEndResponse = (function() {

        /**
         * Properties of a PluginEndResponse.
         * @memberof types
         * @interface IPluginEndResponse
         * @property {Array.<types.IEvent>|null} [events] PluginEndResponse events
         * @property {types.IPluginError|null} [error] PluginEndResponse error
         */

        /**
         * Constructs a new PluginEndResponse.
         * @memberof types
         * @classdesc Represents a PluginEndResponse.
         * @implements IPluginEndResponse
         * @constructor
         * @param {types.IPluginEndResponse=} [properties] Properties to set
         */
        function PluginEndResponse(properties) {
            this.events = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginEndResponse events.
         * @member {Array.<types.IEvent>} events
         * @memberof types.PluginEndResponse
         * @instance
         */
        PluginEndResponse.prototype.events = $util.emptyArray;

        /**
         * PluginEndResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginEndResponse
         * @instance
         */
        PluginEndResponse.prototype.error = null;

        /**
         * Creates a new PluginEndResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginEndResponse
         * @static
         * @param {types.IPluginEndResponse=} [properties] Properties to set
         * @returns {types.PluginEndResponse} PluginEndResponse instance
         */
        PluginEndResponse.create = function create(properties) {
            return new PluginEndResponse(properties);
        };

        /**
         * Encodes the specified PluginEndResponse message. Does not implicitly {@link types.PluginEndResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginEndResponse
         * @static
         * @param {types.IPluginEndResponse} message PluginEndResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginEndResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.events != null && message.events.length)
                for (var i = 0; i < message.events.length; ++i)
                    $root.types.Event.encode(message.events[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginEndResponse message, length delimited. Does not implicitly {@link types.PluginEndResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginEndResponse
         * @static
         * @param {types.IPluginEndResponse} message PluginEndResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginEndResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginEndResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginEndResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginEndResponse} PluginEndResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginEndResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginEndResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.events && message.events.length))
                            message.events = [];
                        message.events.push($root.types.Event.decode(reader, reader.uint32()));
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginEndResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginEndResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginEndResponse} PluginEndResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginEndResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginEndResponse message.
         * @function verify
         * @memberof types.PluginEndResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginEndResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.events != null && message.hasOwnProperty("events")) {
                if (!Array.isArray(message.events))
                    return "events: array expected";
                for (var i = 0; i < message.events.length; ++i) {
                    var error = $root.types.Event.verify(message.events[i]);
                    if (error)
                        return "events." + error;
                }
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginEndResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginEndResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginEndResponse} PluginEndResponse
         */
        PluginEndResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginEndResponse)
                return object;
            var message = new $root.types.PluginEndResponse();
            if (object.events) {
                if (!Array.isArray(object.events))
                    throw TypeError(".types.PluginEndResponse.events: array expected");
                message.events = [];
                for (var i = 0; i < object.events.length; ++i) {
                    if (typeof object.events[i] !== "object")
                        throw TypeError(".types.PluginEndResponse.events: object expected");
                    message.events[i] = $root.types.Event.fromObject(object.events[i]);
                }
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginEndResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginEndResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginEndResponse
         * @static
         * @param {types.PluginEndResponse} message PluginEndResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginEndResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.events = [];
            if (options.defaults)
                object.error = null;
            if (message.events && message.events.length) {
                object.events = [];
                for (var j = 0; j < message.events.length; ++j)
                    object.events[j] = $root.types.Event.toObject(message.events[j], options);
            }
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginEndResponse to JSON.
         * @function toJSON
         * @memberof types.PluginEndResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginEndResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginEndResponse
         * @function getTypeUrl
         * @memberof types.PluginEndResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginEndResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginEndResponse";
        };

        return PluginEndResponse;
    })();

    types.PluginError = (function() {

        /**
         * Properties of a PluginError.
         * @memberof types
         * @interface IPluginError
         * @property {number|Long|null} [code] PluginError code
         * @property {string|null} [module] PluginError module
         * @property {string|null} [msg] PluginError msg
         */

        /**
         * Constructs a new PluginError.
         * @memberof types
         * @classdesc Represents a PluginError.
         * @implements IPluginError
         * @constructor
         * @param {types.IPluginError=} [properties] Properties to set
         */
        function PluginError(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginError code.
         * @member {number|Long} code
         * @memberof types.PluginError
         * @instance
         */
        PluginError.prototype.code = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginError module.
         * @member {string} module
         * @memberof types.PluginError
         * @instance
         */
        PluginError.prototype.module = "";

        /**
         * PluginError msg.
         * @member {string} msg
         * @memberof types.PluginError
         * @instance
         */
        PluginError.prototype.msg = "";

        /**
         * Creates a new PluginError instance using the specified properties.
         * @function create
         * @memberof types.PluginError
         * @static
         * @param {types.IPluginError=} [properties] Properties to set
         * @returns {types.PluginError} PluginError instance
         */
        PluginError.create = function create(properties) {
            return new PluginError(properties);
        };

        /**
         * Encodes the specified PluginError message. Does not implicitly {@link types.PluginError.verify|verify} messages.
         * @function encode
         * @memberof types.PluginError
         * @static
         * @param {types.IPluginError} message PluginError message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginError.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.code);
            if (message.module != null && Object.hasOwnProperty.call(message, "module"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.module);
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.msg);
            return writer;
        };

        /**
         * Encodes the specified PluginError message, length delimited. Does not implicitly {@link types.PluginError.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginError
         * @static
         * @param {types.IPluginError} message PluginError message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginError.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginError message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginError
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginError} PluginError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginError.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginError();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.code = reader.uint64();
                        break;
                    }
                case 2: {
                        message.module = reader.string();
                        break;
                    }
                case 3: {
                        message.msg = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginError message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginError
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginError} PluginError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginError.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginError message.
         * @function verify
         * @memberof types.PluginError
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginError.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isInteger(message.code) && !(message.code && $util.isInteger(message.code.low) && $util.isInteger(message.code.high)))
                    return "code: integer|Long expected";
            if (message.module != null && message.hasOwnProperty("module"))
                if (!$util.isString(message.module))
                    return "module: string expected";
            if (message.msg != null && message.hasOwnProperty("msg"))
                if (!$util.isString(message.msg))
                    return "msg: string expected";
            return null;
        };

        /**
         * Creates a PluginError message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginError
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginError} PluginError
         */
        PluginError.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginError)
                return object;
            var message = new $root.types.PluginError();
            if (object.code != null)
                if ($util.Long)
                    (message.code = $util.Long.fromValue(object.code)).unsigned = true;
                else if (typeof object.code === "string")
                    message.code = parseInt(object.code, 10);
                else if (typeof object.code === "number")
                    message.code = object.code;
                else if (typeof object.code === "object")
                    message.code = new $util.LongBits(object.code.low >>> 0, object.code.high >>> 0).toNumber(true);
            if (object.module != null)
                message.module = String(object.module);
            if (object.msg != null)
                message.msg = String(object.msg);
            return message;
        };

        /**
         * Creates a plain object from a PluginError message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginError
         * @static
         * @param {types.PluginError} message PluginError
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginError.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.code = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.code = options.longs === String ? "0" : 0;
                object.module = "";
                object.msg = "";
            }
            if (message.code != null && message.hasOwnProperty("code"))
                if (typeof message.code === "number")
                    object.code = options.longs === String ? String(message.code) : message.code;
                else
                    object.code = options.longs === String ? $util.Long.prototype.toString.call(message.code) : options.longs === Number ? new $util.LongBits(message.code.low >>> 0, message.code.high >>> 0).toNumber(true) : message.code;
            if (message.module != null && message.hasOwnProperty("module"))
                object.module = message.module;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = message.msg;
            return object;
        };

        /**
         * Converts this PluginError to JSON.
         * @function toJSON
         * @memberof types.PluginError
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginError.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginError
         * @function getTypeUrl
         * @memberof types.PluginError
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginError.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginError";
        };

        return PluginError;
    })();

    types.PluginQueryRequest = (function() {

        /**
         * Properties of a PluginQueryRequest.
         * @memberof types
         * @interface IPluginQueryRequest
         * @property {number|Long|null} [height] PluginQueryRequest height
         * @property {types.IPluginStateReadRequest|null} [read] PluginQueryRequest read
         */

        /**
         * Constructs a new PluginQueryRequest.
         * @memberof types
         * @classdesc Represents a PluginQueryRequest.
         * @implements IPluginQueryRequest
         * @constructor
         * @param {types.IPluginQueryRequest=} [properties] Properties to set
         */
        function PluginQueryRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginQueryRequest height.
         * @member {number|Long} height
         * @memberof types.PluginQueryRequest
         * @instance
         */
        PluginQueryRequest.prototype.height = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginQueryRequest read.
         * @member {types.IPluginStateReadRequest|null|undefined} read
         * @memberof types.PluginQueryRequest
         * @instance
         */
        PluginQueryRequest.prototype.read = null;

        /**
         * Creates a new PluginQueryRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginQueryRequest
         * @static
         * @param {types.IPluginQueryRequest=} [properties] Properties to set
         * @returns {types.PluginQueryRequest} PluginQueryRequest instance
         */
        PluginQueryRequest.create = function create(properties) {
            return new PluginQueryRequest(properties);
        };

        /**
         * Encodes the specified PluginQueryRequest message. Does not implicitly {@link types.PluginQueryRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginQueryRequest
         * @static
         * @param {types.IPluginQueryRequest} message PluginQueryRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginQueryRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.height);
            if (message.read != null && Object.hasOwnProperty.call(message, "read"))
                $root.types.PluginStateReadRequest.encode(message.read, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginQueryRequest message, length delimited. Does not implicitly {@link types.PluginQueryRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginQueryRequest
         * @static
         * @param {types.IPluginQueryRequest} message PluginQueryRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginQueryRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginQueryRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginQueryRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginQueryRequest} PluginQueryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginQueryRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginQueryRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.height = reader.uint64();
                        break;
                    }
                case 2: {
                        message.read = $root.types.PluginStateReadRequest.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginQueryRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginQueryRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginQueryRequest} PluginQueryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginQueryRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginQueryRequest message.
         * @function verify
         * @memberof types.PluginQueryRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginQueryRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height) && !(message.height && $util.isInteger(message.height.low) && $util.isInteger(message.height.high)))
                    return "height: integer|Long expected";
            if (message.read != null && message.hasOwnProperty("read")) {
                var error = $root.types.PluginStateReadRequest.verify(message.read);
                if (error)
                    return "read." + error;
            }
            return null;
        };

        /**
         * Creates a PluginQueryRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginQueryRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginQueryRequest} PluginQueryRequest
         */
        PluginQueryRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginQueryRequest)
                return object;
            var message = new $root.types.PluginQueryRequest();
            if (object.height != null)
                if ($util.Long)
                    (message.height = $util.Long.fromValue(object.height)).unsigned = true;
                else if (typeof object.height === "string")
                    message.height = parseInt(object.height, 10);
                else if (typeof object.height === "number")
                    message.height = object.height;
                else if (typeof object.height === "object")
                    message.height = new $util.LongBits(object.height.low >>> 0, object.height.high >>> 0).toNumber(true);
            if (object.read != null) {
                if (typeof object.read !== "object")
                    throw TypeError(".types.PluginQueryRequest.read: object expected");
                message.read = $root.types.PluginStateReadRequest.fromObject(object.read);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginQueryRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginQueryRequest
         * @static
         * @param {types.PluginQueryRequest} message PluginQueryRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginQueryRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.height = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.height = options.longs === String ? "0" : 0;
                object.read = null;
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height === "number")
                    object.height = options.longs === String ? String(message.height) : message.height;
                else
                    object.height = options.longs === String ? $util.Long.prototype.toString.call(message.height) : options.longs === Number ? new $util.LongBits(message.height.low >>> 0, message.height.high >>> 0).toNumber(true) : message.height;
            if (message.read != null && message.hasOwnProperty("read"))
                object.read = $root.types.PluginStateReadRequest.toObject(message.read, options);
            return object;
        };

        /**
         * Converts this PluginQueryRequest to JSON.
         * @function toJSON
         * @memberof types.PluginQueryRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginQueryRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginQueryRequest
         * @function getTypeUrl
         * @memberof types.PluginQueryRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginQueryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginQueryRequest";
        };

        return PluginQueryRequest;
    })();

    types.PluginQueryResponse = (function() {

        /**
         * Properties of a PluginQueryResponse.
         * @memberof types
         * @interface IPluginQueryResponse
         * @property {types.IPluginStateReadResponse|null} [read] PluginQueryResponse read
         * @property {types.IPluginError|null} [error] PluginQueryResponse error
         */

        /**
         * Constructs a new PluginQueryResponse.
         * @memberof types
         * @classdesc Represents a PluginQueryResponse.
         * @implements IPluginQueryResponse
         * @constructor
         * @param {types.IPluginQueryResponse=} [properties] Properties to set
         */
        function PluginQueryResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginQueryResponse read.
         * @member {types.IPluginStateReadResponse|null|undefined} read
         * @memberof types.PluginQueryResponse
         * @instance
         */
        PluginQueryResponse.prototype.read = null;

        /**
         * PluginQueryResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginQueryResponse
         * @instance
         */
        PluginQueryResponse.prototype.error = null;

        /**
         * Creates a new PluginQueryResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginQueryResponse
         * @static
         * @param {types.IPluginQueryResponse=} [properties] Properties to set
         * @returns {types.PluginQueryResponse} PluginQueryResponse instance
         */
        PluginQueryResponse.create = function create(properties) {
            return new PluginQueryResponse(properties);
        };

        /**
         * Encodes the specified PluginQueryResponse message. Does not implicitly {@link types.PluginQueryResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginQueryResponse
         * @static
         * @param {types.IPluginQueryResponse} message PluginQueryResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginQueryResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.read != null && Object.hasOwnProperty.call(message, "read"))
                $root.types.PluginStateReadResponse.encode(message.read, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginQueryResponse message, length delimited. Does not implicitly {@link types.PluginQueryResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginQueryResponse
         * @static
         * @param {types.IPluginQueryResponse} message PluginQueryResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginQueryResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginQueryResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginQueryResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginQueryResponse} PluginQueryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginQueryResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginQueryResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.read = $root.types.PluginStateReadResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginQueryResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginQueryResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginQueryResponse} PluginQueryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginQueryResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginQueryResponse message.
         * @function verify
         * @memberof types.PluginQueryResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginQueryResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.read != null && message.hasOwnProperty("read")) {
                var error = $root.types.PluginStateReadResponse.verify(message.read);
                if (error)
                    return "read." + error;
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginQueryResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginQueryResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginQueryResponse} PluginQueryResponse
         */
        PluginQueryResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginQueryResponse)
                return object;
            var message = new $root.types.PluginQueryResponse();
            if (object.read != null) {
                if (typeof object.read !== "object")
                    throw TypeError(".types.PluginQueryResponse.read: object expected");
                message.read = $root.types.PluginStateReadResponse.fromObject(object.read);
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginQueryResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginQueryResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginQueryResponse
         * @static
         * @param {types.PluginQueryResponse} message PluginQueryResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginQueryResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.read = null;
                object.error = null;
            }
            if (message.read != null && message.hasOwnProperty("read"))
                object.read = $root.types.PluginStateReadResponse.toObject(message.read, options);
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginQueryResponse to JSON.
         * @function toJSON
         * @memberof types.PluginQueryResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginQueryResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginQueryResponse
         * @function getTypeUrl
         * @memberof types.PluginQueryResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginQueryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginQueryResponse";
        };

        return PluginQueryResponse;
    })();

    types.PluginStateReadRequest = (function() {

        /**
         * Properties of a PluginStateReadRequest.
         * @memberof types
         * @interface IPluginStateReadRequest
         * @property {Array.<types.IPluginKeyRead>|null} [keys] PluginStateReadRequest keys
         * @property {Array.<types.IPluginRangeRead>|null} [ranges] PluginStateReadRequest ranges
         */

        /**
         * Constructs a new PluginStateReadRequest.
         * @memberof types
         * @classdesc Represents a PluginStateReadRequest.
         * @implements IPluginStateReadRequest
         * @constructor
         * @param {types.IPluginStateReadRequest=} [properties] Properties to set
         */
        function PluginStateReadRequest(properties) {
            this.keys = [];
            this.ranges = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginStateReadRequest keys.
         * @member {Array.<types.IPluginKeyRead>} keys
         * @memberof types.PluginStateReadRequest
         * @instance
         */
        PluginStateReadRequest.prototype.keys = $util.emptyArray;

        /**
         * PluginStateReadRequest ranges.
         * @member {Array.<types.IPluginRangeRead>} ranges
         * @memberof types.PluginStateReadRequest
         * @instance
         */
        PluginStateReadRequest.prototype.ranges = $util.emptyArray;

        /**
         * Creates a new PluginStateReadRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {types.IPluginStateReadRequest=} [properties] Properties to set
         * @returns {types.PluginStateReadRequest} PluginStateReadRequest instance
         */
        PluginStateReadRequest.create = function create(properties) {
            return new PluginStateReadRequest(properties);
        };

        /**
         * Encodes the specified PluginStateReadRequest message. Does not implicitly {@link types.PluginStateReadRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {types.IPluginStateReadRequest} message PluginStateReadRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateReadRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.keys != null && message.keys.length)
                for (var i = 0; i < message.keys.length; ++i)
                    $root.types.PluginKeyRead.encode(message.keys[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.ranges != null && message.ranges.length)
                for (var i = 0; i < message.ranges.length; ++i)
                    $root.types.PluginRangeRead.encode(message.ranges[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginStateReadRequest message, length delimited. Does not implicitly {@link types.PluginStateReadRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {types.IPluginStateReadRequest} message PluginStateReadRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateReadRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginStateReadRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginStateReadRequest} PluginStateReadRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateReadRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginStateReadRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.keys && message.keys.length))
                            message.keys = [];
                        message.keys.push($root.types.PluginKeyRead.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        if (!(message.ranges && message.ranges.length))
                            message.ranges = [];
                        message.ranges.push($root.types.PluginRangeRead.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginStateReadRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginStateReadRequest} PluginStateReadRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateReadRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginStateReadRequest message.
         * @function verify
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginStateReadRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.keys != null && message.hasOwnProperty("keys")) {
                if (!Array.isArray(message.keys))
                    return "keys: array expected";
                for (var i = 0; i < message.keys.length; ++i) {
                    var error = $root.types.PluginKeyRead.verify(message.keys[i]);
                    if (error)
                        return "keys." + error;
                }
            }
            if (message.ranges != null && message.hasOwnProperty("ranges")) {
                if (!Array.isArray(message.ranges))
                    return "ranges: array expected";
                for (var i = 0; i < message.ranges.length; ++i) {
                    var error = $root.types.PluginRangeRead.verify(message.ranges[i]);
                    if (error)
                        return "ranges." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PluginStateReadRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginStateReadRequest} PluginStateReadRequest
         */
        PluginStateReadRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginStateReadRequest)
                return object;
            var message = new $root.types.PluginStateReadRequest();
            if (object.keys) {
                if (!Array.isArray(object.keys))
                    throw TypeError(".types.PluginStateReadRequest.keys: array expected");
                message.keys = [];
                for (var i = 0; i < object.keys.length; ++i) {
                    if (typeof object.keys[i] !== "object")
                        throw TypeError(".types.PluginStateReadRequest.keys: object expected");
                    message.keys[i] = $root.types.PluginKeyRead.fromObject(object.keys[i]);
                }
            }
            if (object.ranges) {
                if (!Array.isArray(object.ranges))
                    throw TypeError(".types.PluginStateReadRequest.ranges: array expected");
                message.ranges = [];
                for (var i = 0; i < object.ranges.length; ++i) {
                    if (typeof object.ranges[i] !== "object")
                        throw TypeError(".types.PluginStateReadRequest.ranges: object expected");
                    message.ranges[i] = $root.types.PluginRangeRead.fromObject(object.ranges[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginStateReadRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {types.PluginStateReadRequest} message PluginStateReadRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginStateReadRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.keys = [];
                object.ranges = [];
            }
            if (message.keys && message.keys.length) {
                object.keys = [];
                for (var j = 0; j < message.keys.length; ++j)
                    object.keys[j] = $root.types.PluginKeyRead.toObject(message.keys[j], options);
            }
            if (message.ranges && message.ranges.length) {
                object.ranges = [];
                for (var j = 0; j < message.ranges.length; ++j)
                    object.ranges[j] = $root.types.PluginRangeRead.toObject(message.ranges[j], options);
            }
            return object;
        };

        /**
         * Converts this PluginStateReadRequest to JSON.
         * @function toJSON
         * @memberof types.PluginStateReadRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginStateReadRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginStateReadRequest
         * @function getTypeUrl
         * @memberof types.PluginStateReadRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginStateReadRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginStateReadRequest";
        };

        return PluginStateReadRequest;
    })();

    types.PluginKeyRead = (function() {

        /**
         * Properties of a PluginKeyRead.
         * @memberof types
         * @interface IPluginKeyRead
         * @property {number|Long|null} [queryId] PluginKeyRead queryId
         * @property {Uint8Array|null} [key] PluginKeyRead key
         */

        /**
         * Constructs a new PluginKeyRead.
         * @memberof types
         * @classdesc Represents a PluginKeyRead.
         * @implements IPluginKeyRead
         * @constructor
         * @param {types.IPluginKeyRead=} [properties] Properties to set
         */
        function PluginKeyRead(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginKeyRead queryId.
         * @member {number|Long} queryId
         * @memberof types.PluginKeyRead
         * @instance
         */
        PluginKeyRead.prototype.queryId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginKeyRead key.
         * @member {Uint8Array} key
         * @memberof types.PluginKeyRead
         * @instance
         */
        PluginKeyRead.prototype.key = $util.newBuffer([]);

        /**
         * Creates a new PluginKeyRead instance using the specified properties.
         * @function create
         * @memberof types.PluginKeyRead
         * @static
         * @param {types.IPluginKeyRead=} [properties] Properties to set
         * @returns {types.PluginKeyRead} PluginKeyRead instance
         */
        PluginKeyRead.create = function create(properties) {
            return new PluginKeyRead(properties);
        };

        /**
         * Encodes the specified PluginKeyRead message. Does not implicitly {@link types.PluginKeyRead.verify|verify} messages.
         * @function encode
         * @memberof types.PluginKeyRead
         * @static
         * @param {types.IPluginKeyRead} message PluginKeyRead message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginKeyRead.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && Object.hasOwnProperty.call(message, "queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.queryId);
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.key);
            return writer;
        };

        /**
         * Encodes the specified PluginKeyRead message, length delimited. Does not implicitly {@link types.PluginKeyRead.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginKeyRead
         * @static
         * @param {types.IPluginKeyRead} message PluginKeyRead message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginKeyRead.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginKeyRead message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginKeyRead
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginKeyRead} PluginKeyRead
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginKeyRead.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginKeyRead();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.queryId = reader.uint64();
                        break;
                    }
                case 2: {
                        message.key = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginKeyRead message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginKeyRead
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginKeyRead} PluginKeyRead
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginKeyRead.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginKeyRead message.
         * @function verify
         * @memberof types.PluginKeyRead
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginKeyRead.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId) && !(message.queryId && $util.isInteger(message.queryId.low) && $util.isInteger(message.queryId.high)))
                    return "queryId: integer|Long expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                    return "key: buffer expected";
            return null;
        };

        /**
         * Creates a PluginKeyRead message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginKeyRead
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginKeyRead} PluginKeyRead
         */
        PluginKeyRead.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginKeyRead)
                return object;
            var message = new $root.types.PluginKeyRead();
            if (object.queryId != null)
                if ($util.Long)
                    (message.queryId = $util.Long.fromValue(object.queryId)).unsigned = true;
                else if (typeof object.queryId === "string")
                    message.queryId = parseInt(object.queryId, 10);
                else if (typeof object.queryId === "number")
                    message.queryId = object.queryId;
                else if (typeof object.queryId === "object")
                    message.queryId = new $util.LongBits(object.queryId.low >>> 0, object.queryId.high >>> 0).toNumber(true);
            if (object.key != null)
                if (typeof object.key === "string")
                    $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                else if (object.key.length >= 0)
                    message.key = object.key;
            return message;
        };

        /**
         * Creates a plain object from a PluginKeyRead message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginKeyRead
         * @static
         * @param {types.PluginKeyRead} message PluginKeyRead
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginKeyRead.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.queryId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.queryId = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.key = "";
                else {
                    object.key = [];
                    if (options.bytes !== Array)
                        object.key = $util.newBuffer(object.key);
                }
            }
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (typeof message.queryId === "number")
                    object.queryId = options.longs === String ? String(message.queryId) : message.queryId;
                else
                    object.queryId = options.longs === String ? $util.Long.prototype.toString.call(message.queryId) : options.longs === Number ? new $util.LongBits(message.queryId.low >>> 0, message.queryId.high >>> 0).toNumber(true) : message.queryId;
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = options.bytes === String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === Array ? Array.prototype.slice.call(message.key) : message.key;
            return object;
        };

        /**
         * Converts this PluginKeyRead to JSON.
         * @function toJSON
         * @memberof types.PluginKeyRead
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginKeyRead.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginKeyRead
         * @function getTypeUrl
         * @memberof types.PluginKeyRead
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginKeyRead.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginKeyRead";
        };

        return PluginKeyRead;
    })();

    types.PluginRangeRead = (function() {

        /**
         * Properties of a PluginRangeRead.
         * @memberof types
         * @interface IPluginRangeRead
         * @property {number|Long|null} [queryId] PluginRangeRead queryId
         * @property {Uint8Array|null} [prefix] PluginRangeRead prefix
         * @property {number|Long|null} [limit] PluginRangeRead limit
         * @property {boolean|null} [reverse] PluginRangeRead reverse
         */

        /**
         * Constructs a new PluginRangeRead.
         * @memberof types
         * @classdesc Represents a PluginRangeRead.
         * @implements IPluginRangeRead
         * @constructor
         * @param {types.IPluginRangeRead=} [properties] Properties to set
         */
        function PluginRangeRead(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginRangeRead queryId.
         * @member {number|Long} queryId
         * @memberof types.PluginRangeRead
         * @instance
         */
        PluginRangeRead.prototype.queryId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginRangeRead prefix.
         * @member {Uint8Array} prefix
         * @memberof types.PluginRangeRead
         * @instance
         */
        PluginRangeRead.prototype.prefix = $util.newBuffer([]);

        /**
         * PluginRangeRead limit.
         * @member {number|Long} limit
         * @memberof types.PluginRangeRead
         * @instance
         */
        PluginRangeRead.prototype.limit = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginRangeRead reverse.
         * @member {boolean} reverse
         * @memberof types.PluginRangeRead
         * @instance
         */
        PluginRangeRead.prototype.reverse = false;

        /**
         * Creates a new PluginRangeRead instance using the specified properties.
         * @function create
         * @memberof types.PluginRangeRead
         * @static
         * @param {types.IPluginRangeRead=} [properties] Properties to set
         * @returns {types.PluginRangeRead} PluginRangeRead instance
         */
        PluginRangeRead.create = function create(properties) {
            return new PluginRangeRead(properties);
        };

        /**
         * Encodes the specified PluginRangeRead message. Does not implicitly {@link types.PluginRangeRead.verify|verify} messages.
         * @function encode
         * @memberof types.PluginRangeRead
         * @static
         * @param {types.IPluginRangeRead} message PluginRangeRead message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginRangeRead.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && Object.hasOwnProperty.call(message, "queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.queryId);
            if (message.prefix != null && Object.hasOwnProperty.call(message, "prefix"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.prefix);
            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.limit);
            if (message.reverse != null && Object.hasOwnProperty.call(message, "reverse"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.reverse);
            return writer;
        };

        /**
         * Encodes the specified PluginRangeRead message, length delimited. Does not implicitly {@link types.PluginRangeRead.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginRangeRead
         * @static
         * @param {types.IPluginRangeRead} message PluginRangeRead message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginRangeRead.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginRangeRead message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginRangeRead
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginRangeRead} PluginRangeRead
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginRangeRead.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginRangeRead();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.queryId = reader.uint64();
                        break;
                    }
                case 2: {
                        message.prefix = reader.bytes();
                        break;
                    }
                case 3: {
                        message.limit = reader.uint64();
                        break;
                    }
                case 4: {
                        message.reverse = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginRangeRead message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginRangeRead
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginRangeRead} PluginRangeRead
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginRangeRead.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginRangeRead message.
         * @function verify
         * @memberof types.PluginRangeRead
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginRangeRead.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId) && !(message.queryId && $util.isInteger(message.queryId.low) && $util.isInteger(message.queryId.high)))
                    return "queryId: integer|Long expected";
            if (message.prefix != null && message.hasOwnProperty("prefix"))
                if (!(message.prefix && typeof message.prefix.length === "number" || $util.isString(message.prefix)))
                    return "prefix: buffer expected";
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (!$util.isInteger(message.limit) && !(message.limit && $util.isInteger(message.limit.low) && $util.isInteger(message.limit.high)))
                    return "limit: integer|Long expected";
            if (message.reverse != null && message.hasOwnProperty("reverse"))
                if (typeof message.reverse !== "boolean")
                    return "reverse: boolean expected";
            return null;
        };

        /**
         * Creates a PluginRangeRead message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginRangeRead
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginRangeRead} PluginRangeRead
         */
        PluginRangeRead.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginRangeRead)
                return object;
            var message = new $root.types.PluginRangeRead();
            if (object.queryId != null)
                if ($util.Long)
                    (message.queryId = $util.Long.fromValue(object.queryId)).unsigned = true;
                else if (typeof object.queryId === "string")
                    message.queryId = parseInt(object.queryId, 10);
                else if (typeof object.queryId === "number")
                    message.queryId = object.queryId;
                else if (typeof object.queryId === "object")
                    message.queryId = new $util.LongBits(object.queryId.low >>> 0, object.queryId.high >>> 0).toNumber(true);
            if (object.prefix != null)
                if (typeof object.prefix === "string")
                    $util.base64.decode(object.prefix, message.prefix = $util.newBuffer($util.base64.length(object.prefix)), 0);
                else if (object.prefix.length >= 0)
                    message.prefix = object.prefix;
            if (object.limit != null)
                if ($util.Long)
                    (message.limit = $util.Long.fromValue(object.limit)).unsigned = true;
                else if (typeof object.limit === "string")
                    message.limit = parseInt(object.limit, 10);
                else if (typeof object.limit === "number")
                    message.limit = object.limit;
                else if (typeof object.limit === "object")
                    message.limit = new $util.LongBits(object.limit.low >>> 0, object.limit.high >>> 0).toNumber(true);
            if (object.reverse != null)
                message.reverse = Boolean(object.reverse);
            return message;
        };

        /**
         * Creates a plain object from a PluginRangeRead message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginRangeRead
         * @static
         * @param {types.PluginRangeRead} message PluginRangeRead
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginRangeRead.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.queryId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.queryId = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.prefix = "";
                else {
                    object.prefix = [];
                    if (options.bytes !== Array)
                        object.prefix = $util.newBuffer(object.prefix);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.limit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.limit = options.longs === String ? "0" : 0;
                object.reverse = false;
            }
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (typeof message.queryId === "number")
                    object.queryId = options.longs === String ? String(message.queryId) : message.queryId;
                else
                    object.queryId = options.longs === String ? $util.Long.prototype.toString.call(message.queryId) : options.longs === Number ? new $util.LongBits(message.queryId.low >>> 0, message.queryId.high >>> 0).toNumber(true) : message.queryId;
            if (message.prefix != null && message.hasOwnProperty("prefix"))
                object.prefix = options.bytes === String ? $util.base64.encode(message.prefix, 0, message.prefix.length) : options.bytes === Array ? Array.prototype.slice.call(message.prefix) : message.prefix;
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (typeof message.limit === "number")
                    object.limit = options.longs === String ? String(message.limit) : message.limit;
                else
                    object.limit = options.longs === String ? $util.Long.prototype.toString.call(message.limit) : options.longs === Number ? new $util.LongBits(message.limit.low >>> 0, message.limit.high >>> 0).toNumber(true) : message.limit;
            if (message.reverse != null && message.hasOwnProperty("reverse"))
                object.reverse = message.reverse;
            return object;
        };

        /**
         * Converts this PluginRangeRead to JSON.
         * @function toJSON
         * @memberof types.PluginRangeRead
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginRangeRead.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginRangeRead
         * @function getTypeUrl
         * @memberof types.PluginRangeRead
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginRangeRead.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginRangeRead";
        };

        return PluginRangeRead;
    })();

    types.PluginStateReadResponse = (function() {

        /**
         * Properties of a PluginStateReadResponse.
         * @memberof types
         * @interface IPluginStateReadResponse
         * @property {Array.<types.IPluginReadResult>|null} [results] PluginStateReadResponse results
         * @property {types.IPluginError|null} [error] PluginStateReadResponse error
         */

        /**
         * Constructs a new PluginStateReadResponse.
         * @memberof types
         * @classdesc Represents a PluginStateReadResponse.
         * @implements IPluginStateReadResponse
         * @constructor
         * @param {types.IPluginStateReadResponse=} [properties] Properties to set
         */
        function PluginStateReadResponse(properties) {
            this.results = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginStateReadResponse results.
         * @member {Array.<types.IPluginReadResult>} results
         * @memberof types.PluginStateReadResponse
         * @instance
         */
        PluginStateReadResponse.prototype.results = $util.emptyArray;

        /**
         * PluginStateReadResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginStateReadResponse
         * @instance
         */
        PluginStateReadResponse.prototype.error = null;

        /**
         * Creates a new PluginStateReadResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {types.IPluginStateReadResponse=} [properties] Properties to set
         * @returns {types.PluginStateReadResponse} PluginStateReadResponse instance
         */
        PluginStateReadResponse.create = function create(properties) {
            return new PluginStateReadResponse(properties);
        };

        /**
         * Encodes the specified PluginStateReadResponse message. Does not implicitly {@link types.PluginStateReadResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {types.IPluginStateReadResponse} message PluginStateReadResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateReadResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.results != null && message.results.length)
                for (var i = 0; i < message.results.length; ++i)
                    $root.types.PluginReadResult.encode(message.results[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginStateReadResponse message, length delimited. Does not implicitly {@link types.PluginStateReadResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {types.IPluginStateReadResponse} message PluginStateReadResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateReadResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginStateReadResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginStateReadResponse} PluginStateReadResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateReadResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginStateReadResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.results && message.results.length))
                            message.results = [];
                        message.results.push($root.types.PluginReadResult.decode(reader, reader.uint32()));
                        break;
                    }
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginStateReadResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginStateReadResponse} PluginStateReadResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateReadResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginStateReadResponse message.
         * @function verify
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginStateReadResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.results != null && message.hasOwnProperty("results")) {
                if (!Array.isArray(message.results))
                    return "results: array expected";
                for (var i = 0; i < message.results.length; ++i) {
                    var error = $root.types.PluginReadResult.verify(message.results[i]);
                    if (error)
                        return "results." + error;
                }
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginStateReadResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginStateReadResponse} PluginStateReadResponse
         */
        PluginStateReadResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginStateReadResponse)
                return object;
            var message = new $root.types.PluginStateReadResponse();
            if (object.results) {
                if (!Array.isArray(object.results))
                    throw TypeError(".types.PluginStateReadResponse.results: array expected");
                message.results = [];
                for (var i = 0; i < object.results.length; ++i) {
                    if (typeof object.results[i] !== "object")
                        throw TypeError(".types.PluginStateReadResponse.results: object expected");
                    message.results[i] = $root.types.PluginReadResult.fromObject(object.results[i]);
                }
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginStateReadResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginStateReadResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {types.PluginStateReadResponse} message PluginStateReadResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginStateReadResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.results = [];
            if (options.defaults)
                object.error = null;
            if (message.results && message.results.length) {
                object.results = [];
                for (var j = 0; j < message.results.length; ++j)
                    object.results[j] = $root.types.PluginReadResult.toObject(message.results[j], options);
            }
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginStateReadResponse to JSON.
         * @function toJSON
         * @memberof types.PluginStateReadResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginStateReadResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginStateReadResponse
         * @function getTypeUrl
         * @memberof types.PluginStateReadResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginStateReadResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginStateReadResponse";
        };

        return PluginStateReadResponse;
    })();

    types.PluginReadResult = (function() {

        /**
         * Properties of a PluginReadResult.
         * @memberof types
         * @interface IPluginReadResult
         * @property {number|Long|null} [queryId] PluginReadResult queryId
         * @property {Array.<types.IPluginStateEntry>|null} [entries] PluginReadResult entries
         */

        /**
         * Constructs a new PluginReadResult.
         * @memberof types
         * @classdesc Represents a PluginReadResult.
         * @implements IPluginReadResult
         * @constructor
         * @param {types.IPluginReadResult=} [properties] Properties to set
         */
        function PluginReadResult(properties) {
            this.entries = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginReadResult queryId.
         * @member {number|Long} queryId
         * @memberof types.PluginReadResult
         * @instance
         */
        PluginReadResult.prototype.queryId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * PluginReadResult entries.
         * @member {Array.<types.IPluginStateEntry>} entries
         * @memberof types.PluginReadResult
         * @instance
         */
        PluginReadResult.prototype.entries = $util.emptyArray;

        /**
         * Creates a new PluginReadResult instance using the specified properties.
         * @function create
         * @memberof types.PluginReadResult
         * @static
         * @param {types.IPluginReadResult=} [properties] Properties to set
         * @returns {types.PluginReadResult} PluginReadResult instance
         */
        PluginReadResult.create = function create(properties) {
            return new PluginReadResult(properties);
        };

        /**
         * Encodes the specified PluginReadResult message. Does not implicitly {@link types.PluginReadResult.verify|verify} messages.
         * @function encode
         * @memberof types.PluginReadResult
         * @static
         * @param {types.IPluginReadResult} message PluginReadResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginReadResult.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.queryId != null && Object.hasOwnProperty.call(message, "queryId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.queryId);
            if (message.entries != null && message.entries.length)
                for (var i = 0; i < message.entries.length; ++i)
                    $root.types.PluginStateEntry.encode(message.entries[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginReadResult message, length delimited. Does not implicitly {@link types.PluginReadResult.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginReadResult
         * @static
         * @param {types.IPluginReadResult} message PluginReadResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginReadResult.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginReadResult message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginReadResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginReadResult} PluginReadResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginReadResult.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginReadResult();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.queryId = reader.uint64();
                        break;
                    }
                case 2: {
                        if (!(message.entries && message.entries.length))
                            message.entries = [];
                        message.entries.push($root.types.PluginStateEntry.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginReadResult message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginReadResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginReadResult} PluginReadResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginReadResult.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginReadResult message.
         * @function verify
         * @memberof types.PluginReadResult
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginReadResult.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (!$util.isInteger(message.queryId) && !(message.queryId && $util.isInteger(message.queryId.low) && $util.isInteger(message.queryId.high)))
                    return "queryId: integer|Long expected";
            if (message.entries != null && message.hasOwnProperty("entries")) {
                if (!Array.isArray(message.entries))
                    return "entries: array expected";
                for (var i = 0; i < message.entries.length; ++i) {
                    var error = $root.types.PluginStateEntry.verify(message.entries[i]);
                    if (error)
                        return "entries." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PluginReadResult message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginReadResult
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginReadResult} PluginReadResult
         */
        PluginReadResult.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginReadResult)
                return object;
            var message = new $root.types.PluginReadResult();
            if (object.queryId != null)
                if ($util.Long)
                    (message.queryId = $util.Long.fromValue(object.queryId)).unsigned = true;
                else if (typeof object.queryId === "string")
                    message.queryId = parseInt(object.queryId, 10);
                else if (typeof object.queryId === "number")
                    message.queryId = object.queryId;
                else if (typeof object.queryId === "object")
                    message.queryId = new $util.LongBits(object.queryId.low >>> 0, object.queryId.high >>> 0).toNumber(true);
            if (object.entries) {
                if (!Array.isArray(object.entries))
                    throw TypeError(".types.PluginReadResult.entries: array expected");
                message.entries = [];
                for (var i = 0; i < object.entries.length; ++i) {
                    if (typeof object.entries[i] !== "object")
                        throw TypeError(".types.PluginReadResult.entries: object expected");
                    message.entries[i] = $root.types.PluginStateEntry.fromObject(object.entries[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginReadResult message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginReadResult
         * @static
         * @param {types.PluginReadResult} message PluginReadResult
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginReadResult.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.entries = [];
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.queryId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.queryId = options.longs === String ? "0" : 0;
            if (message.queryId != null && message.hasOwnProperty("queryId"))
                if (typeof message.queryId === "number")
                    object.queryId = options.longs === String ? String(message.queryId) : message.queryId;
                else
                    object.queryId = options.longs === String ? $util.Long.prototype.toString.call(message.queryId) : options.longs === Number ? new $util.LongBits(message.queryId.low >>> 0, message.queryId.high >>> 0).toNumber(true) : message.queryId;
            if (message.entries && message.entries.length) {
                object.entries = [];
                for (var j = 0; j < message.entries.length; ++j)
                    object.entries[j] = $root.types.PluginStateEntry.toObject(message.entries[j], options);
            }
            return object;
        };

        /**
         * Converts this PluginReadResult to JSON.
         * @function toJSON
         * @memberof types.PluginReadResult
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginReadResult.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginReadResult
         * @function getTypeUrl
         * @memberof types.PluginReadResult
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginReadResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginReadResult";
        };

        return PluginReadResult;
    })();

    types.PluginStateWriteRequest = (function() {

        /**
         * Properties of a PluginStateWriteRequest.
         * @memberof types
         * @interface IPluginStateWriteRequest
         * @property {Array.<types.IPluginSetOp>|null} [sets] PluginStateWriteRequest sets
         * @property {Array.<types.IPluginDeleteOp>|null} [deletes] PluginStateWriteRequest deletes
         */

        /**
         * Constructs a new PluginStateWriteRequest.
         * @memberof types
         * @classdesc Represents a PluginStateWriteRequest.
         * @implements IPluginStateWriteRequest
         * @constructor
         * @param {types.IPluginStateWriteRequest=} [properties] Properties to set
         */
        function PluginStateWriteRequest(properties) {
            this.sets = [];
            this.deletes = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginStateWriteRequest sets.
         * @member {Array.<types.IPluginSetOp>} sets
         * @memberof types.PluginStateWriteRequest
         * @instance
         */
        PluginStateWriteRequest.prototype.sets = $util.emptyArray;

        /**
         * PluginStateWriteRequest deletes.
         * @member {Array.<types.IPluginDeleteOp>} deletes
         * @memberof types.PluginStateWriteRequest
         * @instance
         */
        PluginStateWriteRequest.prototype.deletes = $util.emptyArray;

        /**
         * Creates a new PluginStateWriteRequest instance using the specified properties.
         * @function create
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {types.IPluginStateWriteRequest=} [properties] Properties to set
         * @returns {types.PluginStateWriteRequest} PluginStateWriteRequest instance
         */
        PluginStateWriteRequest.create = function create(properties) {
            return new PluginStateWriteRequest(properties);
        };

        /**
         * Encodes the specified PluginStateWriteRequest message. Does not implicitly {@link types.PluginStateWriteRequest.verify|verify} messages.
         * @function encode
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {types.IPluginStateWriteRequest} message PluginStateWriteRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateWriteRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sets != null && message.sets.length)
                for (var i = 0; i < message.sets.length; ++i)
                    $root.types.PluginSetOp.encode(message.sets[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.deletes != null && message.deletes.length)
                for (var i = 0; i < message.deletes.length; ++i)
                    $root.types.PluginDeleteOp.encode(message.deletes[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginStateWriteRequest message, length delimited. Does not implicitly {@link types.PluginStateWriteRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {types.IPluginStateWriteRequest} message PluginStateWriteRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateWriteRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginStateWriteRequest message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginStateWriteRequest} PluginStateWriteRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateWriteRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginStateWriteRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.sets && message.sets.length))
                            message.sets = [];
                        message.sets.push($root.types.PluginSetOp.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        if (!(message.deletes && message.deletes.length))
                            message.deletes = [];
                        message.deletes.push($root.types.PluginDeleteOp.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginStateWriteRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginStateWriteRequest} PluginStateWriteRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateWriteRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginStateWriteRequest message.
         * @function verify
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginStateWriteRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sets != null && message.hasOwnProperty("sets")) {
                if (!Array.isArray(message.sets))
                    return "sets: array expected";
                for (var i = 0; i < message.sets.length; ++i) {
                    var error = $root.types.PluginSetOp.verify(message.sets[i]);
                    if (error)
                        return "sets." + error;
                }
            }
            if (message.deletes != null && message.hasOwnProperty("deletes")) {
                if (!Array.isArray(message.deletes))
                    return "deletes: array expected";
                for (var i = 0; i < message.deletes.length; ++i) {
                    var error = $root.types.PluginDeleteOp.verify(message.deletes[i]);
                    if (error)
                        return "deletes." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PluginStateWriteRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginStateWriteRequest} PluginStateWriteRequest
         */
        PluginStateWriteRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginStateWriteRequest)
                return object;
            var message = new $root.types.PluginStateWriteRequest();
            if (object.sets) {
                if (!Array.isArray(object.sets))
                    throw TypeError(".types.PluginStateWriteRequest.sets: array expected");
                message.sets = [];
                for (var i = 0; i < object.sets.length; ++i) {
                    if (typeof object.sets[i] !== "object")
                        throw TypeError(".types.PluginStateWriteRequest.sets: object expected");
                    message.sets[i] = $root.types.PluginSetOp.fromObject(object.sets[i]);
                }
            }
            if (object.deletes) {
                if (!Array.isArray(object.deletes))
                    throw TypeError(".types.PluginStateWriteRequest.deletes: array expected");
                message.deletes = [];
                for (var i = 0; i < object.deletes.length; ++i) {
                    if (typeof object.deletes[i] !== "object")
                        throw TypeError(".types.PluginStateWriteRequest.deletes: object expected");
                    message.deletes[i] = $root.types.PluginDeleteOp.fromObject(object.deletes[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginStateWriteRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {types.PluginStateWriteRequest} message PluginStateWriteRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginStateWriteRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.sets = [];
                object.deletes = [];
            }
            if (message.sets && message.sets.length) {
                object.sets = [];
                for (var j = 0; j < message.sets.length; ++j)
                    object.sets[j] = $root.types.PluginSetOp.toObject(message.sets[j], options);
            }
            if (message.deletes && message.deletes.length) {
                object.deletes = [];
                for (var j = 0; j < message.deletes.length; ++j)
                    object.deletes[j] = $root.types.PluginDeleteOp.toObject(message.deletes[j], options);
            }
            return object;
        };

        /**
         * Converts this PluginStateWriteRequest to JSON.
         * @function toJSON
         * @memberof types.PluginStateWriteRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginStateWriteRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginStateWriteRequest
         * @function getTypeUrl
         * @memberof types.PluginStateWriteRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginStateWriteRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginStateWriteRequest";
        };

        return PluginStateWriteRequest;
    })();

    types.PluginStateWriteResponse = (function() {

        /**
         * Properties of a PluginStateWriteResponse.
         * @memberof types
         * @interface IPluginStateWriteResponse
         * @property {types.IPluginError|null} [error] PluginStateWriteResponse error
         */

        /**
         * Constructs a new PluginStateWriteResponse.
         * @memberof types
         * @classdesc Represents a PluginStateWriteResponse.
         * @implements IPluginStateWriteResponse
         * @constructor
         * @param {types.IPluginStateWriteResponse=} [properties] Properties to set
         */
        function PluginStateWriteResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginStateWriteResponse error.
         * @member {types.IPluginError|null|undefined} error
         * @memberof types.PluginStateWriteResponse
         * @instance
         */
        PluginStateWriteResponse.prototype.error = null;

        /**
         * Creates a new PluginStateWriteResponse instance using the specified properties.
         * @function create
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {types.IPluginStateWriteResponse=} [properties] Properties to set
         * @returns {types.PluginStateWriteResponse} PluginStateWriteResponse instance
         */
        PluginStateWriteResponse.create = function create(properties) {
            return new PluginStateWriteResponse(properties);
        };

        /**
         * Encodes the specified PluginStateWriteResponse message. Does not implicitly {@link types.PluginStateWriteResponse.verify|verify} messages.
         * @function encode
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {types.IPluginStateWriteResponse} message PluginStateWriteResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateWriteResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.types.PluginError.encode(message.error, writer.uint32(/* id 99, wireType 2 =*/794).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PluginStateWriteResponse message, length delimited. Does not implicitly {@link types.PluginStateWriteResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {types.IPluginStateWriteResponse} message PluginStateWriteResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateWriteResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginStateWriteResponse message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginStateWriteResponse} PluginStateWriteResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateWriteResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginStateWriteResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 99: {
                        message.error = $root.types.PluginError.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginStateWriteResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginStateWriteResponse} PluginStateWriteResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateWriteResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginStateWriteResponse message.
         * @function verify
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginStateWriteResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.error != null && message.hasOwnProperty("error")) {
                var error = $root.types.PluginError.verify(message.error);
                if (error)
                    return "error." + error;
            }
            return null;
        };

        /**
         * Creates a PluginStateWriteResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginStateWriteResponse} PluginStateWriteResponse
         */
        PluginStateWriteResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginStateWriteResponse)
                return object;
            var message = new $root.types.PluginStateWriteResponse();
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".types.PluginStateWriteResponse.error: object expected");
                message.error = $root.types.PluginError.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a PluginStateWriteResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {types.PluginStateWriteResponse} message PluginStateWriteResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginStateWriteResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.error = null;
            if (message.error != null && message.hasOwnProperty("error"))
                object.error = $root.types.PluginError.toObject(message.error, options);
            return object;
        };

        /**
         * Converts this PluginStateWriteResponse to JSON.
         * @function toJSON
         * @memberof types.PluginStateWriteResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginStateWriteResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginStateWriteResponse
         * @function getTypeUrl
         * @memberof types.PluginStateWriteResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginStateWriteResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginStateWriteResponse";
        };

        return PluginStateWriteResponse;
    })();

    types.PluginSetOp = (function() {

        /**
         * Properties of a PluginSetOp.
         * @memberof types
         * @interface IPluginSetOp
         * @property {Uint8Array|null} [key] PluginSetOp key
         * @property {Uint8Array|null} [value] PluginSetOp value
         */

        /**
         * Constructs a new PluginSetOp.
         * @memberof types
         * @classdesc Represents a PluginSetOp.
         * @implements IPluginSetOp
         * @constructor
         * @param {types.IPluginSetOp=} [properties] Properties to set
         */
        function PluginSetOp(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginSetOp key.
         * @member {Uint8Array} key
         * @memberof types.PluginSetOp
         * @instance
         */
        PluginSetOp.prototype.key = $util.newBuffer([]);

        /**
         * PluginSetOp value.
         * @member {Uint8Array} value
         * @memberof types.PluginSetOp
         * @instance
         */
        PluginSetOp.prototype.value = $util.newBuffer([]);

        /**
         * Creates a new PluginSetOp instance using the specified properties.
         * @function create
         * @memberof types.PluginSetOp
         * @static
         * @param {types.IPluginSetOp=} [properties] Properties to set
         * @returns {types.PluginSetOp} PluginSetOp instance
         */
        PluginSetOp.create = function create(properties) {
            return new PluginSetOp(properties);
        };

        /**
         * Encodes the specified PluginSetOp message. Does not implicitly {@link types.PluginSetOp.verify|verify} messages.
         * @function encode
         * @memberof types.PluginSetOp
         * @static
         * @param {types.IPluginSetOp} message PluginSetOp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginSetOp.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.key);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
            return writer;
        };

        /**
         * Encodes the specified PluginSetOp message, length delimited. Does not implicitly {@link types.PluginSetOp.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginSetOp
         * @static
         * @param {types.IPluginSetOp} message PluginSetOp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginSetOp.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginSetOp message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginSetOp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginSetOp} PluginSetOp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginSetOp.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginSetOp();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.key = reader.bytes();
                        break;
                    }
                case 2: {
                        message.value = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginSetOp message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginSetOp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginSetOp} PluginSetOp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginSetOp.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginSetOp message.
         * @function verify
         * @memberof types.PluginSetOp
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginSetOp.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                    return "key: buffer expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                    return "value: buffer expected";
            return null;
        };

        /**
         * Creates a PluginSetOp message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginSetOp
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginSetOp} PluginSetOp
         */
        PluginSetOp.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginSetOp)
                return object;
            var message = new $root.types.PluginSetOp();
            if (object.key != null)
                if (typeof object.key === "string")
                    $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                else if (object.key.length >= 0)
                    message.key = object.key;
            if (object.value != null)
                if (typeof object.value === "string")
                    $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                else if (object.value.length >= 0)
                    message.value = object.value;
            return message;
        };

        /**
         * Creates a plain object from a PluginSetOp message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginSetOp
         * @static
         * @param {types.PluginSetOp} message PluginSetOp
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginSetOp.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.key = "";
                else {
                    object.key = [];
                    if (options.bytes !== Array)
                        object.key = $util.newBuffer(object.key);
                }
                if (options.bytes === String)
                    object.value = "";
                else {
                    object.value = [];
                    if (options.bytes !== Array)
                        object.value = $util.newBuffer(object.value);
                }
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = options.bytes === String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === Array ? Array.prototype.slice.call(message.key) : message.key;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
            return object;
        };

        /**
         * Converts this PluginSetOp to JSON.
         * @function toJSON
         * @memberof types.PluginSetOp
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginSetOp.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginSetOp
         * @function getTypeUrl
         * @memberof types.PluginSetOp
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginSetOp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginSetOp";
        };

        return PluginSetOp;
    })();

    types.PluginDeleteOp = (function() {

        /**
         * Properties of a PluginDeleteOp.
         * @memberof types
         * @interface IPluginDeleteOp
         * @property {Uint8Array|null} [key] PluginDeleteOp key
         */

        /**
         * Constructs a new PluginDeleteOp.
         * @memberof types
         * @classdesc Represents a PluginDeleteOp.
         * @implements IPluginDeleteOp
         * @constructor
         * @param {types.IPluginDeleteOp=} [properties] Properties to set
         */
        function PluginDeleteOp(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginDeleteOp key.
         * @member {Uint8Array} key
         * @memberof types.PluginDeleteOp
         * @instance
         */
        PluginDeleteOp.prototype.key = $util.newBuffer([]);

        /**
         * Creates a new PluginDeleteOp instance using the specified properties.
         * @function create
         * @memberof types.PluginDeleteOp
         * @static
         * @param {types.IPluginDeleteOp=} [properties] Properties to set
         * @returns {types.PluginDeleteOp} PluginDeleteOp instance
         */
        PluginDeleteOp.create = function create(properties) {
            return new PluginDeleteOp(properties);
        };

        /**
         * Encodes the specified PluginDeleteOp message. Does not implicitly {@link types.PluginDeleteOp.verify|verify} messages.
         * @function encode
         * @memberof types.PluginDeleteOp
         * @static
         * @param {types.IPluginDeleteOp} message PluginDeleteOp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginDeleteOp.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.key);
            return writer;
        };

        /**
         * Encodes the specified PluginDeleteOp message, length delimited. Does not implicitly {@link types.PluginDeleteOp.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginDeleteOp
         * @static
         * @param {types.IPluginDeleteOp} message PluginDeleteOp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginDeleteOp.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginDeleteOp message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginDeleteOp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginDeleteOp} PluginDeleteOp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginDeleteOp.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginDeleteOp();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.key = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginDeleteOp message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginDeleteOp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginDeleteOp} PluginDeleteOp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginDeleteOp.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginDeleteOp message.
         * @function verify
         * @memberof types.PluginDeleteOp
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginDeleteOp.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                    return "key: buffer expected";
            return null;
        };

        /**
         * Creates a PluginDeleteOp message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginDeleteOp
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginDeleteOp} PluginDeleteOp
         */
        PluginDeleteOp.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginDeleteOp)
                return object;
            var message = new $root.types.PluginDeleteOp();
            if (object.key != null)
                if (typeof object.key === "string")
                    $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                else if (object.key.length >= 0)
                    message.key = object.key;
            return message;
        };

        /**
         * Creates a plain object from a PluginDeleteOp message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginDeleteOp
         * @static
         * @param {types.PluginDeleteOp} message PluginDeleteOp
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginDeleteOp.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.key = "";
                else {
                    object.key = [];
                    if (options.bytes !== Array)
                        object.key = $util.newBuffer(object.key);
                }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = options.bytes === String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === Array ? Array.prototype.slice.call(message.key) : message.key;
            return object;
        };

        /**
         * Converts this PluginDeleteOp to JSON.
         * @function toJSON
         * @memberof types.PluginDeleteOp
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginDeleteOp.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginDeleteOp
         * @function getTypeUrl
         * @memberof types.PluginDeleteOp
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginDeleteOp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginDeleteOp";
        };

        return PluginDeleteOp;
    })();

    types.PluginStateEntry = (function() {

        /**
         * Properties of a PluginStateEntry.
         * @memberof types
         * @interface IPluginStateEntry
         * @property {Uint8Array|null} [key] PluginStateEntry key
         * @property {Uint8Array|null} [value] PluginStateEntry value
         */

        /**
         * Constructs a new PluginStateEntry.
         * @memberof types
         * @classdesc Represents a PluginStateEntry.
         * @implements IPluginStateEntry
         * @constructor
         * @param {types.IPluginStateEntry=} [properties] Properties to set
         */
        function PluginStateEntry(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PluginStateEntry key.
         * @member {Uint8Array} key
         * @memberof types.PluginStateEntry
         * @instance
         */
        PluginStateEntry.prototype.key = $util.newBuffer([]);

        /**
         * PluginStateEntry value.
         * @member {Uint8Array} value
         * @memberof types.PluginStateEntry
         * @instance
         */
        PluginStateEntry.prototype.value = $util.newBuffer([]);

        /**
         * Creates a new PluginStateEntry instance using the specified properties.
         * @function create
         * @memberof types.PluginStateEntry
         * @static
         * @param {types.IPluginStateEntry=} [properties] Properties to set
         * @returns {types.PluginStateEntry} PluginStateEntry instance
         */
        PluginStateEntry.create = function create(properties) {
            return new PluginStateEntry(properties);
        };

        /**
         * Encodes the specified PluginStateEntry message. Does not implicitly {@link types.PluginStateEntry.verify|verify} messages.
         * @function encode
         * @memberof types.PluginStateEntry
         * @static
         * @param {types.IPluginStateEntry} message PluginStateEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateEntry.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.key);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
            return writer;
        };

        /**
         * Encodes the specified PluginStateEntry message, length delimited. Does not implicitly {@link types.PluginStateEntry.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.PluginStateEntry
         * @static
         * @param {types.IPluginStateEntry} message PluginStateEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PluginStateEntry.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PluginStateEntry message from the specified reader or buffer.
         * @function decode
         * @memberof types.PluginStateEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.PluginStateEntry} PluginStateEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateEntry.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.PluginStateEntry();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.key = reader.bytes();
                        break;
                    }
                case 2: {
                        message.value = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PluginStateEntry message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.PluginStateEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.PluginStateEntry} PluginStateEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PluginStateEntry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PluginStateEntry message.
         * @function verify
         * @memberof types.PluginStateEntry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PluginStateEntry.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!(message.key && typeof message.key.length === "number" || $util.isString(message.key)))
                    return "key: buffer expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                    return "value: buffer expected";
            return null;
        };

        /**
         * Creates a PluginStateEntry message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.PluginStateEntry
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.PluginStateEntry} PluginStateEntry
         */
        PluginStateEntry.fromObject = function fromObject(object) {
            if (object instanceof $root.types.PluginStateEntry)
                return object;
            var message = new $root.types.PluginStateEntry();
            if (object.key != null)
                if (typeof object.key === "string")
                    $util.base64.decode(object.key, message.key = $util.newBuffer($util.base64.length(object.key)), 0);
                else if (object.key.length >= 0)
                    message.key = object.key;
            if (object.value != null)
                if (typeof object.value === "string")
                    $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                else if (object.value.length >= 0)
                    message.value = object.value;
            return message;
        };

        /**
         * Creates a plain object from a PluginStateEntry message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.PluginStateEntry
         * @static
         * @param {types.PluginStateEntry} message PluginStateEntry
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PluginStateEntry.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.key = "";
                else {
                    object.key = [];
                    if (options.bytes !== Array)
                        object.key = $util.newBuffer(object.key);
                }
                if (options.bytes === String)
                    object.value = "";
                else {
                    object.value = [];
                    if (options.bytes !== Array)
                        object.value = $util.newBuffer(object.value);
                }
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = options.bytes === String ? $util.base64.encode(message.key, 0, message.key.length) : options.bytes === Array ? Array.prototype.slice.call(message.key) : message.key;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
            return object;
        };

        /**
         * Converts this PluginStateEntry to JSON.
         * @function toJSON
         * @memberof types.PluginStateEntry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PluginStateEntry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PluginStateEntry
         * @function getTypeUrl
         * @memberof types.PluginStateEntry
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PluginStateEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.PluginStateEntry";
        };

        return PluginStateEntry;
    })();

    types.Transaction = (function() {

        /**
         * Properties of a Transaction.
         * @memberof types
         * @interface ITransaction
         * @property {string|null} [messageType] Transaction messageType
         * @property {google.protobuf.IAny|null} [msg] Transaction msg
         * @property {types.ISignature|null} [signature] Transaction signature
         * @property {number|Long|null} [createdHeight] Transaction createdHeight
         * @property {number|Long|null} [time] Transaction time
         * @property {number|Long|null} [fee] Transaction fee
         * @property {string|null} [memo] Transaction memo
         * @property {number|Long|null} [networkId] Transaction networkId
         * @property {number|Long|null} [chainId] Transaction chainId
         */

        /**
         * Constructs a new Transaction.
         * @memberof types
         * @classdesc Represents a Transaction.
         * @implements ITransaction
         * @constructor
         * @param {types.ITransaction=} [properties] Properties to set
         */
        function Transaction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transaction messageType.
         * @member {string} messageType
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.messageType = "";

        /**
         * Transaction msg.
         * @member {google.protobuf.IAny|null|undefined} msg
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.msg = null;

        /**
         * Transaction signature.
         * @member {types.ISignature|null|undefined} signature
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.signature = null;

        /**
         * Transaction createdHeight.
         * @member {number|Long} createdHeight
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.createdHeight = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction time.
         * @member {number|Long} time
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.time = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction fee.
         * @member {number|Long} fee
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.fee = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction memo.
         * @member {string} memo
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.memo = "";

        /**
         * Transaction networkId.
         * @member {number|Long} networkId
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.networkId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction chainId.
         * @member {number|Long} chainId
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.chainId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @function create
         * @memberof types.Transaction
         * @static
         * @param {types.ITransaction=} [properties] Properties to set
         * @returns {types.Transaction} Transaction instance
         */
        Transaction.create = function create(properties) {
            return new Transaction(properties);
        };

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @function encode
         * @memberof types.Transaction
         * @static
         * @param {types.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.messageType != null && Object.hasOwnProperty.call(message, "messageType"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.messageType);
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                $root.google.protobuf.Any.encode(message.msg, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                $root.types.Signature.encode(message.signature, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.createdHeight != null && Object.hasOwnProperty.call(message, "createdHeight"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.createdHeight);
            if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.time);
            if (message.fee != null && Object.hasOwnProperty.call(message, "fee"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.fee);
            if (message.memo != null && Object.hasOwnProperty.call(message, "memo"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.memo);
            if (message.networkId != null && Object.hasOwnProperty.call(message, "networkId"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.networkId);
            if (message.chainId != null && Object.hasOwnProperty.call(message, "chainId"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.chainId);
            return writer;
        };

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Transaction
         * @static
         * @param {types.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @function decode
         * @memberof types.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Transaction();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.messageType = reader.string();
                        break;
                    }
                case 2: {
                        message.msg = $root.google.protobuf.Any.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.signature = $root.types.Signature.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.createdHeight = reader.uint64();
                        break;
                    }
                case 5: {
                        message.time = reader.uint64();
                        break;
                    }
                case 6: {
                        message.fee = reader.uint64();
                        break;
                    }
                case 7: {
                        message.memo = reader.string();
                        break;
                    }
                case 8: {
                        message.networkId = reader.uint64();
                        break;
                    }
                case 9: {
                        message.chainId = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transaction message.
         * @function verify
         * @memberof types.Transaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.messageType != null && message.hasOwnProperty("messageType"))
                if (!$util.isString(message.messageType))
                    return "messageType: string expected";
            if (message.msg != null && message.hasOwnProperty("msg")) {
                var error = $root.google.protobuf.Any.verify(message.msg);
                if (error)
                    return "msg." + error;
            }
            if (message.signature != null && message.hasOwnProperty("signature")) {
                var error = $root.types.Signature.verify(message.signature);
                if (error)
                    return "signature." + error;
            }
            if (message.createdHeight != null && message.hasOwnProperty("createdHeight"))
                if (!$util.isInteger(message.createdHeight) && !(message.createdHeight && $util.isInteger(message.createdHeight.low) && $util.isInteger(message.createdHeight.high)))
                    return "createdHeight: integer|Long expected";
            if (message.time != null && message.hasOwnProperty("time"))
                if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                    return "time: integer|Long expected";
            if (message.fee != null && message.hasOwnProperty("fee"))
                if (!$util.isInteger(message.fee) && !(message.fee && $util.isInteger(message.fee.low) && $util.isInteger(message.fee.high)))
                    return "fee: integer|Long expected";
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            if (message.networkId != null && message.hasOwnProperty("networkId"))
                if (!$util.isInteger(message.networkId) && !(message.networkId && $util.isInteger(message.networkId.low) && $util.isInteger(message.networkId.high)))
                    return "networkId: integer|Long expected";
            if (message.chainId != null && message.hasOwnProperty("chainId"))
                if (!$util.isInteger(message.chainId) && !(message.chainId && $util.isInteger(message.chainId.low) && $util.isInteger(message.chainId.high)))
                    return "chainId: integer|Long expected";
            return null;
        };

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Transaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Transaction} Transaction
         */
        Transaction.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Transaction)
                return object;
            var message = new $root.types.Transaction();
            if (object.messageType != null)
                message.messageType = String(object.messageType);
            if (object.msg != null) {
                if (typeof object.msg !== "object")
                    throw TypeError(".types.Transaction.msg: object expected");
                message.msg = $root.google.protobuf.Any.fromObject(object.msg);
            }
            if (object.signature != null) {
                if (typeof object.signature !== "object")
                    throw TypeError(".types.Transaction.signature: object expected");
                message.signature = $root.types.Signature.fromObject(object.signature);
            }
            if (object.createdHeight != null)
                if ($util.Long)
                    (message.createdHeight = $util.Long.fromValue(object.createdHeight)).unsigned = true;
                else if (typeof object.createdHeight === "string")
                    message.createdHeight = parseInt(object.createdHeight, 10);
                else if (typeof object.createdHeight === "number")
                    message.createdHeight = object.createdHeight;
                else if (typeof object.createdHeight === "object")
                    message.createdHeight = new $util.LongBits(object.createdHeight.low >>> 0, object.createdHeight.high >>> 0).toNumber(true);
            if (object.time != null)
                if ($util.Long)
                    (message.time = $util.Long.fromValue(object.time)).unsigned = true;
                else if (typeof object.time === "string")
                    message.time = parseInt(object.time, 10);
                else if (typeof object.time === "number")
                    message.time = object.time;
                else if (typeof object.time === "object")
                    message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber(true);
            if (object.fee != null)
                if ($util.Long)
                    (message.fee = $util.Long.fromValue(object.fee)).unsigned = true;
                else if (typeof object.fee === "string")
                    message.fee = parseInt(object.fee, 10);
                else if (typeof object.fee === "number")
                    message.fee = object.fee;
                else if (typeof object.fee === "object")
                    message.fee = new $util.LongBits(object.fee.low >>> 0, object.fee.high >>> 0).toNumber(true);
            if (object.memo != null)
                message.memo = String(object.memo);
            if (object.networkId != null)
                if ($util.Long)
                    (message.networkId = $util.Long.fromValue(object.networkId)).unsigned = true;
                else if (typeof object.networkId === "string")
                    message.networkId = parseInt(object.networkId, 10);
                else if (typeof object.networkId === "number")
                    message.networkId = object.networkId;
                else if (typeof object.networkId === "object")
                    message.networkId = new $util.LongBits(object.networkId.low >>> 0, object.networkId.high >>> 0).toNumber(true);
            if (object.chainId != null)
                if ($util.Long)
                    (message.chainId = $util.Long.fromValue(object.chainId)).unsigned = true;
                else if (typeof object.chainId === "string")
                    message.chainId = parseInt(object.chainId, 10);
                else if (typeof object.chainId === "number")
                    message.chainId = object.chainId;
                else if (typeof object.chainId === "object")
                    message.chainId = new $util.LongBits(object.chainId.low >>> 0, object.chainId.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Transaction
         * @static
         * @param {types.Transaction} message Transaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.messageType = "";
                object.msg = null;
                object.signature = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.createdHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.createdHeight = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.fee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fee = options.longs === String ? "0" : 0;
                object.memo = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.networkId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.networkId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.chainId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.chainId = options.longs === String ? "0" : 0;
            }
            if (message.messageType != null && message.hasOwnProperty("messageType"))
                object.messageType = message.messageType;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = $root.google.protobuf.Any.toObject(message.msg, options);
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = $root.types.Signature.toObject(message.signature, options);
            if (message.createdHeight != null && message.hasOwnProperty("createdHeight"))
                if (typeof message.createdHeight === "number")
                    object.createdHeight = options.longs === String ? String(message.createdHeight) : message.createdHeight;
                else
                    object.createdHeight = options.longs === String ? $util.Long.prototype.toString.call(message.createdHeight) : options.longs === Number ? new $util.LongBits(message.createdHeight.low >>> 0, message.createdHeight.high >>> 0).toNumber(true) : message.createdHeight;
            if (message.time != null && message.hasOwnProperty("time"))
                if (typeof message.time === "number")
                    object.time = options.longs === String ? String(message.time) : message.time;
                else
                    object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber(true) : message.time;
            if (message.fee != null && message.hasOwnProperty("fee"))
                if (typeof message.fee === "number")
                    object.fee = options.longs === String ? String(message.fee) : message.fee;
                else
                    object.fee = options.longs === String ? $util.Long.prototype.toString.call(message.fee) : options.longs === Number ? new $util.LongBits(message.fee.low >>> 0, message.fee.high >>> 0).toNumber(true) : message.fee;
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            if (message.networkId != null && message.hasOwnProperty("networkId"))
                if (typeof message.networkId === "number")
                    object.networkId = options.longs === String ? String(message.networkId) : message.networkId;
                else
                    object.networkId = options.longs === String ? $util.Long.prototype.toString.call(message.networkId) : options.longs === Number ? new $util.LongBits(message.networkId.low >>> 0, message.networkId.high >>> 0).toNumber(true) : message.networkId;
            if (message.chainId != null && message.hasOwnProperty("chainId"))
                if (typeof message.chainId === "number")
                    object.chainId = options.longs === String ? String(message.chainId) : message.chainId;
                else
                    object.chainId = options.longs === String ? $util.Long.prototype.toString.call(message.chainId) : options.longs === Number ? new $util.LongBits(message.chainId.low >>> 0, message.chainId.high >>> 0).toNumber(true) : message.chainId;
            return object;
        };

        /**
         * Converts this Transaction to JSON.
         * @function toJSON
         * @memberof types.Transaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transaction
         * @function getTypeUrl
         * @memberof types.Transaction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transaction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Transaction";
        };

        return Transaction;
    })();

    types.MessageSend = (function() {

        /**
         * Properties of a MessageSend.
         * @memberof types
         * @interface IMessageSend
         * @property {Uint8Array|null} [fromAddress] MessageSend fromAddress
         * @property {Uint8Array|null} [toAddress] MessageSend toAddress
         * @property {number|Long|null} [amount] MessageSend amount
         */

        /**
         * Constructs a new MessageSend.
         * @memberof types
         * @classdesc Represents a MessageSend.
         * @implements IMessageSend
         * @constructor
         * @param {types.IMessageSend=} [properties] Properties to set
         */
        function MessageSend(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageSend fromAddress.
         * @member {Uint8Array} fromAddress
         * @memberof types.MessageSend
         * @instance
         */
        MessageSend.prototype.fromAddress = $util.newBuffer([]);

        /**
         * MessageSend toAddress.
         * @member {Uint8Array} toAddress
         * @memberof types.MessageSend
         * @instance
         */
        MessageSend.prototype.toAddress = $util.newBuffer([]);

        /**
         * MessageSend amount.
         * @member {number|Long} amount
         * @memberof types.MessageSend
         * @instance
         */
        MessageSend.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new MessageSend instance using the specified properties.
         * @function create
         * @memberof types.MessageSend
         * @static
         * @param {types.IMessageSend=} [properties] Properties to set
         * @returns {types.MessageSend} MessageSend instance
         */
        MessageSend.create = function create(properties) {
            return new MessageSend(properties);
        };

        /**
         * Encodes the specified MessageSend message. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @function encode
         * @memberof types.MessageSend
         * @static
         * @param {types.IMessageSend} message MessageSend message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSend.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fromAddress != null && Object.hasOwnProperty.call(message, "fromAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.fromAddress);
            if (message.toAddress != null && Object.hasOwnProperty.call(message, "toAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.toAddress);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.amount);
            return writer;
        };

        /**
         * Encodes the specified MessageSend message, length delimited. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageSend
         * @static
         * @param {types.IMessageSend} message MessageSend message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSend.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageSend message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageSend
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageSend} MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSend.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageSend();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.fromAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.toAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.amount = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageSend message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageSend
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageSend} MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSend.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageSend message.
         * @function verify
         * @memberof types.MessageSend
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageSend.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                if (!(message.fromAddress && typeof message.fromAddress.length === "number" || $util.isString(message.fromAddress)))
                    return "fromAddress: buffer expected";
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                if (!(message.toAddress && typeof message.toAddress.length === "number" || $util.isString(message.toAddress)))
                    return "toAddress: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            return null;
        };

        /**
         * Creates a MessageSend message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageSend
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageSend} MessageSend
         */
        MessageSend.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageSend)
                return object;
            var message = new $root.types.MessageSend();
            if (object.fromAddress != null)
                if (typeof object.fromAddress === "string")
                    $util.base64.decode(object.fromAddress, message.fromAddress = $util.newBuffer($util.base64.length(object.fromAddress)), 0);
                else if (object.fromAddress.length >= 0)
                    message.fromAddress = object.fromAddress;
            if (object.toAddress != null)
                if (typeof object.toAddress === "string")
                    $util.base64.decode(object.toAddress, message.toAddress = $util.newBuffer($util.base64.length(object.toAddress)), 0);
                else if (object.toAddress.length >= 0)
                    message.toAddress = object.toAddress;
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a MessageSend message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageSend
         * @static
         * @param {types.MessageSend} message MessageSend
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageSend.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.fromAddress = "";
                else {
                    object.fromAddress = [];
                    if (options.bytes !== Array)
                        object.fromAddress = $util.newBuffer(object.fromAddress);
                }
                if (options.bytes === String)
                    object.toAddress = "";
                else {
                    object.toAddress = [];
                    if (options.bytes !== Array)
                        object.toAddress = $util.newBuffer(object.toAddress);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
            }
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                object.fromAddress = options.bytes === String ? $util.base64.encode(message.fromAddress, 0, message.fromAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.fromAddress) : message.fromAddress;
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                object.toAddress = options.bytes === String ? $util.base64.encode(message.toAddress, 0, message.toAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.toAddress) : message.toAddress;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            return object;
        };

        /**
         * Converts this MessageSend to JSON.
         * @function toJSON
         * @memberof types.MessageSend
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageSend.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageSend
         * @function getTypeUrl
         * @memberof types.MessageSend
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageSend.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageSend";
        };

        return MessageSend;
    })();

    types.FeeParams = (function() {

        /**
         * Properties of a FeeParams.
         * @memberof types
         * @interface IFeeParams
         * @property {number|Long|null} [sendFee] FeeParams sendFee
         */

        /**
         * Constructs a new FeeParams.
         * @memberof types
         * @classdesc Represents a FeeParams.
         * @implements IFeeParams
         * @constructor
         * @param {types.IFeeParams=} [properties] Properties to set
         */
        function FeeParams(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FeeParams sendFee.
         * @member {number|Long} sendFee
         * @memberof types.FeeParams
         * @instance
         */
        FeeParams.prototype.sendFee = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new FeeParams instance using the specified properties.
         * @function create
         * @memberof types.FeeParams
         * @static
         * @param {types.IFeeParams=} [properties] Properties to set
         * @returns {types.FeeParams} FeeParams instance
         */
        FeeParams.create = function create(properties) {
            return new FeeParams(properties);
        };

        /**
         * Encodes the specified FeeParams message. Does not implicitly {@link types.FeeParams.verify|verify} messages.
         * @function encode
         * @memberof types.FeeParams
         * @static
         * @param {types.IFeeParams} message FeeParams message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeeParams.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sendFee != null && Object.hasOwnProperty.call(message, "sendFee"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.sendFee);
            return writer;
        };

        /**
         * Encodes the specified FeeParams message, length delimited. Does not implicitly {@link types.FeeParams.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.FeeParams
         * @static
         * @param {types.IFeeParams} message FeeParams message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FeeParams.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FeeParams message from the specified reader or buffer.
         * @function decode
         * @memberof types.FeeParams
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.FeeParams} FeeParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeeParams.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.FeeParams();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.sendFee = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FeeParams message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.FeeParams
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.FeeParams} FeeParams
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FeeParams.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FeeParams message.
         * @function verify
         * @memberof types.FeeParams
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FeeParams.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sendFee != null && message.hasOwnProperty("sendFee"))
                if (!$util.isInteger(message.sendFee) && !(message.sendFee && $util.isInteger(message.sendFee.low) && $util.isInteger(message.sendFee.high)))
                    return "sendFee: integer|Long expected";
            return null;
        };

        /**
         * Creates a FeeParams message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.FeeParams
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.FeeParams} FeeParams
         */
        FeeParams.fromObject = function fromObject(object) {
            if (object instanceof $root.types.FeeParams)
                return object;
            var message = new $root.types.FeeParams();
            if (object.sendFee != null)
                if ($util.Long)
                    (message.sendFee = $util.Long.fromValue(object.sendFee)).unsigned = true;
                else if (typeof object.sendFee === "string")
                    message.sendFee = parseInt(object.sendFee, 10);
                else if (typeof object.sendFee === "number")
                    message.sendFee = object.sendFee;
                else if (typeof object.sendFee === "object")
                    message.sendFee = new $util.LongBits(object.sendFee.low >>> 0, object.sendFee.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a FeeParams message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.FeeParams
         * @static
         * @param {types.FeeParams} message FeeParams
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FeeParams.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.sendFee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sendFee = options.longs === String ? "0" : 0;
            if (message.sendFee != null && message.hasOwnProperty("sendFee"))
                if (typeof message.sendFee === "number")
                    object.sendFee = options.longs === String ? String(message.sendFee) : message.sendFee;
                else
                    object.sendFee = options.longs === String ? $util.Long.prototype.toString.call(message.sendFee) : options.longs === Number ? new $util.LongBits(message.sendFee.low >>> 0, message.sendFee.high >>> 0).toNumber(true) : message.sendFee;
            return object;
        };

        /**
         * Converts this FeeParams to JSON.
         * @function toJSON
         * @memberof types.FeeParams
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FeeParams.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FeeParams
         * @function getTypeUrl
         * @memberof types.FeeParams
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FeeParams.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.FeeParams";
        };

        return FeeParams;
    })();

    types.Signature = (function() {

        /**
         * Properties of a Signature.
         * @memberof types
         * @interface ISignature
         * @property {Uint8Array|null} [publicKey] Signature publicKey
         * @property {Uint8Array|null} [signature] Signature signature
         */

        /**
         * Constructs a new Signature.
         * @memberof types
         * @classdesc Represents a Signature.
         * @implements ISignature
         * @constructor
         * @param {types.ISignature=} [properties] Properties to set
         */
        function Signature(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Signature publicKey.
         * @member {Uint8Array} publicKey
         * @memberof types.Signature
         * @instance
         */
        Signature.prototype.publicKey = $util.newBuffer([]);

        /**
         * Signature signature.
         * @member {Uint8Array} signature
         * @memberof types.Signature
         * @instance
         */
        Signature.prototype.signature = $util.newBuffer([]);

        /**
         * Creates a new Signature instance using the specified properties.
         * @function create
         * @memberof types.Signature
         * @static
         * @param {types.ISignature=} [properties] Properties to set
         * @returns {types.Signature} Signature instance
         */
        Signature.create = function create(properties) {
            return new Signature(properties);
        };

        /**
         * Encodes the specified Signature message. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @function encode
         * @memberof types.Signature
         * @static
         * @param {types.ISignature} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.publicKey);
            if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.signature);
            return writer;
        };

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Signature
         * @static
         * @param {types.ISignature} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @function decode
         * @memberof types.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Signature} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Signature();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.publicKey = reader.bytes();
                        break;
                    }
                case 2: {
                        message.signature = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Signature} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Signature message.
         * @function verify
         * @memberof types.Signature
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Signature.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                    return "publicKey: buffer expected";
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                    return "signature: buffer expected";
            return null;
        };

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Signature
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Signature} Signature
         */
        Signature.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Signature)
                return object;
            var message = new $root.types.Signature();
            if (object.publicKey != null)
                if (typeof object.publicKey === "string")
                    $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                else if (object.publicKey.length >= 0)
                    message.publicKey = object.publicKey;
            if (object.signature != null)
                if (typeof object.signature === "string")
                    $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                else if (object.signature.length >= 0)
                    message.signature = object.signature;
            return message;
        };

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Signature
         * @static
         * @param {types.Signature} message Signature
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Signature.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.publicKey = "";
                else {
                    object.publicKey = [];
                    if (options.bytes !== Array)
                        object.publicKey = $util.newBuffer(object.publicKey);
                }
                if (options.bytes === String)
                    object.signature = "";
                else {
                    object.signature = [];
                    if (options.bytes !== Array)
                        object.signature = $util.newBuffer(object.signature);
                }
            }
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
            return object;
        };

        /**
         * Converts this Signature to JSON.
         * @function toJSON
         * @memberof types.Signature
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Signature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Signature
         * @function getTypeUrl
         * @memberof types.Signature
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Signature.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Signature";
        };

        return Signature;
    })();

    return types;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Any = (function() {

            /**
             * Properties of an Any.
             * @memberof google.protobuf
             * @interface IAny
             * @property {string|null} [type_url] Any type_url
             * @property {Uint8Array|null} [value] Any value
             */

            /**
             * Constructs a new Any.
             * @memberof google.protobuf
             * @classdesc Represents an Any.
             * @implements IAny
             * @constructor
             * @param {google.protobuf.IAny=} [properties] Properties to set
             */
            function Any(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Any type_url.
             * @member {string} type_url
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.type_url = "";

            /**
             * Any value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new Any instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny=} [properties] Properties to set
             * @returns {google.protobuf.Any} Any instance
             */
            Any.create = function create(properties) {
                return new Any(properties);
            };

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type_url != null && Object.hasOwnProperty.call(message, "type_url"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.type_url);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
                return writer;
            };

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Any();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type_url = reader.string();
                            break;
                        }
                    case 2: {
                            message.value = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Any message.
             * @function verify
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Any.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    if (!$util.isString(message.type_url))
                        return "type_url: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                        return "value: buffer expected";
                return null;
            };

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Any} Any
             */
            Any.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Any)
                    return object;
                var message = new $root.google.protobuf.Any();
                if (object.type_url != null)
                    message.type_url = String(object.type_url);
                if (object.value != null)
                    if (typeof object.value === "string")
                        $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                    else if (object.value.length >= 0)
                        message.value = object.value;
                return message;
            };

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.Any} message Any
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Any.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type_url = "";
                    if (options.bytes === String)
                        object.value = "";
                    else {
                        object.value = [];
                        if (options.bytes !== Array)
                            object.value = $util.newBuffer(object.value);
                    }
                }
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    object.type_url = message.type_url;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                return object;
            };

            /**
             * Converts this Any to JSON.
             * @function toJSON
             * @memberof google.protobuf.Any
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Any.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Any
             * @function getTypeUrl
             * @memberof google.protobuf.Any
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Any.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Any";
            };

            return Any;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
