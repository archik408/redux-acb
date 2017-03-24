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
export function createAction(type, payload, meta, error) {
    return { type, payload, meta, error };
}

/**
 * Bound pure action
 *
 * @param {String} type - Action type
 * @param {*} [payload] - Some data or error details
 * @param {*} [meta] - Addition action information
 *
 * @returns {Function} Binder
 * @param {Function} Binder.dispatch - Action emitter
 */
export function boundAction(type, payload, meta) {
    return dispatch => dispatch(createAction(type, payload, meta));
}

/**
 * Bound action that has type Promise
 *
 * @param {Promise} operation - Function/Operation that return Promise
 * @param {String} type - Action type
 * @param {Function} isLoading - Getter for pending indicator
 * @param {Array<*>} [args] - Operation arguments
 *
 * @returns {Function} Binder
 * @param {Function} Binder.dispatch - Action emitter
 * @param {Function} Binder.getState - Getter for application global state
 */
export function boundPromise(operation, type, isLoading, args=[]) {
    return (dispatch, getState) => {
        if (!isLoading(getState())) {
            dispatch(createAction(`${type}${PENDING_POSTFIX}`, null, args));

            operation(...args)
                .then(response => dispatch(createAction(`${type}${SUCCESS_POSTFIX}`, response.data, args)))
                .catch(error => dispatch(createAction(`${type}${FAIL_POSTFIX}`, error, args, true)));
        }
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
 * @returns {Function} Binder
 * @param {Function} Binder.dispatch - Action emitter
 * @param {Function} Binder.getState - Getter for application global state
 */
export function boundAsync(operation, type, isLoading, args=[]) {
    return (dispatch, getState) => {
        if (!isLoading(getState())) {
            dispatch(createAction(`${type}${PENDING_POSTFIX}`, null, args));

            operation(...args, (error , data) => {
                if (error) {
                    return dispatch(createAction(`${type}${FAIL_POSTFIX}`, error, args, true));
                }
                dispatch(createAction(`${type}${SUCCESS_POSTFIX}`, data, args));
            });
        }
    }
}
