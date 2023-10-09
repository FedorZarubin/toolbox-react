import { useEffect, useReducer } from "react";
import ButtonsBar from "./ButtonsBar";
import ToolHeader from "./ToolHeader";
import RadioBtn from "./RadioBtn";
import TextResult from "./TextResult";

const tableMap = [
    {id: "seatsIncl", name: "Количество сотрудников в пакете", countlimit: false, defaultBlocked: null, defaultCost: 1000},
    {id: "addseat", name: "Количество доп. сотрудников", countlimit: 10000, defaultBlocked: "adjustable", defaultCost: 200},
    {id: "analytics", name: "Аналитика", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 1000},
    {id: "effectivesale", name: "Эффективные продажи", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 500},
    {id: "crm", name: "Интеграция с CRM", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 500},
    {id: "callback", name: "Виджет обратного звонка", countlimit: 50, defaultBlocked: "adjustable", defaultCost: 500},
    {id: "callsrecord", name: "Запись разговоров", countlimit: 3, defaultBlocked: "adjustable", defaultCost: 1500},
    {id: "autocaller", name: "Автоинформирование", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 1000},
    {id: "emotion", name: "Разговоры на повышенных тонах", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 2000},
    {id: "bigbusiness", name: "Большой бизнес", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 2000},
    {id: "effectiveservice", name: "Эффективное обслуживание", countlimit: 1, defaultBlocked: "adjustable", defaultCost: 500},
];

const initialValues = {
    values: {
        domain_name: "",
        operationType: "set",
        seatsIncl_count: 7
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
    const result = state.result.text ? <TextResult text={state.result.text} error={state.result.isErr}/>: null;

    const handleChange = (e) => {dispatch({
        type: "set_values",
        name: e.target.name,
        newVal: !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : e.target.value
    })};

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!e.target.domain_name.value.trim()) {
            dispatch({
                type: "set_result",
                text: "Не указан домен!",
                isErr: true    
            });
            return
        };
        const [extString, extArr] = tableMap.reduce((ext,item,idx)=>{
            if (e.target[item.id+"_count"].value !== "0" && item.id !== "seatsIncl" && item.id !== "addseat") {
                ext[0].push(item.id)
            };
            if (idx === tableMap.length-1) {
                ext[0] = ext[0].length ? ext[0].join(",") : " "
            };
            if (item.id !== "seatsIncl") {
                const block = e.target[item.id+"_isBlocked"].value === "blocked" ? {Block: true} : {}
                ext[1].push({
                    Name: item.id,
                    Min: item.id === "addseat" ? 0 : 1,
                    Max: item.countlimit,
                    Price: Number(e.target[item.id+"_cost"].value)*100,
                    ...block
                })
            }
            return ext
        },[[],[]]);
        const tariffJson = {
            Domain: e.target.domain_name.value.trim(),
            TariffPrice: Number(e.target.seatsIncl_cost.value)*100,
            Seats: Number(e.target.seatsIncl_count.value),
            Extensions: extArr
        };
        const result = `mfbossi ${e.target.operationType.value} individual tariff seats ${Number(e.target.seatsIncl_count.value)+Number(e.target.addseat_count.value)} `+
            `record ${e.target.callsrecord_count.value} callback ${e.target.callback_count.value} `+
            `extensions '${extString}' json tariff '${JSON.stringify(tariffJson)}'`
        dispatch({
            type: "set_result",
            text: result,
            isErr: false
        })
    }
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
                <form onSubmit={handleSubmit}>
                    <div className="fieldset">
                        <div className="optionsList">
                            <div><label htmlFor="domain_name">Домен:</label></div>
                            <div className="generalInput">
                                <input 
                                    type="text" 
                                    id="domain_name" 
                                    name="domain_name" 
                                    size="40" 
                                    value={state.values.domain_name} onChange={handleChange}
                                />
                            </div>
                            <div><label>Тип операции</label></div>
                            <RadioBtn
                                btnName="operationType"
                                btnList={[["set", "Установка ИТП"],["change", "Изменение ИТП"]]}
                                handleChange={handleChange}
                                curValue={state.values.operationType}
                            />
                        </div>
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
                {result}
            </div>  
        </div>
    );
}

export {IndividualTariff} ;