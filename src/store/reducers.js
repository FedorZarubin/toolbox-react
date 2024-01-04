import initialStates from './initialStates'

const reducers = {
    audit(state = initialStates.audit, action) {
        switch (action.type) {
            case 'audit/set_values': {
                const newValues = {...state.values, ...action.values};
                return {...state, values:newValues}
            }
            case 'audit/set_result': {
                const newResult = {
                    text: action.text,
                    isErr: action.isErr,
                    ...(action.clearAfter ? {clearAfter: action.clearAfter} : {})
                };
                return {...state, result:newResult}
            }
            case 'audit/clear': {
                return initialStates.audit
            }
            case 'audit/set_pending': {
                return {...state, isPending: action.isPending}
            }
            case 'audit/set_settings': {
                const newSettings = {...state.settings, ...action.settings}
                return {...state, settings: newSettings}
            }
            default:
              return state;
          }
    },

    promocodes(state = initialStates.promocodes, action) {
        switch (action.type) {
            case 'promocodes/set_values': {
                const newValues = {...state.values, [action.name]:action.newVal};
                return {...state, values:newValues}
            }
            case 'promocodes/set_result': {
                const newResult = {
                    text: action.text,
                    isErr: action.isErr
                };
                return {...state, result:newResult}
            }
            default:
              return state;
          }
    },

    dateConv(state = initialStates.dateConv, action) {
        switch (action.type) {
            case 'dateConv/set_values': {
                const newValues = {...state.values, [action.name]:action.newVal};
                return {...state, values:newValues}
            }
            case 'dateConv/set_result': {
                const newResult = {
                    text: action.text,
                    isErr: action.isErr
                };
                return {...state, result:newResult}
            }
            case 'dateConv/clear': {
                return initialStates.dateConv
            }

            default:
                return state;
        }
    },

    prefsParse(state = initialStates.prefsParse, action) {
        switch (action.type) {
            case 'prefsParse/set_values': {
                const newValues = {...state.values, [action.name]:action.newVal};
                if (action.name === "selectedPrefsBlock") {
                    const newJsonToEdit = action.newVal === 'All' 
                        ? JSON.stringify(state.outJson, null, 4) 
                        : JSON.stringify({ [action.newVal]: state.outJson[action.newVal] }, null, 4);
                    newValues.jsonToEdit = newJsonToEdit
                }
                return {...state, values:newValues}
            }
            case 'prefsParse/clear': {
                return initialStates.prefsParse
            }
            case 'prefsParse/set_pending': {
                return {...state, isPending: action.isPending}
            }
            case 'prefsParse/parse': {
                const newValues = {...state.values, jsonToEdit: JSON.stringify(action.outJson, null, 4), selectedPrefsBlock: "All"};
                return {...state, values: newValues, outJson: action.outJson, isPending: false}
            }
            case 'prefsParse/set_result': {
                const newResult = {
                    text: action.text,
                    isErr: action.isErr
                };
                return {...state, result:newResult}
            }
            default:
                return state;
        }
    }

}

export default reducers