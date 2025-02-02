"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.APIError = exports.SchemaGenerationError = exports.ValidationError = exports.AgentError = void 0;
var AgentError = /** @class */ (function (_super) {
    __extends(AgentError, _super);
    function AgentError(message, details) {
        var _this = _super.call(this, message) || this;
        _this.details = details;
        _this.name = 'AgentError';
        return _this;
    }
    return AgentError;
}(Error));
exports.AgentError = AgentError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, details) {
        var _this = _super.call(this, message, details) || this;
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(AgentError));
exports.ValidationError = ValidationError;
var SchemaGenerationError = /** @class */ (function (_super) {
    __extends(SchemaGenerationError, _super);
    function SchemaGenerationError(message, details) {
        var _this = _super.call(this, message, details) || this;
        _this.name = 'SchemaGenerationError';
        return _this;
    }
    return SchemaGenerationError;
}(AgentError));
exports.SchemaGenerationError = SchemaGenerationError;
var APIError = /** @class */ (function (_super) {
    __extends(APIError, _super);
    function APIError(message, details) {
        var _this = _super.call(this, message, details) || this;
        _this.name = 'APIError';
        return _this;
    }
    return APIError;
}(AgentError));
exports.APIError = APIError;
var ConfigurationError = /** @class */ (function (_super) {
    __extends(ConfigurationError, _super);
    function ConfigurationError(message, details) {
        var _this = _super.call(this, message, details) || this;
        _this.name = 'ConfigurationError';
        return _this;
    }
    return ConfigurationError;
}(AgentError));
exports.ConfigurationError = ConfigurationError;
