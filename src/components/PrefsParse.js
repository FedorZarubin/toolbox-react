import React from "react";
import ToolHeader from "./ToolHeader";
import ButtonsBar from "./ButtonsBar";
import Tabs from "./Tabs";
import TextResult from "./TextResult";
import ITooLabs from "../auxiliary/cdata";
import jObjProc from "../auxiliary/prefsFunc"
import Select from "./Select";

class PrefsParse extends React.Component {
    constructor (props) {
        super(props);
        this.state = props.savedState ? props.savedState : {
            prefsToRender: "",
            jsonToRender: "",
            outJson: null,
            editPrefsOption: "All",
            result: null,
            isPending: false,
            isErr: false
        };
        this.handleClear = this.handleClear.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.selectChange = this.selectChange.bind(this);
        this.handleParse = this.handleParse.bind(this);
        this.jsonToPrefs = this.jsonToPrefs.bind(this);
    }
    
    componentWillUnmount(){
        this.props.saveState(this.state)
    }

    handleClear () {
        this.setState({
            prefsToRender: "",
            jsonToRender: "",
            outJson: null,
            editPrefsOption: "All",
            result: null,
            isPending: false,
            isErr: false
        })
    }

    handleChange (e) {
        if (e.target.name==="prefs") this.setState({prefsToRender: e.target.value});
        else this.setState({jsonToRender: e.target.value});
    }

    selectChange (e) {
        this.setState((state)=>{
            state.jsonToRender = JSON.stringify(e.target.value==="All"?state.outJson:{[e.target.value]:state.outJson[e.target.value]},null,4);
            return {
                jsonToRender: state.jsonToRender,
                editPrefsOption: e.target.value
                }
        })
    }

    handleParse (e) {
        e.preventDefault();
        const prefs = e.target.prefs.value;
        const getJson = new Promise((resolve, reject)=>resolve(ITooLabs.CData.decode(prefs)));
        getJson.then((val)=>{this.setState({
            isPending: false,
            outJson: val,
            jsonToRender: JSON.stringify(val,null,4)
            })})
        this.setState({isPending: true});
    }

    jsonToPrefs(e) {
        e.preventDefault();
        let result = "";
        try {
            let command = "";
            var j = JSON.parse(e.target.json.value);
            let data = ITooLabs.CData.encode(j);
            let jObj = this.state.outJson;
            if (jObj["AccountName"]) {
                if (e.target.prefs_block.value === "all") command = "SETACCOUNTPREFS " + jObj["AccountName"];
                else command = "UPDATEACCOUNTPREFS " + jObj["AccountName"];
            } else if (jObj["AdminDomainName"]) {
                if (e.target.prefs_block.value === "all") command = "SETDOMAINSETTINGS <Имя домена>";
                else command = "UPDATEDOMAINSETTINGS <Имя домена>";
            } else if (jObj["CustomProps"]) {
                if (e.target.prefs_block.value === "all") command = "SETACCOUNTDEFAULTPREFS <Имя домена>";
                else command = "UPDATEACCOUNTDEFAULTPREFS <Имя домена>";
            }
            result = command + " " + data;
            this.setState({result: result})
        } catch (err) {
            result = "[ERROR] Could not parse JSON: " + err.message;
            this.setState({result: result, isErr: true})
        }
    }

    render () {
        let [buttons, parsedDataForm] = [[],null];
        const result = this.state.result? <TextResult text={this.state.result} error={this.state.isErr}/>: null;
        if (this.state.outJson) {
            const lookupPrefs = (<div dangerouslySetInnerHTML={{__html: jObjProc(this.state.outJson)}}/>);
            const editPrefs = (
                    <React.Fragment>
                        <div className="optionsList">
                            <div><span>Выберите блок префсов для редактирования: </span></div>
                            <Select
                                selectName="prefs_block"
                                optList={["All"].concat(Object.keys(this.state.outJson)).map((item) => {
                                    return [item,item]
                                })}
                                handleChange={this.selectChange}
                                curValue={this.state.editPrefsOption}
                                isMultiple={false}
                            />
                            {/* <div><select name="prefs_block" onChange={this.selectChange} value={this.state.editPrefsOption}>
                                {["All"].concat(Object.keys(this.state.outJson)).map((item) => {
                                        return <option value={item}>{item}</option>
                                    })}
                            </select></div> */}
                        </div>
                        <textarea 
                            rows='20'
                            name="json" 
                            value={this.state.jsonToRender}
                            onChange={this.handleChange}
                            />
                        <ButtonsBar 
                        isPending={false} 
                        buttons={this.state.result?["copy"]:[]}
                        textToCopy={this.state.result}
                        />
                        {result}
                    </React.Fragment>
            );
            buttons = ["clear"];
            parsedDataForm = (
                <form onSubmit={this.jsonToPrefs}>
                    <div className="fieldset">
                        <Tabs content={[["Просмотр",lookupPrefs],["Редактирование",editPrefs]]}/>
                    </div>
                    {/* <ButtonsBar 
                        isPending={false} 
                        buttons={this.state.result?["copy"]:[]}
                        textToCopy={this.state.result}
                    /> */}
                </form>);
        };
        return (
            <div className="toolContainer">
                <ToolHeader value="Парсер префсов" />
                <div className="toolBody">
                    <form onSubmit={this.handleParse}>
                        <div className="fieldset">
                            <textarea 
                                rows="8" 
                                name="prefs" 
                                placeholder="Введите полное содержание префсов, включая фигурные скобки"
                                value={this.state.prefsToRender}
                                onChange={this.handleChange}
                            ></textarea>
                        </div>
                        <ButtonsBar isPending={this.state.isPending} buttons={buttons} clearFunc={this.handleClear}/>
                    </form>
                    {parsedDataForm}
                    {/* {result} */}
                </div>
            </div>

        )
    }
}

export {PrefsParse}