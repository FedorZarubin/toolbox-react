import React from "react";
import ToolHeader from "./ToolHeader";
import ButtonsBar from "./ButtonsBar";
import TextResult from "./TextResult";
import Select from "./Select";
import Icon from '@mdi/react';
import { mdiFileCodeOutline } from '@mdi/js';

const initialValues = {
    inpXML: "",
    result: null,
    hash: "",
    isErr: false,
    isDragging: false,
    srvList: null,
    filterSrv: "",
    filterStatus: ""
};
const srvMap = {
    "7005":"Мультифон (7005)",
    "7032":"eMotion (7032)",
    "7024":"inServices (7024)",
    "7048":"Мультифон ВАТС (7048)"
};

class XMLParse extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.savedState ? props.savedState : Object.assign({},initialValues);
        this.fileInput = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleClear = this.handleClear.bind(this)
        this.handleDragNDrop = this.handleDragNDrop.bind(this)
        this.handleFiles = this.handleFiles.bind(this)
        this.handleXML = this.handleXML.bind(this)
        this.buildTable = this.buildTable.bind(this)
    }
    
    componentWillUnmount () {
        this.props.saveState(this.state)
    }

    handleChange (e) {
        this.setState({[e.target.name]: e.target.type==="checkbox" ? e.target.checked : e.target.value})
    }
    
    handleClear () {
        this.setState(Object.assign({},initialValues))
    }

    handleDragNDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        const isDragging = e.type === "dragenter";
        this.setState({isDragging: isDragging});
        if (e.type === "drop") {this.handleFiles(e.dataTransfer.files)}
    }

    handleFiles(files) {
        if (files.length > 1) {
            this.setState({isErr: true, result: "Вы патаетесь загрузить несколько файлов. Выберите какой-то один."});
            return
        } 
        const file = files[0];
        if (file.type !== "text/xml" && file.type !== "text/plain") {
            this.setState({isErr: true, result: "Неверный формат файла"});
        } else {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                this.setState({inpXML:reader.result});
            };
            reader.onerror = () => {
                console.log(reader.error);
                this.setState({isErr: true, result: "Ошибка чтения файла (см. консоль)"});
            };
        };
    }

    handleXML (e) {
        e.preventDefault();
        const xmlStr = e.target.inpXML.value.replace(/<\?xml.*\?>/g,'');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, "application/xml");
        if (doc.querySelector("parsererror")) {
            console.log(doc.querySelector("parsererror"));
            this.setState({isErr: true,result: "Что-то не так с введенным XML (подробнее - см. консоль)"})
            return
        }
        const srvList = Array.prototype.map.call(doc.querySelectorAll("RESULT > *:first-child > *"),(el)=>el.tagName.slice(4));
        const tableMap = Array.prototype.map.call(doc.querySelectorAll("RESULT > *"),(numEl,i)=>{
            return numEl.tagName.slice(4)+","+Array.prototype.map.call(numEl.children,(srvEl)=>{
                const statusID = srvEl.querySelector("SERVICE_STATUS_ID")?.innerHTML;
                return statusID || srvEl.querySelector("REASON")?.innerHTML || "SOMETHING WRONG!"
            }).join(",")
        }).join("\n");        
        this.setState({
            isErr: false,
            result: tableMap,
            srvList: srvList,
            filterSrv: "",
            filterStatus: ""
        })
    }

    buildTable (rows) {
        // console.log(rows.length);
        const statusNames = ['NOT ORDERED','ORDERED /WAIT FOR PAYMENT','ORDERED /WAIT FOR ADD','ON','WAIT FOR DELETE','OFF'];
        return (
            <table>
                <thead>
                    <tr>
                        <th>Номер</th>
                        {this.state.srvList.map(((srv,i)=><th key={i}>{srvMap[srv]}</th>))}
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

    render() { 
        const buttons = this.state.result? ["clear","copy"]:[];
        const rows = this.state.result && !this.state.isErr && this.state.filterSrv && this.state.filterStatus 
            ? this.state.result.split("\n").filter(tr=>{
                if (this.state.filterSrv === "any") {
                    return Boolean(tr.split(",").slice(1).find(td=> this.state.filterStatus === "err" ? td!=="4" && td!=="6" : td===this.state.filterStatus))
                } else {
                    const td = tr.split(",")[this.state.srvList.indexOf(this.state.filterSrv)+1];
                    return this.state.filterStatus === "err" ? td!=="4" && td!=="6" : td===this.state.filterStatus
                }
            }).join("\n")
            : this.state.result;
        const result = this.state.result? <TextResult text={rows} modifyFunc={!this.state.isErr ? this.buildTable : null} error={this.state.isErr}/>: null;
        return (
            <div className="toolContainer">
                <ToolHeader value="XML парсер"/>
                <div className="toolBody">
                    <form onSubmit={this.handleXML}>
                        <textarea 
                            className={this.state.isDragging ? "drag" : null}
                            rows="8" 
                            name="inpXML" 
                            placeholder="Скпируйте сюда результат выполнения curl, или перетащите XML файл с результатом, или загрузите этот файл кнопкой ниже"
                            value={this.state.inpXML}
                            onChange={this.handleChange}
                            onDragEnter={this.handleDragNDrop}
                            onDragLeave={this.handleDragNDrop}
                            onDrop={this.handleDragNDrop}
                        ></textarea>
                        <div className="fieldset">
                            <div className="optionsList">
                                <div className="fileInput">
                                    <div><label htmlFor="inpXMLfile">Выберите XML файл</label></div>
                                    <div>
                                        <Icon path={mdiFileCodeOutline} size="30px" />
                                        <input id="inpXMLfile" name="inpXMLfile" type="file" accept=".xml" ref={this.fileInput} onChange={(e) => this.handleFiles(e.target.files)}/>
                                    </div>
                                </div>
                                {
                                    this.state.result && !this.state.isErr 
                                        ? (
                                            <React.Fragment>
                                                <div><label>Показать строки, где услуга</label></div>
                                                <div></div>
                                                <Select
                                                    selectName="filterSrv"
                                                    optList={[["","не задано"]].concat(this.state.srvList.map(srv=>[srv,srvMap[srv]])).concat([["any","любая"]])}
                                                    handleChange={this.handleChange}
                                                    curValue={this.state.filterSrv}
                                                    isMultiple={false}
                                                />
                                                <Select
                                                    selectName="filterStatus"
                                                    optList={[["","не задано"]].concat([["4","включена"],["6","отключена"],["err","другое или ошибка"]])}
                                                    handleChange={this.handleChange}
                                                    curValue={this.state.filterStatus}
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
                            textToCopy={this.state.result && !this.state.isErr ? this.buildTable(rows) : ""}
                            clearFunc={this.handleClear}
                            />
                    </form>
                    {result}
                </div>
            </div>
        );
    }
}
 
export {XMLParse};