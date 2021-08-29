"use strict";
/**
 * Query
 *
 * dgraph-orm Query class
 *
 * @author Ashok Vishwakarma <akvlko@gmail.com>
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * methods
 *
 * dgraph-orm model methods
 */
var methods_1 = __importDefault(require("./helpers/methods"));
/**
 * _conditions
 *
 * @type Array<string>
 */
var _conditions = ["or", "and"];
/**
 * Query
 *
 * Class Query
 */
var Query = /** @class */ (function () {
    /**
     * constructor
     * @param type {string}
     * @param field {string}
     * @param value {any}
     * @param params {Params}
     * @param nest {boolean}
     * @param name {string}
     * @param logger {Function}
     */
    function Query(type, field, value, params, name, logger, nest) {
        if (nest === void 0) { nest = false; }
        this.nest = nest;
        this.name = name;
        this.params = params;
        this.type = type;
        this.field = field;
        this.value = value;
        this.logger = logger;
        this.where = this._where(this.type, this.field, this.value, this.name);
        this.query = this._build(this.params);
    }
    /**
     * _where
     * @param type {string}
     * @param field {string}
     * @param value {any}
     * @param name {string}
     *
     * @returns string
     */
    Query.prototype._where = function (type, field, value, name) {
        var _where = "";
        switch (type) {
            case methods_1.default.eq:
            case methods_1.default.allofterms:
            case methods_1.default.alloftext:
            case methods_1.default.anyofterms:
            case methods_1.default.anyoftext:
                _where = "(func: " + type + "(" + field + ", " + ('"' + value +
                    '"') + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.regexp:
                _where = "(func: " + type + "(" + field + ", " + value + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.match:
                _where = "(func: " + type + "(" + field + ", " + value + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.uid:
                if (Array.isArray(field)) {
                    field = field.join(", ");
                }
                _where = "(func: " + methods_1.default.uid + "(" + field + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.type:
                if (Array.isArray(field)) {
                    field = field.join(", ");
                }
                _where = "(func: " + methods_1.default.type + "(" + field + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.has:
                _where = "(func: " + methods_1.default.has + "(" + field + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.near:
                _where =
                    "(func: " + methods_1.default.near + "(" + field + ", [" + value.longitude + ", " + value.latitude + "], " + value.distance + "){{ORDER}}{{LIMIT}})";
                break;
            case methods_1.default.contains:
                _where =
                    "(func: " + methods_1.default.contains + "(" + field + ", [" + value.longitude + ", " + value.latitude + "]){{ORDER}}{{LIMIT}})";
                break;
        }
        return _where;
    };
    /**
     * _filter
     * @param key {string}
     * @param value {any}
     * @param name {string}
     *
     * @returns string
     */
    Query.prototype._filter = function (key, value, name) {
        var not = "";
        if (typeof value === "object" && !Array.isArray(value) && value.not) {
            not = 'NOT';
        }
        if (key.toLowerCase() === "has") {
            var val = (typeof value === "object" ? value.value : value);
            return not + " " + key + "(" + val + ")";
        }
        if (key.toLowerCase() === "uid") {
            var val = (typeof value === "object" ? value.value : value);
            return not + " " + key + "(" + val + ")";
        }
        if (key.toLowerCase() === "type") {
            var val = (typeof value === "object" ? value.value : value);
            return not + " " + key + "(" + val + ")";
        }
        if (typeof value === "string" || typeof value === "boolean") {
            return not + " eq(" + key + ", \"" + value + "\")";
        }
        if (typeof value === "object" && !Array.isArray(value)) {
            var _key = Object.keys(value)[0];
            if (_key) {
                var _value = value[_key];
                if (Array.isArray(_value)) {
                    var _sub_1 = [];
                    _value.forEach(function (_val) {
                        _sub_1.push(not + " uid_in(" + key + ", \"" + _val + "\")");
                    });
                    return _sub_1.join(" OR ");
                }
                if (typeof _value === "string" && _key !== "regexp") {
                    _value = '"' + _value + '"';
                }
                if (_key === "ne") {
                    return "NOT eq(" + key + ", " + _value + ")";
                }
                return not + " " + _key + "(" + key + ", " + _value + ")";
            }
        }
    };
    /**
     * _parse_filter
     * @param filter {any}
     * @param name {string}
     *
     * @returns string
     */
    Query.prototype._parse_filter = function (filter, name) {
        var _this = this;
        var _filters = [];
        if (typeof filter !== "undefined") {
            Object.keys(filter).forEach(function (_key) {
                if (_conditions.indexOf(_key.toLowerCase()) === -1) {
                    _filters.push(_this._filter(_key, filter[_key], name));
                }
                else {
                    var _sub_2 = [];
                    Object.keys(filter[_key]).forEach(function (_k) {
                        if (Array.isArray(filter[_key][_k])) {
                            filter[_key][_k].forEach(function (_val) {
                                _sub_2.push(_this._filter(_k, _val, name));
                            });
                        }
                        else {
                            _sub_2.push(_this._filter(_k, filter[_key][_k], name));
                        }
                    });
                    if (_sub_2.length > 0) {
                        _filters.push("(" + _sub_2.join(" " + _key.replace("$", "").toUpperCase() + " ") + ")");
                    }
                }
            });
        }
        if (_filters.length > 0) {
            // console.log(name);
            return " @filter(" + _filters.join(" " + (name === 'or' ? 'OR' : 'AND') + " ") + ")";
        }
        return "";
    };
    /**
     * _attributes
     * @param attributes {Array<string>}
     * @param name {string}
     *
     * @return string
     */
    Query.prototype._attributes = function (attributes, name) {
        var _attrs = [];
        for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
            var attr = attributes_1[_i];
            if (attr === "uid") {
                _attrs.push("uid");
            }
            else {
                _attrs.push("" + attr);
            }
        }
        return _attrs.join("\n");
    };
    /**
     * _include
     * @param include {Include}
     *
     * @returns string
     */
    Query.prototype._include = function (include, name) {
        var _this = this;
        if (name === void 0) { name = this.name; }
        var _inc = "";
        if (!include) {
            return _inc;
        }
        var _loop_1 = function (relation) {
            if (include[relation].count) {
                _inc += (include[relation].as ? include[relation].as : relation) + "Count: count(" + relation + ")";
                // continue;
            }
            if (relation)
                if (include[relation].reverse) {
                    _inc += "\n        " + (include[relation].reverse.name
                        ? include[relation].reverse.name
                        : relation + "Reverse") + ": ~" + relation + "\n          " + (include[relation].reverse.filter ?
                        this_1._parse_filter(include[relation].reverse.filter, include[relation].model) : '') + "{{ORDER}}{{LIMIT}}\n        {\n          " + (include[relation].reverse.include ? this_1._include(include[relation].reverse.include, include[relation].model) : '') + "\n         " + (include[relation].reverse.exclude ? '' : ("expand(" + (include[relation].reverse.type ? include[relation].reverse.type : '_all_')) + '){}}');
                    // continue;
                    if (include[relation].as)
                        _inc += "\n        " + (include[relation].as ? include[relation].as : relation) + ": " + relation;
                }
            if (include[relation].extra) {
                try {
                    _inc += relation + ": " + (include[relation].filter ?
                        this_1._parse_filter(include[relation].filter, 'or') : '') + " {";
                }
                catch (error) {
                    console.log(error);
                }
            }
            if (include[relation].expand) {
                var type = void 0;
                if (include[relation].expand.type) {
                    type = "expand(" + include[relation].expand.type + ")";
                }
                else {
                    type = "expand(_all_)";
                }
                _inc += relation + " {uid\n          " + type + "\n         }";
            }
            if (include[relation].var && Array.isArray(include[relation].var)) {
                include[relation].var.forEach(function (varible) {
                    _inc += "\n          " + _this._var(varible, relation, include[relation].model);
                });
            }
            else if (include[relation].var && !Array.isArray(include[relation].var)) {
                _inc += this_1._var(include[relation].var, relation, include[relation].model);
            }
            // if (include[relation].var) {
            //   let vName: string=''
            //   let reverse: string = ''
            //   let filter: string = ''
            //   if (typeof include[relation].var === 'string') {
            //     vName=include[relation].var
            //   } else {
            //     vName=include[relation].var.name
            //   }
            //   if (include[relation].var.reverse) {
            //     reverse='~'
            //   }
            //   if (include[relation].var.filter) {
            //     console.log(include[relation].var.filter);
            //     filter = this._parse_filter(include[relation].var.filter, include[relation].model)
            //   }
            //   _inc+= `${vName} as ${reverse}${relation} ${filter}`
            // }
            if (include[relation].include)
                _inc += "" + this_1._include(include[relation].include, include[relation].model);
            // if (include[relation].var) {
            // }
            var _limit = this_1._extras(include[relation]);
            var _order = this_1._parse_order(include[relation].order);
            if (include[relation].filter && !include[relation].extra) {
                _inc += "" + this_1._parse_filter(include[relation].filter, include[relation].model);
            }
            // if (_limit) {
            //   _inc += ` (${_limit}) `;
            // }
            // if (_order) {
            //   _inc += ` (${_order})`;
            // }
            if (Object.keys(include[relation]).length == 0)
                _inc += "{\n        " + this_1._attributes(include[relation].attributes, include[relation].model) + "\n        " + this_1._include(include[relation].include, include[relation].model) + "\n      }";
            if ((!include[relation].isNest) && _inc.charAt(_inc.length - 1) !== '}')
                _inc += '}';
            _inc = _inc.replace("{{ORDER}}", _order ? '(' + _order + ')' : '').replace("{{LIMIT}}", _limit ? '(' + _limit + ')' : '');
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.keys(include); _i < _a.length; _i++) {
            var relation = _a[_i];
            _loop_1(relation);
        }
        return _inc;
    };
    Query.prototype._var = function (varbs, relation, model) {
        if (varbs) {
            var vName = '';
            var reverse = '';
            var filter = '';
            if (typeof varbs === 'string') {
                vName = varbs;
            }
            else {
                vName = varbs.name;
            }
            if (varbs.reverse) {
                reverse = '~';
            }
            if (varbs.filter) {
                // console.log(varbs.filter);
                filter = this._parse_filter(varbs.filter, model);
            }
            return vName + " as " + reverse + relation + " " + filter;
        }
    };
    /**
     * _extra
     * @param params {Params}
     *
     * @return string
     */
    Query.prototype._extras = function (params) {
        var _extra = [];
        if (params.first && typeof params.first === "number") {
            _extra.push("first: " + params.first);
        }
        if (params.offset && typeof params.offset === "number") {
            _extra.push("offset: " + params.offset);
        }
        if (params.after) {
            _extra.push("after: " + params.after);
        }
        if (_extra.length > 0) {
            return "" + _extra.join(", ");
        }
        return "";
    };
    /**
     * _parse_order
     * @param order {Array<string>}
     *
     * @returns string
     */
    Query.prototype._parse_order = function (order) {
        var _order = [];
        if (order && order.length > 0) {
            if (Array.isArray(order[0])) {
                order.forEach(function (_o) {
                    if (typeof _o[1] !== "undefined") {
                        _order.push("order" + _o[1].toLowerCase() + ": " + _o[0]);
                    }
                });
            }
            else {
                _order.push("order" + order[1].toLowerCase() + ": " + order[0]);
            }
        }
        if (_order.length > 0) {
            return "" + _order.join(", ");
        }
        return "";
    };
    /**
     * _build
     * @param params {any}
     *
     * @returns string
     */
    Query.prototype._build = function (params) {
        var _order = this._parse_order(params.order);
        var _limit = this._extras(params);
        if (_order) {
            _order = ", " + _order;
        }
        if (_limit) {
            _limit = ", " + _limit;
        }
        var query = (this.nest ? '' : '{') + "\n      " + this.name + " " + this.where.replace("{{ORDER}}", _order).replace("{{LIMIT}}", _limit) + " " + this._parse_filter(params.filter, this.name) + " {\n        " + (params.exclude ? '' : this._attributes(params.attributes, this.name)) + "\n        " + this._include(params.include) + "\n        " + this._expand(params.expand) + "\n        dgraphType:dgraph.type\n        \n      }\n    " + (this.nest ? '' : '}');
        this.logger(query);
        return query;
    };
    Query.prototype._expand = function (expandable) {
        if (typeof expandable === 'string') {
            return "uid\n      expand(" + expandable + "){}";
        }
        else if (typeof expandable === 'object') {
            var extraExp = '';
            if (expandable.expand) {
                extraExp = this._expand(expandable.expand);
            }
            return "uid\n      expand(" + expandable.name + "){\n        " + extraExp + "\n      }";
        }
        else
            return '';
    };
    return Query;
}());
exports.default = Query;
//# sourceMappingURL=query.js.map