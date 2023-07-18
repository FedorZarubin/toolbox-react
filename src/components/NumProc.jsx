import React from "react";
import Checkbox from "./Checkbox";
import Tabs from "./Tabs";
import ToolHeader from "./ToolHeader";
import ButtonsBar from "./ButtonsBar";
import TextResult from "./TextResult";
import RadioBtn from "./RadioBtn";
import Select from "./Select";
import { Modal } from "./Modal";
import {_psw} from "../auxiliary/_psw";

const initialValues = {
    inpNumbers: "",
    inLineOutSeparator: " ",
    // mfbossiList: null,
    mfbossiCmd: "activate",
    mfbossiSleep: 1,
    mfbossi2file: false,
    curlType: "srvMgmt",
    srvMgmt_action: "status",
    srvType: "7005",
    curlSleep: 1,
    curl2file: false,
    result: null,
    isErr: false,
    clearResultAfter: null
};

const settingsState = {
    settings: {
        isOpen: false,
        isErr: false,
        errText: null,
        value: "",
        clearAfter: null
    }
}

class NumProc extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.savedState ? this.props.savedState : {...initialValues, mfbossiList: null, ...settingsState};
        this.handleNumbers = this.handleNumbers.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleClear = this.handleClear.bind(this)
        this.submitNewSettings = this.submitNewSettings.bind(this)
    }
    
    componentDidMount () {
        if (this.state.mfbossiList) return;
        fetch(`http://${window.location.hostname}:8000/mfbossiList/`)
        .then(response=>response.json())
        .then(data=>this.setState({mfbossiList:data}))
        .catch(error=>this.setState({mfbossiList:[["error","Не удалось загрузить команды"]]}))
    }

    componentDidUpdate () {
        if (this.state.clearResultAfter) {
            setTimeout(()=>{
                this.setState({clearResultAfter: null, result: null, isErr: false})
            },this.state.clearResultAfter*1000)
        };
        if (this.state.settings.clearAfter) {
            setTimeout(()=>{
                this.setState((state=>{
                    return {settings:{...state.settings, errText: null, isErr: false, clearAfter: null}}
                }))
            },this.state.settings.clearAfter*1000)
        }

    }

    componentWillUnmount () {
        this.props.saveState(this.state)
    }

    handleNumbers (e) {
        e.preventDefault();
        // console.log(new FormData(e.target).getAll("srvType"));

        //preparing source num list
        const data = e.target.inpNumbers.value.trim();
        if (data==="") {
            this.setState({
                result: "Введите номера в тектовое поле!",
                isErr: true
            });
            return;
        };
        const inp_separator = data.match(/\n/)?.[0] || data.match(/;/)?.[0] || data.match(/,/)?.[0] || " ";
        // console.log(inp_separator);
        const nums_arr = data.split(inp_separator).map(num=>{
            num = num.trim().replace(/[^0-9]/g, "");
            if (num.length === 10) num = "7" + num;
            else if (num.match(/^[78]\d{10}$/)) num = num.replace(/^8/, "7");
            else if (num !== "") num = num + " (!Некорректный формат номера!)";
            return num;
        }).filter((num,i,arr)=>num!==""&&arr.lastIndexOf(num)===i); //remove repeated numbers
        if (nums_arr.some(i=>i.match(/Некорректный формат номера/))) { // error
            this.setState({
                result: "В списке есть некорректные номера!\n\n"+nums_arr.join("\n"),
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
        this.setState({
            result: result,
            isErr: false
        });

    }
    
    handleChange (e) {
        this.setState({[e.target.name]: e.target.type==="checkbox" ? e.target.checked : e.target.value})
    }

    handleClear () {
        this.setState(Object.assign({},initialValues))
    }

    submitNewSettings (e) {
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
                        this.setState({
                            result: "Настойки загружены",
                            isErr: false,
                            clearResultAfter: 3,
                            mfbossiList: settingsObj
                        })                        
                        // urls = settingsObj
                        // dispatch({type: "set_result", isErr: false, text: "Настойки загружены", clearAfter: 3})

                    } else {
                        this.setState({
                            result: "Загрузка настроек не удалась",
                            isErr: true,
                            clearResultAfter: 3
                        })                        
                        // dispatch({type: "set_result", isErr: true, text: "Загрузка настроек не удалась", clearAfter: 3})            
                    }
                })
                .catch(error=>{
                    console.log(error);
                    this.setState({
                        result: "Загрузка настроек не удалась",
                        isErr: true,
                        clearResultAfter: 3
                    })                        
                    // dispatch({type: "set_result", isErr: true, text: "Загрузка настроек не удалась", clearAfter: 3})
                })
                .finally(()=>{this.setState((state=>{
                    return {settings:{...state.settings, isOpen: false}}
                }))})
        } catch (err) {
            console.log(err);
            this.setState((state=>{
                return {settings:{...state.settings, errText: err.message, isErr: true, clearAfter: 3}}
            }))

            // dispatch({type: "set_settings",settings:{errText: err.message, isErr: true, clearAfter: 3}});
        }

    }

    render() { 
        const buttons = this.state.result? ["clear","copy","settings"]:["settings"];
        const result = this.state.result? <TextResult text={this.state.result} error={this.state.isErr}/>: null;
        const settingsContent = (
            <form onSubmit={this.submitNewSettings}>
                <div className="fieldset">
                    <textarea
                        style={{"height":"50vh"}}
                        cols={100}
                        name="mfbossiSettings"
                        value={this.state.settings.value}
                        onChange={(e)=>{
                            this.setState((state=>{
                                return {settings:{...state.settings, value: e.target.value}}
                            }))
                        }}
                    ></textarea>
                </div>
                <ButtonsBar
                    buttons={["close"]}
                    closeFunc={()=>{
                        this.setState((state=>{
                            return {settings:{...state.settings, isOpen: false}}
                        }))
                    }}
                />
            </form>
        );
        const settingsDescription = this.state.settings.isErr ? <p style={{color:"red"}}>{this.state.settings.errText}</p> : (
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
                        handleChange={this.handleChange}
                        curValue={this.state.inLineOutSeparator}
                        isMultiple={false}
                    />
                    {this.state.inLineOutSeparator === "custom" ?
                        (
                        <React.Fragment>
                                <div><label>Введите разделитель</label></div>
                                <div className="generalInput"><input type="text" name="inLineCustomSeparator" onChange={this.handleChange} value={this.state.inLineCustomSeparator}/></div>
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
                    optList={this.state.mfbossiList}
                    handleChange={this.handleChange}
                    curValue={this.state.mfbossiCmd}
                    isMultiple={false}
                />
                <div><label htmlFor="mfbossiSleep">Интервал между командами (sleep), с</label></div>
                <div className="generalInput">
                    <input 
                        type="number" 
                        name="mfbossiSleep" 
                        id="mfbossiSleep" 
                        value={this.state.mfbossiSleep}
                        onChange={this.handleChange}
                    />
                </div>
                <div><label htmlFor="mfbossi2file">Записать вывод в файл</label></div>
                <Checkbox
                    cbName="mfbossi2file" 
                    isChecked={this.state.mfbossi2file}
                    handleChange={this.handleChange}
                />
            </div>
        );
        const curl = (
            <div className="optionsList">
                <div><label>Выберите тип</label></div>
                <RadioBtn 
                    btnName="curlType" 
                    btnList={[["srvMgmt", "Управление услугами"],["memcache", "Проверка в memcache"]]}
                    handleChange={this.handleChange}
                    curValue={this.state.curlType}
                />
                {this.state.curlType==="srvMgmt" ? (
                    <React.Fragment>
                        <div><label>Выберите действие</label></div>
                        <RadioBtn 
                            btnName="srvMgmt_action" 
                            btnList={[["status", "Проверка"],["add", "Включение"],["del","Отключение"]]}
                            handleChange={this.handleChange}
                            curValue={this.state.srvMgmt_action}
                        />
                        <div><label>{"Выберите услугу(и)"}</label></div>
                        <Select
                            selectName="srvType"
                            optList={[["7005", "Мультифон (7005)"],["7032", "eMotion (7032)"],["7024","inServices (7024)"],["7048","Мультифон ВАТС (7048)"]]}
                            handleChange={this.handleChange}
                            curValue={this.state.srvType}
                            isMultiple={this.state.srvMgmt_action==="status"}
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
                        value={this.state.curlSleep}
                        onChange={this.handleChange}
                    />
                </div>
                <div><label htmlFor="curlSleep">Записать вывод в файл</label></div>
                <Checkbox
                    cbName="curl2file" 
                    isChecked={this.state.curl2file}
                    handleChange={this.handleChange}
                />
            </div>
        )
        return (
            <div className="toolContainer">
                <ToolHeader value="Обработка номеров"/>
                <div className="toolBody">
                    <form onSubmit={this.handleNumbers}>
                        <textarea 
                            rows="8" 
                            name="inpNumbers" 
                            placeholder="Введите номера в столбец или в строку через пробел, запятую или точку с запятой"
                            value={this.state.inpNumbers}
                            onChange={this.handleChange}
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
                            textToCopy={this.state.result}
                            clearFunc={this.handleClear}
                            settingsFunc={()=>{
                                this.setState((state=>{
                                    return {settings:{...state.settings, isOpen: true, value: JSON.stringify(this.state.mfbossiList,null,4)}}
                                }))    
                            }}    
                        />

                    </form>
                    {result}
                    {this.state.settings.isOpen 
                    ? <Modal
                        title="Настройки"
                        description={settingsDescription}
                        content={settingsContent}
                        closeFunc={()=>{
                            this.setState((state=>{
                                return {settings:{...state.settings, isOpen: false}}
                            }))
                        }}
                    /> 
                    : null}

                </div>
            </div>
        );
    }
}
 
export {NumProc};