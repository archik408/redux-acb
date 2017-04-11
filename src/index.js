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
 * Fabric method
 * Creating application dispatcher
 *
 * @param {Object} strategy - Strategy for working with Store/Models
 * @returns {Dispatcher} as part of Controller
 */
export function buildDispather(strategy) {
    return new Dispatcher(strategy);
}

/**
 * Action Dispatcher
 * as a part of Controller
 */
class Dispatcher {
    /**
     * Strategy for working with Store/Models
     *
     * @param {Function} getState - Return current application state
     * @param {Function} dispatch - Send message to model/store layer
     */
    constructor({ getState = () => false, dispatch = f => f }) {
        this.store = {
            getState,
            dispatch
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
    createAction(type, payload, meta, error) {
        return { type, payload, meta, error };
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
    boundAction(type, payload, meta) {
        const { store, createAction } = this;
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
    boundPromise(operation, type, isLoading, args = []) {
        const { store, createAction } = this;
        if (!isLoading(store.getState())) {
            store.dispatch(createAction(`${type}${PENDING_POSTFIX}`, null, args));
            operation(...args)
                .then(res => store.dispatch(createAction(`${type}${SUCCESS_POSTFIX}`, res.data, args)))
                .catch(error => store.dispatch(createAction(`${type}${FAIL_POSTFIX}`, error, args, true)));
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
    boundAsync(operation, type, isLoading, args = []) {
        const { store, createAction } = this;
        if (!isLoading(store.getState())) {
            store.dispatch(createAction(`${type}${PENDING_POSTFIX}`, null, args));
            operation(...args, (error, data) => {
                if (error) {
                    return store.dispatch(createAction(`${type}${FAIL_POSTFIX}`, error, args, true));
                }
                store.dispatch(createAction(`${type}${SUCCESS_POSTFIX}`, data, args));
            });
        }
    }
}