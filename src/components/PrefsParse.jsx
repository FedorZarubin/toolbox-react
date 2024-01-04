import React from "react";
import { useSelector, useDispatch } from "react-redux";
import ToolHeader from "./ToolHeader";
import ButtonsBar from "./ButtonsBar";
import Tabs from "./Tabs";
import TextResult from "./TextResult";
import ITooLabs from "../auxiliary/cdata";
import jObjProc from "../auxiliary/prefsFunc"
import Select from "./Select";

function PrefsParse() {
    // constructor (props) {
    //     super(props);
    //     this.state = props.savedState ? props.savedState : {
    //         sourcePrefs: "",
    //         jsonToEdit: "",
    //         outJson: null,
    //         selectedPrefsBlock: "All",
    //         result: null,
    //         isPending: false,
    //         isErr: false
    //     };
    //     this.handleClear = this.handleClear.bind(this);
    //     this.handleChange = this.handleChange.bind(this);
    //     this.handleParse = this.handleParse.bind(this);
    //     this.jsonToPrefs = this.jsonToPrefs.bind(this);
    // }
    
    // componentWillUnmount(){
    //     this.props.saveState(this.state)
    // }

    const state = useSelector((state => state.prefsParse));
    const dispatch = useDispatch();

    const handleClear = () => {
        dispatch({
            type: "prefsParse/clear"
        })
    }

    const handleChange = (e) => {
        // if (e.target.name==="prefs") this.setState({sourcePrefs: e.target.value});
        // else this.setState({jsonToEdit: e.target.value});
        dispatch({
            type: "prefsParse/set_values",
            name: e.target.name,
            newVal: e.target.value
        })
    }

    // selectChange (e) {
    //     this.setState((state)=>{
    //         state.jsonToEdit = JSON.stringify(e.target.value==="All" ? state.outJson : { [e.target.value]: state.outJson[e.target.value] }, null, 4);
    //         return {
    //             jsonToEdit: state.jsonToEdit,
    //             selectedPrefsBlock: e.target.value
    //             }
    //     })
    // }

    const handleParse = (e) => {
        e.preventDefault();
        const prefs = e.target.sourcePrefs.value;
        dispatch({ 
            type: "prefsParse/set_pending",
            isPending: true
        });
        // const getJson = new Promise((resolve, reject) => resolve(ITooLabs.CData.decode(prefs)));
        // getJson.then((val)=>{this.setState({
        //     isPending: false,
        //     outJson: val,
        //     jsonToEdit: JSON.stringify(val,null,4)
        //     })})
        setTimeout(() => {
            dispatch({
                type: "prefsParse/parse",
                outJson: ITooLabs.CData.decode(prefs)
            })
        })
    }

    const jsonToPrefs = (e) => {
        e.preventDefault();
        let result = "";
        try {
            let command = "";
            let j = JSON.parse(e.target.json.value);
            let data = ITooLabs.CData.encode(j);
            let jObj = state.outJson;
            if (jObj["AccountName"]) {
                if (e.target.selectedPrefsBlock.value === "all") command = "SETACCOUNTPREFS " + jObj["AccountName"];
                else command = "UPDATEACCOUNTPREFS " + jObj["AccountName"];
            } else if (jObj["AdminDomainName"]) {
                if (e.target.selectedPrefsBlock.value === "all") command = "SETDOMAINSETTINGS <Имя домена>";
                else command = "UPDATEDOMAINSETTINGS <Имя домена>";
            } else if (jObj["CustomProps"]) {
                if (e.target.selectedPrefsBlock.value === "all") command = "SETACCOUNTDEFAULTPREFS <Имя домена>";
                else command = "UPDATEACCOUNTDEFAULTPREFS <Имя домена>";
            }
            result = command + " " + data;
            dispatch({
                type: "prefsParse/set_result",
                text: result,
                isErr: false
            })
        } catch (err) {
            result = "[ERROR] Could not parse JSON: " + err.message;
            dispatch({
                type: "prefsParse/set_result",
                text: result, 
                isErr: true
            })
        }
    }

    
    let buttons = [], 
        parsedDataForm = null;
    const result = state.result.text ? <TextResult text={state.result.text} error={state.result.isErr}/> : null;
    if (state.outJson) {
        const lookupPrefs = (<div dangerouslySetInnerHTML={{__html: jObjProc(state.outJson)}}/>);
        const editPrefs = (
                <React.Fragment>
                    <div className="optionsList">
                        <div><span>Выберите блок префсов для редактирования: </span></div>
                        <Select
                            selectName="selectedPrefsBlock"
                            optList={["All"].concat(Object.keys(state.outJson)).map((item) => {
                                return [item,item]
                            })}
                            handleChange={handleChange}
                            curValue={state.values.selectedPrefsBlock}
                            isMultiple={false}
                        />
                    </div>
                    <textarea 
                        rows='20'
                        name="json" 
                        value={state.values.jsonToEdit}
                        onChange={handleChange}
                        />
                    <ButtonsBar 
                    isPending={false} 
                    buttons={state.result.text ? ["copy"] : []}
                    textToCopy={state.result.text}
                    />
                    {result}
                </React.Fragment>
        );
        buttons = ["clear"];
        parsedDataForm = (
            <form onSubmit={jsonToPrefs}>
                <div className="fieldset">
                    <Tabs content={[["Просмотр",lookupPrefs],["Редактирование",editPrefs]]}/>
                </div>
            </form>
        );
    };
    return (
        <div className="toolContainer">
            <ToolHeader value="Парсер префсов" />
            <div className="toolBody">
                <form onSubmit={handleParse}>
                    <div className="fieldset">
                        <textarea 
                            rows="8" 
                            name="sourcePrefs" 
                            placeholder="Введите полное содержание префсов, включая фигурные скобки"
                            value={state.values.sourcePrefs}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <ButtonsBar isPending={state.isPending} buttons={buttons} clearFunc={handleClear}/>
                </form>
                {parsedDataForm}
            </div>
        </div>

    )
    
}

export {PrefsParse}