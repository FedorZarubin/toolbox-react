import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../css/audit.css";
import ToolHeader from "./ToolHeader.js";
import TextResult from "./TextResult";
import ButtonsBar from "./ButtonsBar";
import Checkbox from "./Checkbox";
import RadioBtn from "./RadioBtn"
import { Modal } from "./Modal";

const settingsState = {
    settings: {
        isOpen: false,
        isErr: false,
        errText: null,
        value: "",
        clearAfter: null
    }
}

let urls, timeout, checkDomainReq;

function Audit (props) {
    
    const [settings, setSettings] = useState(settingsState.settings);

    const state = useSelector((state => state.audit));
    const dispatch = useDispatch();

    useEffect(()=>{
        if (state.result.clearAfter) {
            setTimeout(()=>{dispatch({type: "audit/set_result", text: null, isErr: false, clearAfter: null})},state.result.clearAfter*1000)
        };
        if (settings.clearAfter) {
            setTimeout(()=>{
                setSettings((settings => {
                    return {...settings, errText: null, isErr: false, clearAfter: null}
                }))
            },settings.clearAfter*1000)
        }
    },[state.result.clearAfter, settings.clearAfter, dispatch])
    
    useEffect(()=>{
        fetch(`http://${window.location.hostname}:8000/auditSrv/`)
        .then(response=>response.json())
        .then(data=>{urls = data})
        .catch (error=> {
            console.log(error);
            dispatch({
                type: "audit/set_result",
                isErr: true,
                text: error.message,
            })
        })
    },[dispatch]);

    const checkDomain = (domain, oldReq) => {
        if (oldReq) oldReq.abort();
        const abortCtl = new AbortController();
        abortCtl.signal.onabort = ()=>{console.log("domain check aborted")};
        // setTimeout(()=>{abortCtl.abort()},2000)
        fetch(`http://${window.location.hostname}:8000/ip/?host=`+domain,{signal: abortCtl.signal})
            .then(response=>[response.json(),response.ok])
            .then(data=>{
                if (data[1]) data[0].then(result=>{
                    dispatch({
                        type: "audit/set_values",
                        values: {ip: result.ip, postProc: urls[result.ip]?.[2]}
                    });
                    if (!urls[result.ip]) {
                        dispatch({
                            type: "audit/set_result",
                            text: "Unknown IP: "+result.ip,
                            isErr: true
                        });
                    } else if (state.result.isErr) {
                        dispatch({
                            type: "audit/set_result",
                            text: null,
                            isErr: false
                        })
                    }
                });
                else data[0].then(result=>{
                    dispatch({
                        type: "audit/set_values",
                        values: {ip: "Error: "+result.detail}
                    });
                    dispatch({
                        type: "audit/set_result",
                        isErr: true,
                        text: "Error: "+result.detail
                    });
                })
            })
            .catch (error=> {
                if (!error.message.includes("abort")) {
                    dispatch({
                        type: "audit/set_values",
                        values: {ip: "Error: "+error.message}
                    });
                    dispatch({
                        type: "audit/set_result",
                        isErr: true,
                        text: "Error: "+error.message
                    });
                }
            })
            .finally(()=>{
                dispatch({
                    type: "audit/set_pending",
                    isPending: false
                })
            })
        return abortCtl    
    }

    const handleChange = (e) => {
        dispatch({
            type: "audit/set_values",
            values: {[e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}
        });
        if (e.target.name === "domain_name") {
            clearTimeout(timeout);
            if (e.target.value === "") {
                dispatch({
                    type: "audit/set_values",
                    values: {ip: null, postProc: "noneed"}
                });
                if (state.result.isErr) {
                    dispatch({
                        type: "audit/set_result",
                        text: null,
                        isErr: false
                    })
                };
                return
            }
            dispatch({
                type: "audit/set_pending",
                isPending: true
            })
            timeout = setTimeout(()=>{
                const newReq = checkDomain(e.target.value, checkDomainReq);
                checkDomainReq = newReq
            },1000)
        }
    };

    const buildAuditCurl = (e) => {
        e.preventDefault();
        if (state.isPanding || (state.values.ip && state.values.ip.includes("Error"))) {
            return
        }
        const defaultValues = {
            domain_name: "vo.megafon.ru",
            dat_beg: new Date().toISOString().slice(0,10),
            time_beg: "00:00:01",
            dat_end: new Date().toISOString().slice(0,10),
            time_end: "23:59:59",
            searchStr: "",
            case_sens: false,
        }
        const formValues = {
            domain_name: e.target.domain_name.value,
            dat_beg: e.target.dat_beg.value,
            time_beg: e.target.time_beg.value,
            dat_end: e.target.dat_end.value,
            time_end: e.target.time_end.value,
            searchStr: e.target.searchStr.value,
            case_sens: e.target.case_sens.checked,
            postProc: e.target.postProc.value
        }
        const postProcOptions = {
            // eslint-disable-next-line
            sed: " | sed -r 's/\\]\\,\\[\\\"([0-9])/\\]\\,\\n\\[\\\"\\1/g'",
            jq: " | jq -c '.[]'",
            noneed: ""
        }
        const valToUse = function (val) {return formValues[val]==="" ? defaultValues[val] : formValues[val].trim()};
        const [domain_name, dat_beg, time_beg, dat_end, time_end] = ["domain_name", "dat_beg", "time_beg", "dat_end", "time_end"].map(valToUse);
        const ts_beg = Date.parse(dat_beg + "T" + time_beg + ".000+03:00")/1000;
        const ts_end = Date.parse(dat_end + "T" + time_end + ".000+03:00")/1000;
        const case_sens = formValues.case_sens ? "" : "i";
        const searchStr = formValues.searchStr==="" ? "" : " | grep  -" + case_sens + "E \"" + formValues.searchStr + "\"";
        const ip = state.values.ip || "193.201.230.178";
        const postProc = postProcOptions[formValues.postProc]
        const comment = ` # c ${dat_beg} ${time_beg} до ${dat_end} ${time_end}`;
        dispatch({
            type: "audit/set_result",
            isErr: false,
            text: `curl '${urls[ip][0]}?domain=${domain_name}&f=${ts_beg}&t=${ts_end}'${postProc}${searchStr}${comment}`,
        });
    }

    const handleClear = () => {dispatch({type: "audit/clear"})}

    const submitNewSettings = (e) => {
        e.preventDefault();
        try {
            const settingsObj = JSON.parse(e.target.urlsSettings.value);
            const init = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: e.target.urlsSettings.value})
            }
            fetch(`http://${window.location.hostname}:8000/auditSrv/`,init)
                .then(response=>{
                    if (response.ok) {
                        urls = settingsObj
                        dispatch({type: "audit/set_result", isErr: false, text: "Настойки загружены", clearAfter: 3})

                    } else {
                        dispatch({type: "audit/set_result", isErr: true, text: "Загрузка настроек не удалась", clearAfter: 3})            
                    }
                })
                .catch(error=>{
                    console.log(error);
                    dispatch({type: "audit/set_result", isErr: true, text: "Загрузка настроек не удалась", clearAfter: 3})
                })
                .finally(() => {
                    setSettings(settings => ({...settings, isOpen: false}))
                })
        } catch (err) {
            console.log(err);
            setSettings(settings => ({...settings, errText: err.message, isErr: true, clearAfter: 3}));
        }
    }
   
    const result = state.result.text ? <TextResult text={state.result.text} error={state.result.isErr}/>: null;
    const buttons = state.result.text ? ["clear","copy","settings"]:["settings"];
    const settingsContent = (
        <form onSubmit={submitNewSettings}>
            <div className="fieldset">
                <textarea
                    style={{"height":"50vh"}}
                    cols={60}
                    name="urlsSettings"
                    value={settings.value}
                    onChange={(e) => {setSettings(settings => ({...settings, value: e.target.value}))}}
                ></textarea>
            </div>
            <ButtonsBar
                buttons={["close"]}
                closeFunc={() => setSettings(settings => ({...settings, isOpen: false}))}
            />
        </form>
    );
    const settingsDescription = settings.isErr ? <p style={{color:"red"}}>{settings.errText}</p> : (
        <>
            <p>Формат данных:</p>
            <pre>"vip_ip_адрес_инсталляции":[</pre>
            <pre>   "audit_url",             </pre>
            <pre>   "название_инсталляции",  </pre>
            <pre>   "noneed|sed|jq (рекомендуемая утилита постобработки)"</pre>
            <pre>]</pre>
        </>
    )

    return (
        <div className="toolContainer">
            <ToolHeader value="Аудит" />
            <div className="toolBody">
                <form onSubmit={buildAuditCurl}>
                    <div className="fieldset">
                        <div className="optionsList">
                            <div><label htmlFor="domain_name">Домен:</label></div>
                            <div className={"generalInput" + (state.values.ip && state.values.ip.includes("Error") ? " error" : "")}>
                                <input type="text" id="domain_name" name="domain_name" placeholder="vo.megafon.ru" size="40" value={state.values.domain_name} onChange={handleChange}/>
                            </div>
                            <div><label htmlFor="dat_beg" >Начало:</label></div>
                            <div className="generalInput">
                                <input type="date" name="dat_beg" id="dat_beg" value={state.values.dat_beg} onChange={handleChange}/>
                                <input type="time" name="time_beg" id="time_beg" step="1" value={state.values.time_beg} onChange={handleChange}/>
                            </div>
                            <div><label htmlFor="dat_end">Конец:</label></div>
                            <div className="generalInput">
                                <input type="date" name="dat_end" id="dat_end" value={state.values.dat_end} onChange={handleChange}/>
                                <input type="time" name="time_end" id="time_end" step="1" value={state.values.time_end} onChange={handleChange}/>
                            </div>
                        </div>
                        <div className="optionsList">
                            <div><label >Постобработка</label></div>
                            <RadioBtn
                                btnName="postProc"
                                btnList={[["sed", "sed"],["jq", "jq"],["noneed","не нужна"]]}
                                handleChange={handleChange}
                                curValue={state.values.postProc}
                            />
                            <div><label htmlFor="searchStr">Поиск в результатах:</label></div>
                            <div className="generalInput"><input type="text" id="searchStr" name="searchStr" value={state.values.searchStr} onChange={handleChange}/></div>
                            <div><label htmlFor="case_sens">Учитывать регистр</label></div>
                            <Checkbox
                                cbName="case_sens"
                                isChecked={state.values.case_sens}
                                handleChange={handleChange}
                            />
                        </div>
                    </div>
                    <ButtonsBar 
                        isPending={state.isPending} 
                        buttons={buttons} 
                        textToCopy={state.result.text}
                        clearFunc={handleClear}
                        settingsFunc={()=>{
                            setSettings(settings => ({...settings, isOpen: true, value: JSON.stringify(urls,null,4)}))
                        }}
                        />
                </form>
                {result}
                {settings.isOpen 
                    ? <Modal
                        title="Настройки"
                        description={settingsDescription}
                        content={settingsContent}
                        closeFunc={() => setSettings(settings => ({...settings, isOpen: false}))}
                    /> 
                    : null}
            </div>
        </div>
    )
}

export {Audit}