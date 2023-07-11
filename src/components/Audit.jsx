import { useEffect, useReducer } from "react";
import "../css/audit.css";
import ToolHeader from "./ToolHeader.js";
import TextResult from "./TextResult";
import ButtonsBar from "./ButtonsBar";
import Checkbox from "./Checkbox";
import RadioBtn from "./RadioBtn"

const initialValues = {
    values: {
        domain_name: "",
        dat_beg: "",
        time_beg: "",
        dat_end: "",
        time_end: "",
        searchStr: "",
        case_sens: false,
        ip: null,
        postProc: "noneed"    
    },
    result: {
        text: null,
        isErr: false,
    },
    isPending: false
};

const storedState = {...initialValues};

let urls, timeout, checkDomainReq;

const auditReducer = (state,action)=>{
    switch (action.type) {
        case 'set_values': {
            const newValues = {...state.values, ...action.values};
            storedState.values = newValues;
            return {...state, values:newValues}
        }
        case 'set_result': {
            const newResult = {
                text: action.text,
                isErr: action.isErr,
            };
            storedState.result = newResult;
            return {...state, result:newResult}
        }
        case 'clear': {
            storedState.values = {...initialValues.values};
            storedState.result = {...initialValues.result};
            return initialValues
        }
        case 'set_pending': {
            return {...state, isPending: action.isPending}
        }
        default:
          return;
      }
}


function Audit (props) {
    
    const [state, dispatch] = useReducer(auditReducer, props.savedState || initialValues);
    
    useEffect(()=>{
        return function (){
            props.saveState(storedState);
        }
    // eslint-disable-next-line
    },[]);
    
    useEffect(()=>{
        fetch(`http://${window.location.hostname}:8000/auditSrv/`)
        .then(response=>response.json())
        .then(data=>{urls = data})
        .catch (error=> {
            console.log(error);
            dispatch({
                type: "set_result",
                isErr: true,
                text: error.message,
            })
        })
    },[]);

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
                        type: "set_values",
                        values: {ip: result.ip, postProc: urls[result.ip]?.[2]}
                    });
                    if (!urls[result.ip]) {
                        dispatch({
                            type: "set_result",
                            text: "Unknown IP: "+result.ip,
                            isErr: true
                        });
                    } else if (state.result.isErr) {
                        dispatch({
                            type: "set_result",
                            text: null,
                            isErr: false
                        })
                    }
                });
                else data[0].then(result=>{
                    dispatch({
                        type: "set_values",
                        values: {ip: "Error: "+result.detail}
                    });
                    dispatch({
                        type: "set_result",
                        isErr: true,
                        text: "Error: "+result.detail
                    });
                })
            })
            .catch (error=> {
                if (!error.message.includes("abort")) {
                    dispatch({
                        type: "set_values",
                        values: {ip: "Error: "+error.message}
                    });
                    dispatch({
                        type: "set_result",
                        isErr: true,
                        text: "Error: "+error.message
                    });
                }
            })
            .finally(()=>{
                dispatch({
                    type: "set_pending",
                    isPending: false
                })
            })
        return abortCtl    
    }

    const handleChange = (e) => {
        dispatch({
            type: "set_values",
            values: {[e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}
        });
        if (e.target.name === "domain_name") {
            clearTimeout(timeout);
            if (e.target.value === "") {
                dispatch({
                    type: "set_values",
                    values: {ip: null, postProc: "noneed"}
                });
                if (state.result.isErr) {
                    dispatch({
                        type: "set_result",
                        text: null,
                        isErr: false
                    })
                };
                return
            }
            dispatch({
                type: "set_pending",
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
            type: "set_result",
            isErr: false,
            text: `curl '${urls[ip][0]}?domain=${domain_name}&f=${ts_beg}&t=${ts_end}'${postProc}${searchStr}${comment}`,
        });
    }

    const handleClear = () => {dispatch({type: "clear"})}
   
    const result = state.result.text ? <TextResult text={state.result.text} error={state.result.isErr}/>: null;
    const buttons = state.result.text ? ["clear","copy","settings"]:["settings"];
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
                        />
                </form>
                {result}
            </div>
        </div>
    )
}

export {Audit}