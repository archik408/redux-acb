/**
 * @private
 * @type {String}
 */
const PENDING_POSTFIX = '_PENDING';
/**
 * @private
 * @type {String}
 */
const SUCCESS_POSTFIX = '_SUCCESS';
/**
 * @private
 * @type {String}
 */
const FAIL_POSTFIX = '_FAIL';

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
export function createAction(type, payload, meta) {
    return { type, payload, meta };
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
export function boundAction(type, payload, meta) {
    return dispatch => dispatch(createAction(type, payload, meta));
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
export function boundPromise(operation, type, isLoading, args=[]) {
    return (dispatch, getState) => {
        if (!isLoading(getState())) {
            dispatch(createAction(`${type}${PENDING_POSTFIX}`, null, args));

            operation(...args)
                .then(response => dispatch(createAction(`${type}${SUCCESS_POSTFIX}`, response.data, args)))
                .catch(error => dispatch(createAction(`${type}${FAIL_POSTFIX}`, error, args)));
        }
    }
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
export function boundAsync(operation, type, isLoading, args=[]) {
    return (dispatch, getState) => {
        if (!isLoading(getState())) {
            dispatch(createAction(`${type}${PENDING_POSTFIX}`, null, args));

            operation(...args, (error , data) => {
                if (error) {
                    return dispatch(createAction(`${type}${FAIL_POSTFIX}`, error, args));
                }
                dispatch(createAction(`${type}${SUCCESS_POSTFIX}`, data, args));
            });
        }
    }
}
