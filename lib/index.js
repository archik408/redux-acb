'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.buildDispather = buildDispather;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @todo artur.basak
 * Все еще считаю, что подобный сервис
 * это попытка обойти тот факт, что слой модели на клиенте
 * является персистентным.
 * Персистентность нужно реализовывать на уровне модели,
 * действия пользователя не должны в процессе работы мутировать
 * во что-то вроде GET_DATA_FAIL
 */

/**
 * @private
 * @type {String}
 */
var PENDING_POSTFIX = '_PENDING';
/**
 * @private
 * @type {String}
 */
var SUCCESS_POSTFIX = '_SUCCESS';
/**
 * @private
 * @type {String}
 */
var FAIL_POSTFIX = '_FAIL';

/**
 * Fabric method
 * Creating application dispatcher
 *
 * @param {Object} strategy - Strategy for working with Store/Models
 * @returns {Dispatcher} as part of Controller
 */
function buildDispather(strategy) {
    return new Dispatcher(strategy);
}

/**
 * Action Dispatcher
 * as a part of Controller
 */

var Dispatcher = function () {
    /**
     * Strategy for working with Store/Models
     *
     * @param {Function} getState - Return current application state
     * @param {Function} dispatch - Send message to model/store layer
     */
    function Dispatcher(_ref) {
        var _ref$getState = _ref.getState,
            getState = _ref$getState === undefined ? function () {
            return false;
        } : _ref$getState,
            _ref$dispatch = _ref.dispatch,
            dispatch = _ref$dispatch === undefined ? function (f) {
            return f;
        } : _ref$dispatch;

        _classCallCheck(this, Dispatcher);

        this.store = {
            getState: getState,
            dispatch: dispatch
        };
    }
    /**
     * Create pure redux/flux action
     *
     * @see https://github.com/acdlite/redux-actions
     * @see https://github.com/acdlite/flux-standard-action#actions
     *
     * @param {String} type - Action type
     * @param {*} [payload] - Some data or error details
     * @param {*} [meta] - Addition action information
     * @param {Boolean} [error] - Payload is error
     *
     * @returns {Object} New action object
     */


    _createClass(Dispatcher, [{
        key: 'createAction',
        value: function createAction(type, payload, meta, error) {
            return { type: type, payload: payload, meta: meta, error: error };
        }

        /**
         * Bound pure action
         *
         * @param {String} type - Action type
         * @param {*} [payload] - Some data or error details
         * @param {*} [meta] - Addition action information
         *
         * @returns {*} Dispatch action
         */

    }, {
        key: 'boundAction',
        value: function boundAction(type, payload, meta) {
            var store = this.store,
                createAction = this.createAction;

            return store.dispatch(createAction(type, payload, meta));
        }

        /**
         * Bound action that has type Promise
         *
         * @param {Function} operation - Function/Operation that return Promise
         * @param {String} type - Action type
         * @param {Function} isLoading - Getter for pending indicator
         * @param {Array<*>} [args] - Operation arguments
         *
         * @returns {*} Dispatch action
         */

    }, {
        key: 'boundPromise',
        value: function boundPromise(operation, type, isLoading) {
            var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
            var store = this.store,
                createAction = this.createAction;

            if (!isLoading(store.getState())) {
                store.dispatch(createAction('' + type + PENDING_POSTFIX, null, args));
                operation.apply(undefined, _toConsumableArray(args)).then(function (res) {
                    return store.dispatch(createAction('' + type + SUCCESS_POSTFIX, res.data, args));
                }).catch(function (error) {
                    return store.dispatch(createAction('' + type + FAIL_POSTFIX, error, args, true));
                });
            }
        }

        /**
         * Bound async action
         *
         * @param {Function} operation - Async function/operation that has first-error callback
         * @param {String} type - Action type
         * @param {Function} isLoading - Getter for pending indicator
         * @param {Array<*>} [args] - Operation arguments
         *
         * @returns {*} Dispatch action
         */

    }, {
        key: 'boundAsync',
        value: function boundAsync(operation, type, isLoading) {
            var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
            var store = this.store,
                createAction = this.createAction;

            if (!isLoading(store.getState())) {
                store.dispatch(createAction('' + type + PENDING_POSTFIX, null, args));
                operation.apply(undefined, _toConsumableArray(args).concat([function (error, data) {
                    if (error) {
                        return store.dispatch(createAction('' + type + FAIL_POSTFIX, error, args, true));
                    }
                    store.dispatch(createAction('' + type + SUCCESS_POSTFIX, data, args));
                }]));
            }
        }
    }]);

    return Dispatcher;
}();