'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createAction = createAction;
exports.boundAction = boundAction;
exports.boundPromise = boundPromise;
exports.boundAsync = boundAsync;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
 * Create pure redux action
 *
 * @see https://github.com/acdlite/flux-standard-action#actions
 *
 * @param {String} type - Action type
 * @param {*} [payload] - Some data or error details
 * @param {*} [meta] - Addition action information
 * @returns {{type: *, payload: *, meta: *}}
 */
function createAction(type, payload, meta) {
    return { type: type, payload: payload, meta: meta };
}

/**
 * Bound pure action
 *
 * @param {String} type - Action type
 * @param {*} [payload] - Some data or error details
 * @param {*} [meta] - Addition action information
 *
 * @returns {function(dispatch, getState)} Binder
 */
function boundAction(type, payload, meta) {
    return function (dispatch) {
        return dispatch(createAction(type, payload, meta));
    };
}

/**
 * Bound action that has type Promise
 *
 * @param {function(): Promise} operation - Function/Operation that return Promise
 * @param {String} type - Action type
 * @param {function()} isLoading - Getter for pending indicator
 * @param {Array<*>} [args] - Operation arguments
 *
 * @returns {function(dispatch, getState)} Binder
 */
function boundPromise(operation, type, isLoading) {
    var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    return function (dispatch, getState) {
        if (!isLoading(getState())) {
            dispatch(createAction('' + type + PENDING_POSTFIX, null, args));

            operation.apply(undefined, _toConsumableArray(args)).then(function (response) {
                return dispatch(createAction('' + type + SUCCESS_POSTFIX, response.data, args));
            }).catch(function (error) {
                return dispatch(createAction('' + type + FAIL_POSTFIX, error, args));
            });
        }
    };
}

/**
 * Bound async action
 *
 * @param {function(*, function()} operation - Async function/operation
 *  that has first-error callback
 * @param {String} type - Action type
 * @param {function()} isLoading - Getter for pending indicator
 * @param {Array<*>} [args] - Operation arguments
 *
 * @returns {function(dispatch, getState)} Binder
 */
function boundAsync(operation, type, isLoading) {
    var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    return function (dispatch, getState) {
        if (!isLoading(getState())) {
            dispatch(createAction('' + type + PENDING_POSTFIX, null, args));

            operation.apply(undefined, _toConsumableArray(args).concat([function (error, data) {
                if (error) {
                    return dispatch(createAction('' + type + FAIL_POSTFIX, error, args));
                }
                dispatch(createAction('' + type + SUCCESS_POSTFIX, data, args));
            }]));
        }
    };
}