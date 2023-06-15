import { useEffect, useReducer } from "react";
import ButtonsBar from "./ButtonsBar";
import ToolHeader from "./ToolHeader";
import RadioBtn from "./RadioBtn";

const initialValues = {
    values: {
        seatsIncl_count: 7
        // seatsIncl_cost: 0,
        // addseat_count: 0,
        // addseat_isBlocked: null,
        // addseat_cost: 0,
        // analytics_count: 0,
        // analytics_isBlocked: null,
        // analytics_cost: 0,
        // effectivesale_count: 0,
        // effectivesale_isBlocked: null,
        // effectivesale_cost: 0,
        // crm_count: 0,
        // crm_isBlocked: null,
        // crm_cost: 0,
        // callback_count: 0,
        // callback_isBlocked: null,
        // callback_cost: 0,
        // callsrecord_count: 0,
        // callsrecord_isBlocked: null,
        // callsrecord_cost: 0,
        // autocaller_count: 0,
        // autocaller_isBlocked: null,
        // autocaller_cost: 0,
        // emotion_count: 0,
        // emotion_isBlocked: null,
        // emotion_cost: 0,
        // bigbusiness_count: 0,
        // bigbusiness_isBlocked: null,
        // bigbusiness_cost: 0,
        // effectiveservice_count: 0,
        // effectiveservice_isBlocked: null,
        // effectiveservice_cost: 0,
    },
    result: {
        text: null,
        isErr: false
    }
}

const storedState = {...initialValues};

const individualTariffReducer = (state,action)=>{
    switch (action.type) {
        case 'set_values': {
            const newValues = {...state.values, [action.name]:action.newVal};
            storedState.values = newValues;
            return {...state, values:newValues}
        }
        case 'set_result': {
            const newResult = {
                text: action.text,
                isErr: action.isErr
            };
            storedState.result = newResult;
            return {...state, result:newResult}
        }
        case 'clear': {
            storedState.values = {...initialValues.values};
            storedState.result = {...initialValues.result};
            return initialValues
        }
        default:
          return;
      }
}


function IndividualTariff (props) {
    const tableMap = [
        {id: "seatsIncl", name: "Количество сотрудников в пакете", countlimit: false, defaultBlocked: null, defaultCost: 1000},
        {id: "addseat", name: "Количество доп. сотрудников", countlimit: false, defaultBlocked: "adjustable", defaultCost: 200},
        {id: "analytics", name: "Аналитика", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 500},
        {id: "effectivesale", name: "Эффективные продажи", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 500},
        {id: "crm", name: "Интеграция с CRM", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 500},
        {id: "callback", name: "Виджет обратного звонка", countlimit: false, defaultBlocked: "adjustable", defaultCost: 500},
        {id: "callsrecord", name: "Запись разговоров", countlimit: 3, defaultBlocked: "adjustable", defaultCost: 1500},
        {id: "autocaller", name: "Автоинформирование", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 1000},
        {id: "emotion", name: "Разговоры на повышенных тонах", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 2000},
        {id: "bigbusiness", name: "Большой бизнес", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 2000},
        {id: "effectiveservice", name: "Эффективное обслуживание", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 0},
    ];
    let sum = 0;
    const rows = [];
    const [state, dispatch] = useReducer(individualTariffReducer, props.savedState || initialValues);
    useEffect(()=>{
        return function (){
            props.saveState(storedState);
        }
    // eslint-disable-next-line
    },[]);
    const buttons = state.result.text ? ["clear","copy"] : [];
    const handleChange = (e) => {dispatch({
        type: "set_values",
        name: e.target.name,
        newVal: !isNaN(Number(e.target.value)) ? Number(e.target.value) : e.target.value
    })};
    tableMap.forEach((i)=>{
        const amount = i.id === "seatsIncl" 
        ? state.values[i.id+"_cost"] || i.defaultCost 
        : (state.values[i.id+"_count"] || 0) * (Number.isInteger(state.values[i.id+"_cost"]) ? state.values[i.id+"_cost"] : i.defaultCost);
        const row = (
            <tr key={i.id} className={!state.values[i.id+"_count"] ? "inactiveRow" : undefined}>
                <td>{i.name}</td>
                <td>
                    <div className="generalInput">
                        <input 
                            type="number" 
                            name={i.id+"_count"} 
                            value={state.values[i.id+"_count"] || 0} 
                            onChange={handleChange}
                            max={i.countlimit ? i.countlimit : undefined}
                            min={0}
                        />
                    </div>
                </td>
                <td>
                    { i.defaultBlocked &&
                        <RadioBtn 
                            btnName={i.id+"_isBlocked"} 
                            btnList={[["adjustable", "Можно менять"],["blocked","Обязательно"]]}
                            handleChange={handleChange}
                            curValue={state.values[i.id+"_isBlocked"] || i.defaultBlocked}
                        />
                    }
                </td>
                <td>
                    <div className="generalInput">
                        <input 
                            type="number" 
                            name={i.id+"_cost"} 
                            value={Number.isInteger(state.values[i.id+"_cost"]) ? state.values[i.id+"_cost"] : i.defaultCost} 
                            onChange={handleChange}
                            min={0}
                        />
                    </div>
                </td>
                <td>
                    {amount}
                </td>
            </tr>
        );
        sum += amount;
        rows.push(row)
    });

    return (
        <div className="toolContainer">
            <ToolHeader value={props.title}/>
            <div className="toolBody">
                <form>
                    <div className="fieldset">
                        <table className="individualTariffTable">
                            <thead>
                                <tr>
                                    <th>Абонентские платежи</th>
                                    <th>Количество</th>
                                    <th>Тип</th>
                                    <th>Стоимость</th>
                                    <th>Итого</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                                {/* {tableMap.map(i=>{
                                    return <tr key={i.id} className={!state.values[i.id+"_count"] ? "inactiveRow" : undefined}>
                                        <td>{i.name}</td>
                                        <td>
                                            <div className="generalInput">
                                                <input 
                                                    type="number" 
                                                    name={i.id+"_count"} 
                                                    value={state.values[i.id+"_count"]} 
                                                    onChange={handleChange}
                                                    max={i.countlimit ? i.countlimit : undefined}
                                                    min={0}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            { i.defaultBlocked &&
                                                <RadioBtn 
                                                    btnName={i.id+"_isBlocked"} 
                                                    btnList={[["adjustable", "Можно менять"],["blocked","Обязательно"]]}
                                                    handleChange={handleChange}
                                                    curValue={state.values[i.id+"_isBlocked"] || i.defaultBlocked}
                                                />
                                            }
                                        </td>
                                        <td>
                                            <div className="generalInput">
                                                <input 
                                                    type="number" 
                                                    name={i.id+"_cost"} 
                                                    value={state.values[i.id+"_cost"] || i.defaultCost} 
                                                    onChange={handleChange}
                                                    min={0}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            { i.id === "seatsIncl" 
                                            ? state.values[i.id+"_cost"] || i.defaultCost 
                                            : state.values[i.id+"_count"] * (state.values[i.id+"_cost"] || i.defaultCost)}
                                        </td>
                                    </tr>
                                })} */}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4}>Полная стоимость тарифа</td>
                                    <td>{sum}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <ButtonsBar
                        buttons={buttons}
                        textToCopy={state.result.text}
                        clearFunc={()=>{dispatch({type:"clear"})}}
                    />
                </form>
            </div>  
        </div>
    );
}

export {IndividualTariff} ;