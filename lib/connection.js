"use strict";
/**
 * Connection
 *
 * dgraph-orm Connection class
 *
 * @author Ashok Vishwakarma <akvlko@gmail.com>
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * dgraph
 *
 * https://www.npmjs.com/package/dgraph-js
 */
var dgraph = __importStar(require("dgraph-js"));
/**
 * _config
 *
 * @type ConnectionConfig
 */
var _config = {
    host: '127.0.0.1',
    port: 9080,
    debug: false,
    credentails: dgraph.grpc.credentials.createInsecure()
};
/**
 * Connection
 *
 * Connection class
 */
var Connection = /** @class */ (function () {
    /**
     * constructor
     * @param config {ConnectionConfig}
     * @param logger {Function}
     */
    function Connection(config, logger) {
        if (config === void 0) { config = {}; }
        if (logger === void 0) { logger = console.log; }
        /**
         * dgraph
         *
         * @type any
         */
        this.dgraph = dgraph;
        this.config = __assign(__assign({}, _config), config);
        try {
            this.clientStub = new dgraph.DgraphClientStub(this.config.host + ":" + this.config.port, this.config.credentails);
            // console.log(this.clientStub);
            this.client = new dgraph.DgraphClient(this.clientStub);
            if (this.config.debug) {
                this.client.setDebugMode(true);
            }
        }
        catch (error) {
            logger(error);
        }
    }
    /**
     * close
     *
     * @retuns void
     */
    Connection.prototype.close = function () {
        this.clientStub.close();
    };
    return Connection;
}());
exports.default = Connection;
//# sourceMappingURL=connection.js.map