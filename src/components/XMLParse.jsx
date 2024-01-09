import React, {useState, useRef} from "react";
import { useSelector, useDispatch } from "react-redux";
import ToolHeader from "./ToolHeader";
import ButtonsBar from "./ButtonsBar";
import TextResult from "./TextResult";
import Select from "./Select";
import Icon from '@mdi/react';
import { mdiFileCodeOutline } from '@mdi/js';

// const initialValues = {
//     inpXML: "",
//     result: null,
//     hash: "",
//     isErr: false,
//     isDragging: false, // local state
//     srvList: null,
//     filterSrv: "",
//     filterStatus: ""
// };
const srvMap = {
    "7005":"Мультифон (7005)",
    "7032":"eMotion (7032)",
    "7024":"inServices (7024)",
    "7048":"Мультифон ВАТС (7048)"
};

function XMLParse() {
    // constructor(props) {
    //     super(props);
    //     this.state = props.savedState ? props.savedState : Object.assign({},initialValues);
    //     this.fileInput = React.createRef();
    //     this.handleChange = this.handleChange.bind(this);
    //     this.handleClear = this.handleClear.bind(this)
    //     this.handleDragNDrop = this.handleDragNDrop.bind(this)
    //     this.handleFiles = this.handleFiles.bind(this)
    //     this.handleXML = this.handleXML.bind(this)
    //     this.buildTable = this.buildTable.bind(this)
    // }
    
    // componentWillUnmount () {
    //     this.props.saveState(this.state)
    // }
    
    const state = useSelector((state => state.xmlParse));
    const dispatch = useDispatch();

    const [isDragging, setDragging] = useState(false);
    const fileInput = useRef(null);

    // handleChange (e) {
    //     this.setState({[e.target.name]: e.target.type==="checkbox" ? e.target.checked : e.target.value})
    // }


    const handleChange = (e) => {
        dispatch({
            type: "xmlParse/set_values",
            name: [e.target.name],
            newVal: e.target.value
        })
    }

    
    // handleClear () {
    //     this.setState(Object.assign({},initialValues))
    // }

    const handleClear = () => {
        dispatch({
            type: "xmlParse/clear"
        })
    }


    const handleDragNDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isDragging = e.type === "dragenter";
        setDragging(isDragging);
        if (e.type === "drop") {handleFiles(e.dataTransfer.files)}
    }

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;
        if (files.length > 1) {
            dispatch({
                type: "xmlParse/set_result",
                isErr: true, 
                text: "Вы патаетесь загрузить несколько файлов. Выберите какой-то один."
            });
            return
        } 
        const file = files[0];
        if (file.type !== "text/xml" && file.type !== "text/plain") {
            dispatch({
                type: "xmlParse/set_result",
                isErr: true, 
                text: "Неверный формат файла"
            });
        } else {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                dispatch({
                    type: "xmlParse/set_values",
                    name: "inpXML",
                    newVal: reader.result
                });
            };
            reader.onerror = () => {
                console.log(reader.error);
                dispatch({
                    type: "xmlParse/set_result",
                    isErr: true, 
                    text: "Ошибка чтения файла (см. консоль)"
                });
            };
        };
    }

    const handleXML = (e) => {
        e.preventDefault();
        const xmlStr = e.target.inpXML.value.replace(/<\?xml.*\?>/g,'');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, "application/xml");
        if (doc.querySelector("parsererror")) {
            console.log(doc.querySelector("parsererror"));
            dispatch({
                type: "xmlParse/set_result",
                isErr: true,
                text: "Что-то не так с введенным XML (подробнее - см. консоль)"
            })
            return
        }
        const srvList = Array.prototype.map.call(doc.querySelectorAll("RESULT > *:first-child > *"),(el)=>el.tagName.slice(4));
        const tableMap = Array.prototype.map.call(doc.querySelectorAll("RESULT > *"),(numEl,i)=>{
            return numEl.tagName.slice(4)+","+Array.prototype.map.call(numEl.children,(srvEl)=>{
                const statusID = srvEl.querySelector("SERVICE_STATUS_ID")?.innerHTML;
                return statusID || srvEl.querySelector("REASON")?.innerHTML || "SOMETHING WRONG!"
            }).join(",")
        }).join("\n");        
        dispatch({
            type: "xmlParse/set_result",
            isErr: false,
            text: tableMap,
            srvList: srvList,
        })
    }

    const buildTable = (rows) => {
        // console.log(rows.length);
        const statusNames = ['NOT ORDERED','ORDERED /WAIT FOR PAYMENT','ORDERED /WAIT FOR ADD','ON','WAIT FOR DELETE','OFF'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>Номер</th>
                        {state.srvList.map(((srv,i)=><th key={i}>{srvMap[srv]}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {rows && rows.split("\n").map((tr,i)=>{
                        return (
                            <tr key={i}>
                                {tr.split(",").map((td,i)=>{
                                    if (i===0) {
                                        return (
                                            <td key={i}>{td}</td>
                                        )
                                    } else {
                                        return (
                                            <td key={i} status-id={td === "4" || td === "6" ? td : "err"}>
                                                {td.length === 1 ? statusNames[Number(td)-1] : td}
                                            </td>
                                        )
                                    }
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    
    const buttons = state.result.text ? ["clear","copy"] : [];
    const rows = state.result.text && !state.result.isErr && state.values.filterSrv && state.values.filterStatus 
        ? state.result.text.split("\n").filter(tr => {
            if (state.values.filterSrv === "any") {
                return Boolean(tr.split(",").slice(1).find(td => state.values.filterStatus === "err" ? (td !== "4" && td !== "6") : td === state.values.filterStatus))
            } else {
                const td = tr.split(",")[state.srvList.indexOf(state.values.filterSrv) + 1];
                return state.values.filterStatus === "err" ? (td !== "4" && td !== "6") : td === state.values.filterStatus
            }
        }).join("\n")
        : state.result.text;
    const result = state.result.text ? <TextResult text={rows} modifyFunc={!state.result.isErr ? buildTable : null} error={state.result.isErr}/> : null;
    
    return (
        <div className="toolContainer">
            <ToolHeader value="XML парсер"/>
            <div className="toolBody">
                <form onSubmit={handleXML}>
                    <textarea 
                        className={isDragging ? "drag" : null}
                        rows="8" 
                        name="inpXML" 
                        placeholder="Скпируйте сюда результат выполнения curl, или перетащите XML файл с результатом, или загрузите этот файл кнопкой ниже"
                        value={state.values.inpXML}
                        onChange={handleChange}
                        onDragEnter={handleDragNDrop}
                        onDragLeave={handleDragNDrop}
                        onDrop={handleDragNDrop}
                    ></textarea>
                    <div className="fieldset">
                        <div className="optionsList">
                            <div className="fileInput">
                                <div><label htmlFor="inpXMLfile">Выберите XML файл</label></div>
                                <div>
                                    <label htmlFor="inpXMLfile"><Icon path={mdiFileCodeOutline} size="30px" /></label>
                                    <input id="inpXMLfile" name="inpXMLfile" type="file" accept=".xml" ref={fileInput} onChange={(e) => handleFiles(e.target.files)}/>
                                </div>
                            </div>
                            <div></div>
                            {
                                state.result.text && !state.result.isErr 
                                    ? (
                                        <React.Fragment>
                                            <div><label>Показать строки, где услуга</label></div>
                                            <div></div>
                                            <Select
                                                selectName="filterSrv"
                                                optList={[["","не задано"]].concat(state.srvList.map(srv=>[srv,srvMap[srv]])).concat([["any","любая"]])}
                                                handleChange={handleChange}
                                                curValue={state.values.filterSrv}
                                                isMultiple={false}
                                            />
                                            <Select
                                                selectName="filterStatus"
                                                optList={[["","не задано"]].concat([["4","включена"],["6","отключена"],["err","другое или ошибка"]])}
                                                handleChange={handleChange}
                                                curValue={state.values.filterStatus}
                                                isMultiple={false}
                                            />

                                        </React.Fragment>
                                    ) : null
                            }
                        </div>
                    </div>
                    <ButtonsBar 
                        isPending={false} 
                        buttons={buttons} 
                        textToCopy={state.result.text && !state.result.isErr ? buildTable(rows) : ""}
                        clearFunc={handleClear}
                        />
                </form>
                {result}
            </div>
        </div>
    );
    
}
 
export {XMLParse};