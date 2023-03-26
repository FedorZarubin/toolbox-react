import React from "react";
import "../css/audit.css";
import ToolHeader from "./ToolHeader.js";
import TextResult from "./TextResult";
import ButtonsBar from "./ButtonsBar";
import Icon from "@mdi/react";
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircle } from "@mdi/js";

const initialValues = {
    domain_name: "",
    dat_beg: "",
    time_beg: "",
    dat_end: "",
    time_end: "",
    searchStr: "",
    case_sens: false,    
};
class Audit extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.savedState ? props.savedState : {
            valuesToRender: Object.assign({},initialValues),
            result: null,
            isErr: false,
            isPending: false
        };
        this.buildAuditCurl = this.buildAuditCurl.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    
    componentWillUnmount(){
        this.props.saveState(this.state)
    }

    buildAuditCurl (e) {
        e.preventDefault();
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
            case_sens: e.target.case_sens.checked
        }
        const valToUse = function (val) {return formValues[val]==="" ? defaultValues[val] : formValues[val].trim()};
        const [domain_name, dat_beg, time_beg, dat_end, time_end] = ["domain_name", "dat_beg", "time_beg", "dat_end", "time_end"].map(valToUse);
        const ts_beg = Date.parse(dat_beg + "T" + time_beg + ".000+03:00")/1000;
        const ts_end = Date.parse(dat_end + "T" + time_end + ".000+03:00")/1000;
        const case_sens = formValues.case_sens ? "" : "i";
        const searchStr = formValues.searchStr==="" ? "" : " | grep  -" + case_sens + "E \"" + formValues.searchStr + "\"";
        const comment = ` # c ${dat_beg} ${time_beg} до ${dat_end} ${time_end}`;
        this.setState({
            isPending: true,
            result: null
        });
        fetch("http://localhost:8000/auditSrv/?host="+domain_name)
            .then(response=>[response.json(),response.ok])
            .then(data=>{
                if (data[1]) data[0].then(result=>{
                    this.setState({
                        isPending: false,
                        isErr: false,
                        result: `curl '${result.addr[0]}?domain=${domain_name}&f=${ts_beg}&t=${ts_end}' | sed -r 's/\\]\\,\\[\\\"([0-9])/\\]\\,\\n\\[\\\"\\1/g'${searchStr}${comment}`,
                        valuesToRender: formValues
                    })
                });
                else data[0].then(result=>{
                    this.setState({
                        isPending: false,
                        isErr: true,
                        result: result.detail,
                        valuesToRender: formValues
                    })

                })
            })
            .catch (error=> {
                console.log(error);
                this.setState({
                    isPending: false,
                    isErr: true,
                    result: error.message,
                    valuesToRender: formValues
                })
            })
    }

    handleChange (e) {
        this.setState((state)=>{
            state.valuesToRender[e.target.name] = e.target.type==="checkbox" ? e.target.checked : e.target.value;
            return {valuesToRender: state.valuesToRender}
        })
    }

    handleClear () {
        this.setState({
            valuesToRender: initialValues,
            result: null,
            isErr: false,
            isPending: false
        })
    }
    
    render () {
        const result = this.state.result? <TextResult text={this.state.result} error={this.state.isErr}/>: null;
        const buttons = this.state.result? ["clear","copy","settings"]:["settings"];
        return (
            <div className="toolContainer">
                <ToolHeader value="Аудит" />
                <div className="toolBody">
                    <form onSubmit={this.buildAuditCurl}>
                        <div className="fieldset">
                            <div id="auditGrid">
                                <div><label htmlFor="domain_name">Домен:</label></div>
                                <div><input type="text" id="domain_name" name="domain_name" placeholder="vo.megafon.ru" value={this.state.valuesToRender.domain_name} onChange={this.handleChange}/></div>
                                <div><label htmlFor="dat_beg" >Начало:</label></div>
                                <div>
                                    <input type="date" name="dat_beg" id="dat_beg" value={this.state.valuesToRender.dat_beg} onChange={this.handleChange}/>
                                    <input type="time" name="time_beg" id="time_beg" step="1" value={this.state.valuesToRender.time_beg} onChange={this.handleChange}/>
                                </div>
                                <div><label htmlFor="dat_end">Конец:</label></div>
                                <div>
                                    <input type="date" name="dat_end" id="dat_end" value={this.state.valuesToRender.dat_end} onChange={this.handleChange}/>
                                    <input type="time" name="time_end" id="time_end" step="1" value={this.state.valuesToRender.time_end} onChange={this.handleChange}/>
                                </div>
                            </div>
                            <div id="options">
                                <div><label htmlFor="searchStr">Поиск в результатах:</label></div><div><input type="text" id="searchStr" name="searchStr" value={this.state.valuesToRender.searchStr} onChange={this.handleChange}/></div>
                                <div><label className="hidden_checkbox_lbl" htmlFor="case_sens">Учитывать регистр</label><input type="checkbox" id="case_sens" name="case_sens" checked={this.state.valuesToRender.case_sens} onChange={this.handleChange}/></div>
                                <div><label htmlFor="case_sens"><Icon path={this.state.valuesToRender.case_sens? mdiCheckboxMarkedCircle: mdiCheckboxBlankCircleOutline} size="30px"/></label></div>
                            </div>
                        </div>
                        <ButtonsBar 
                            isPending={this.state.isPending} 
                            buttons={buttons} 
                            textToCopy={this.state.result}
                            clearFunc={this.handleClear}
                            />
                    </form>
                    {result}
                </div>
            </div>
        )
    }
}

export default Audit