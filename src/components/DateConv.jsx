import { useSelector, useDispatch } from "react-redux";
import ButtonsBar from "./ButtonsBar";
import RadioBtn from "./RadioBtn";
import Tabs from "./Tabs";
import TextResult from "./TextResult";
import ToolHeader from "./ToolHeader";

function DateConv() {

    const state = useSelector((state => state.dateConv));
    const dispatch = useDispatch();

    const handleChange = (e) => {
        dispatch({
            type: "dateConv/set_values",
            name: e.target.name,
            newVal: e.target.value
        })
    }

    const handleConvert = (e) => {
        e.preventDefault();
        if (e.target.tabs.value === "0") {
            const ts =  e.target?.ts?.value.trim().replace(/[^0-9]/g, "");
            if ( !ts ) {
                dispatch({
                    type: "dateConv/set_result",
                    text: "Не введены данные!",
                    isErr: true
                });
                return
            }
            if ( ts.length!==10 && ts.length!==13 ){
                dispatch({
                    type: "dateConv/set_result",
                    text: "Неверная длина timestamp!",
                    isErr: true
                });
                return
            };
            const tz = e.target.tz1.value==="msk" ? "Europe/Moscow" : "UTC";
            const ms = ts.length===10 ? "000": "";
            const date = new Date(Number(ts+ms));
            const options = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                timeZone: tz
            };
            dispatch({
                type: "dateConv/set_result",
                text: date.toLocaleDateString("ru", options),
                isErr: false
            })
        }
        else {
            const d =  e.target?.d?.value;
            const t =  e.target?.t?.value || "00:00:00";
            const tz_offset = e.target.tz2.value==="msk" ? "+03:00" : "Z";
            if (!d) {
                dispatch({
                    type: "dateConv/set_result",
                    text: "Не введены данные!",
                    isErr: true
                    });
                    return    
            }
            dispatch({
                type: "dateConv/set_result",
                text: String(Date.parse(d + "T" + t + ".000"+tz_offset)/1000),
                isErr: false
            })
        }
    }

    const handleClear = () => {
        dispatch({
            type: 'dateConv/clear'
        })
    }
 
    const ts2date = (
        <div className="optionsList">
            <div><label htmlFor="ts">Введите timestamp</label></div>
            <div className="generalInput"><input type="text" name="ts" id="ts" value={state.values.ts} onChange={handleChange}/></div>
            <div><label>Часовой пояс</label></div>
            <RadioBtn btnName="tz1" btnList={[["msk","МСК"],["utc","UTC"]]} handleChange={handleChange} curValue={state.values.tz1}/>
        </div>
    );
    const date2ts = (
        <div className="optionsList">
            <div><label htmlFor="ts">Введите дату и время</label></div>
            <div className="generalInput">
                <input type="date" name="d" id="d" value={state.values.d} onChange={handleChange}/>
                <input type="time" name="t" id="t" step="1" value={state.values.t} onChange={handleChange}/>
            </div>
            <div><label>Часовой пояс</label></div>
            <RadioBtn btnName="tz2" btnList={[["msk","МСК"],["utc","UTC"]]} handleChange={handleChange} curValue={state.values.tz2}/>
        </div>
    );
    const buttons = state.result.text ? ["clear","copy"] : [];
    const result = state.result.text ? <TextResult text={state.result.text} error={state.result.isErr}/> : null;
    
    return (
        <div className="toolContainer">
            <ToolHeader value={"Конвертер даты"}/>
            <div className="toolBody">
                <form onSubmit={handleConvert}>
                    <div className="fieldset">
                        <Tabs
                            content={[
                                ["timestamp в дату", ts2date],
                                ["дату в timestamp", date2ts]
                            ]}
                        />
                    </div>
                    <ButtonsBar
                        buttons={buttons} 
                        textToCopy={state.result.text}
                        clearFunc={handleClear}
                    />
                </form>
                {result}
            </div>
        </div>
    )
    
}
 
export {DateConv};