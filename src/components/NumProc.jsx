import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Checkbox from "./Checkbox";
import Tabs from "./Tabs";
import ToolHeader from "./ToolHeader";
import ButtonsBar from "./ButtonsBar";
import TextResult from "./TextResult";
import RadioBtn from "./RadioBtn";
import Select from "./Select";
import { Modal } from "./Modal";
import {_psw} from "../auxiliary/_psw";


const settingsState = {
    settings: {
        isOpen: false,
        isErr: false,
        errText: null,
        value: "",
        clearAfter: null
    }
}

let mfbossiList;

function NumProc() {
    
    const [settings, setSettings] = useState(settingsState.settings);
    const state = useSelector((state => state.numProc));
    const dispatch = useDispatch();

    // componentDidMount 
    useEffect( () => {
        if (mfbossiList) return;
        fetch(`http://${window.location.hostname}:8000/mfbossiList/`)
        .then(response => response.json())
        .then(data => { mfbossiList = data })
        .catch(error => { 
            mfbossiList = [["error","Не удалось загрузить команды"]];
            console.log(error)
        })
    },[])
    
    // componentDidUpdate 
    useEffect( () => {
        if (state.clearResultAfter) {
            setTimeout(()=>{
                dispatch({
                    type: "numProc/clearResultByTimeout"
                })
            },state.clearResultAfter*1000)
        };
        if (settings.clearAfter) {
            setTimeout(()=>{
                setSettings((settings => {
                    return {...settings, errText: null, isErr: false, clearAfter: null}
                }))
            },settings.clearAfter*1000)
        }
    })

    const handleNumbers = (e) => {
        e.preventDefault();

        //preparing source num list
        const data = e.target.inpNumbers.value.trim();
        if (data === "") {
            dispatch({
                type: "numProc/set_result",
                text: "Введите номера в тектовое поле!",
                isErr: true
            });
            return;
        };
        const inp_separator = data.match(/\n/)?.[0] || data.match(/;/)?.[0] || data.match(/,/)?.[0] || " ";
        const nums_arr = data.split(inp_separator).map(num => {
            num = num.trim().replace(/[^0-9]/g, "");
            if (num.length === 10) num = "7" + num;
            else if (num.match(/^[78]\d{10}$/)) num = num.replace(/^8/, "7");
            else if (num !== "") num = num + " (!Некорректный формат номера!)";
            return num;
        }).filter( (num, i, arr) => num !== "" && arr.lastIndexOf(num) === i ); //remove repeated numbers
        if ( nums_arr.some( i => i.match(/Некорректный формат номера/) ) ) { // error
            dispatch({
                type: "numProc/set_result",
                text: "В списке есть некорректные номера!\n\n"+nums_arr.join("\n"),
                isErr: true
            });
            return;
        }

        //build a chosen output format
        let result;
    
        switch (e.target.tabs.value) {
            case "0": // in line
                const out_separator = e.target.inLineOutSeparator.value === "custom" ? e.target.inLineCustomSeparator.value : e.target.inLineOutSeparator.value;
                result = nums_arr.join(out_separator);
                break;
            case "1": // in column
                result = nums_arr.join("\n");
                break;
            case "2": // mfbossi
                const [mfbossi2file_first, mfbossi2file_next] = e.target.mfbossi2file.checked ? [' > result.txt',' >> result.txt'] : ['',''];
                const mfbossiSleep = Number(e.target.mfbossiSleep.value) > 0 ? '; sleep ' + e.target.mfbossiSleep.value : "";
                result = `echo "*Result*"${mfbossi2file_first}; for i in ${nums_arr.join(" ")}; do echo "---$i---"${mfbossi2file_next}; ${e.target.mfbossiCmd.value}${mfbossi2file_next}${mfbossiSleep}; echo "OK"${mfbossi2file_next}; done`
                break;
            case "3": //curl
                const fileExt = e.target.curlType.value==="srvMgmt" && e.target.srvMgmt_action.value === "status" ? "xml" : "txt";
                const [curl2file_first, curl2file_next] = e.target.curl2file.checked ? [' > result.'+fileExt,' >> result.'+fileExt] : ['',''];
                const curlSleep = Number(e.target.curlSleep.value) > 0 ? ' sleep '+e.target.curlSleep.value+";" : "";
                if (e.target.curlType.value==="srvMgmt") { // services management
                    const action = e.target.srvType.value === "7024" && e.target.srvMgmt_action.value !== "status"
                        ? (e.target.srvMgmt_action.value === "add" ? "vats_add_phase1" : "vats_rem_phase1") 
                        : "service_"+e.target.srvMgmt_action.value;
                    const curlStr = `curl "http://10.236.26.171/v1/OSA/${action}?ACCOUNT=VATS&MSISDN=$i&PWD=${_psw}&SERVICE_ID=`;
                    if (action==="service_status") { // status
                        const curlBody = new FormData(e.target).getAll("srvType").map(srv=>{
                            return `echo "<SRV_${srv}>"${curl2file_next}; ${curlStr+srv}"${curl2file_next}; echo "</SRV_${srv}>"${curl2file_next};`
                        }).join(" ");
                        result = `echo "<RESULT>"${curl2file_first}; for i in ${nums_arr.join(" ")}; do echo "<NUM_$i>"${curl2file_next}; ${curlBody} echo "</NUM_$i>"${curl2file_next};${curlSleep}done; echo "</RESULT>"${curl2file_next}`
                    } else { // add || del
                        const curlBody = `for i in ${nums_arr.join(" ")}; do echo "---$i---"${curl2file_next}; ${curlStr+e.target.srvType.value}"${curl2file_next}; echo "OK"${curl2file_next};${curlSleep} done`;
                        result = `echo "*Result*"${curl2file_first}; ${curlBody}${e.target.srvType.value === "7024" ? '; echo "Подождите..."; sleep 10; '+curlBody.replace("_phase1","_phase2") : ''}`
                    }

                } else {  // memcache
                    result = `echo "*Result*"${curl2file_first}; for i in ${nums_arr.join(" ")}; do echo -n "$i - "${curl2file_next};curl -s -o /tmp/null -w "%{http_code}" "http://10.50.194.49:6001/api/v1/$i"${curl2file_next};echo${curl2file_next};${curlSleep} done`
                }
                break;
        
            default:
                break;
        };
        dispatch({
            type: "numProc/set_result",
            text: result,
            isErr: false
        });

    }
    
    const handleChange = (e) => {
        dispatch({
            type: "numProc/set_values",
            name: [e.target.name],
            newVal: e.target.value
        })
    }

    const handleClear = () => {
        dispatch({
            type: "numProc/clear"
        })
    }

    const submitNewSettings = (e) => {
        e.preventDefault();
        try {
            const settingsObj = JSON.parse(e.target.mfbossiSettings.value);
            const init = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: e.target.mfbossiSettings.value})
            }
            fetch(`http://${window.location.hostname}:8000/mfbossiList/`,init)
                .then(response=>{
                    if (response.ok) {
                        mfbossiList = settingsObj;
                        dispatch({
                            type: "numProc/set_result",
                            text: "Настойки загружены",
                            isErr: false,
                            clearResultAfter: 3,
                        })                        
                    } else {
                        dispatch({
                            type: "numProc/set_result",
                            text: "Загрузка настроек не удалась",
                            isErr: true,
                            clearResultAfter: 3
                        })                        
                    }
                })
                .catch(error=>{
                    console.log(error);
                    dispatch({
                        type: "numProc/set_result",
                        text: "Загрузка настроек не удалась",
                        isErr: true,
                        clearResultAfter: 3
                    })                        
                })
                .finally(() => {setSettings((settings => {
                    return {...settings, isOpen: false}
                }))})
        } catch (err) {
            console.log(err);
            setSettings((settings=>{
                return {...settings, errText: err.message, isErr: true, clearAfter: 3}
            }))
        }
    }
 
    const buttons = state.result.text ? ["clear","copy","settings"] : ["settings"];
    const result = state.result.text ? <TextResult text={state.result.text} error={state.result.isErr}/> : null;
    const settingsContent = (
        <form onSubmit={submitNewSettings}>
            <div className="fieldset">
                <textarea
                    style={{"height":"50vh"}}
                    cols={100}
                    name="mfbossiSettings"
                    value={settings.value}
                    onChange={(e)=>{
                        setSettings((settings => {
                            return {...settings, value: e.target.value}
                        }))
                    }}
                ></textarea>
            </div>
            <ButtonsBar
                buttons={["close"]}
                closeFunc={() => {
                    setSettings((settings => {
                        return {...settings, isOpen: false}
                    }))
                }}
            />
        </form>
    );
    const settingsDescription = settings.isErr ? <p style={{color:"red"}}>{settings.errText}</p> : (
        <>
            <p>Формат данных:</p>
            <pre>[                              </pre>
            <pre>    "шаблон команды mfbossi",  </pre>
            <pre>    "описание команды mfbossi" </pre>
            <pre>]                              </pre>
        </>
    )

    const inLine = (
            <div className="optionsList">
                <div><span>Разделитель номеров в строке</span></div>
                <Select
                    selectName="inLineOutSeparator"
                    optList={[[" ","пробел"],[",","запятая"],[";","точка с запятой"],["custom","другой"]]}
                    handleChange={handleChange}
                    curValue={state.values.inLineOutSeparator}
                    isMultiple={false}
                />
                {state.values.inLineOutSeparator === "custom" ?
                    (
                    <React.Fragment>
                            <div><label>Введите разделитель</label></div>
                            <div className="generalInput"><input type="text" name="inLineCustomSeparator" onChange={handleChange} value={state.values.inLineCustomSeparator}/></div>
                    </React.Fragment> 
                    ) : null}
            </div>
    );
    const inColumn = (
        <div className="param-row">
            <div><span>Нет настраиваемых параметров</span></div>
        </div>
    );
    const mfbossi = (
        <div className="optionsList">
            <div><label>Выберите команду</label></div>
            <Select
                selectName="mfbossiCmd"
                optList={mfbossiList}
                handleChange={handleChange}
                curValue={state.values.mfbossiCmd}
                isMultiple={false}
            />
            <div><label htmlFor="mfbossiSleep">Интервал между командами (sleep), с</label></div>
            <div className="generalInput">
                <input 
                    type="number" 
                    name="mfbossiSleep" 
                    id="mfbossiSleep" 
                    value={state.values.mfbossiSleep}
                    onChange={handleChange}
                />
            </div>
            <div><label htmlFor="mfbossi2file">Записать вывод в файл</label></div>
            <Checkbox
                cbName="mfbossi2file" 
                isChecked={state.values.mfbossi2file}
                handleChange={handleChange}
            />
        </div>
    );
    const curl = (
        <div className="optionsList">
            <div><label>Выберите тип</label></div>
            <RadioBtn 
                btnName="curlType" 
                btnList={[["srvMgmt", "Управление услугами"],["memcache", "Проверка в memcache"]]}
                handleChange={handleChange}
                curValue={state.values.curlType}
            />
            {state.values.curlType === "srvMgmt" ? (
                <React.Fragment>
                    <div><label>Выберите действие</label></div>
                    <RadioBtn 
                        btnName="srvMgmt_action" 
                        btnList={[["status", "Проверка"],["add", "Включение"],["del","Отключение"]]}
                        handleChange={handleChange}
                        curValue={state.values.srvMgmt_action}
                    />
                    <div><label>{"Выберите услугу(и)"}</label></div>
                    <Select
                        selectName="srvType"
                        optList={[["7005", "Мультифон (7005)"],["7032", "eMotion (7032)"],["7024","inServices (7024)"],["7048","Мультифон ВАТС (7048)"]]}
                        handleChange={handleChange}
                        curValue={state.values.srvType}
                        isMultiple={state.values.srvMgmt_action==="status"}
                    />
                </React.Fragment>)
                : null
            }
            <div><label htmlFor="curlSleep">Интервал между командами (sleep), с</label></div>
            <div className="generalInput">
                <input 
                    type="number" 
                    name="curlSleep" 
                    id="curlSleep" 
                    value={state.values.curlSleep}
                    onChange={handleChange}
                />
            </div>
            <div><label htmlFor="curlSleep">Записать вывод в файл</label></div>
            <Checkbox
                cbName="curl2file" 
                isChecked={state.values.curl2file}
                handleChange={handleChange}
            />
        </div>
    )
    return (
        <div className="toolContainer">
            <ToolHeader value="Обработка номеров"/>
            <div className="toolBody">
                <form onSubmit={handleNumbers}>
                    <textarea 
                        rows="8" 
                        name="inpNumbers" 
                        placeholder="Введите номера в столбец или в строку через пробел, запятую или точку с запятой"
                        value={state.values.inpNumbers}
                        onChange={handleChange}
                    ></textarea>
                    <div className="fieldset">
                        <Tabs
                            content={[
                                ["В строку",inLine],
                                ["В столбец",inColumn],
                                ["mfbossi",mfbossi],
                                ["curl",curl]
                            ]}
                        />  
                    </div>
                    <ButtonsBar 
                        buttons={buttons} 
                        textToCopy={state.result.text}
                        clearFunc={handleClear}
                        settingsFunc={()=>{
                            setSettings((settings => {
                                return {
                                    ...settings, 
                                    isOpen: true, 
                                    value: JSON.stringify(mfbossiList, null, 4)
                                }
                            }))    
                        }}    
                    />

                </form>
                {result}
                {settings.isOpen 
                ? <Modal
                    title="Настройки"
                    description={settingsDescription}
                    content={settingsContent}
                    closeFunc={()=>{
                        setSettings((settings => {
                            return {...settings, isOpen: false}
                        }))
                    }}
                /> 
                : null}

            </div>
        </div>
    );
    
}
 
export {NumProc};