import { Component } from "react";
import ButtonsBar from "./ButtonsBar";
import RadioBtn from "./RadioBtn";
import Tabs from "./Tabs";
import TextResult from "./TextResult";
import ToolHeader from "./ToolHeader";

class DateConv extends Component {
    constructor(props) {
        super(props);
        this.state = props.savedState ? props.savedState : {
            ts: "",
            d: "",
            t: "",
            tz1: "msk",
            tz2: "msk",
            result: null,
            isErr: false
        };
        this.handleChange = this.handleChange.bind(this)
        this.handleConvert = this.handleConvert.bind(this)
        this.handleClear = this.handleClear.bind(this)
    }

    handleChange (e) {
        this.setState({[e.target.name]: e.target.value})
    }

    handleConvert (e) {
        e.preventDefault();
        if (e.target.tabs.value==="0") {
            const ts =  e.target?.ts?.value.trim().replace(/[^0-9]/g, "");
            if (!ts) {
                this.setState({
                result: "Не введены данные!",
                isErr: true
                });
                return
            }
            if (ts.length!==10&&ts.length!==13){
                this.setState({
                    result: "Неверная длина timestamp!",
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
            this.setState({
                result: date.toLocaleDateString("ru", options),
                isErr: false
            })
        }
        else {
            const d =  e.target?.d?.value;
            const t =  e.target?.t?.value || "00:00:00";
            const tz_offset = e.target.tz2.value==="msk" ? "+03:00" : "Z";
            if (!d) {
                this.setState({
                    result: "Не введены данные!",
                    isErr: true
                    });
                    return    
            }
            this.setState({
                result: Date.parse(d + "T" + t + ".000"+tz_offset),
                isErr: false
            })
        }
    }

    handleClear () {
        this.setState({
            ts: "",
            d: "",
            t: "",
            tz1: "msk",
            tz2: "msk",
            result: null,
            isErr: false
        })
    }

    render() { 
        const ts2date = (
            <div className="optionsList">
                <div><label htmlFor="ts">Введите timestamp</label></div>
                <div className="generalInput"><input type="text" name="ts" id="ts" value={this.state.ts} onChange={this.handleChange}/></div>
                <div><label>Часовой пояс</label></div>
                <RadioBtn btnName="tz1" btnList={[["msk","МСК"],["utc","UTC"]]} handleChange={this.handleChange} curValue={this.state.tz1}/>
            </div>
        );
        const date2ts = (
            <div className="optionsList">
                <div><label htmlFor="ts">Введите дату и время</label></div>
                <div className="generalInput">
                    <input type="date" name="d" id="d" value={this.state.d} onChange={this.handleChange}/>
                    <input type="time" name="t" id="t" step="1" value={this.state.t} onChange={this.handleChange}/>
                </div>
                <div><label>Часовой пояс</label></div>
                <RadioBtn btnName="tz2" btnList={[["msk","МСК"],["utc","UTC"]]} handleChange={this.handleChange} curValue={this.state.tz2}/>
            </div>
        );
        const buttons = this.state.result? ["clear","copy"]:[];
        const result = this.state.result ? <TextResult text={this.state.result} error={this.state.isErr}/>: null;
        return (
            <div className="toolContainer">
                <ToolHeader value={"Конвертер даты"}/>
                <div className="toolBody">
                    <form onSubmit={this.handleConvert}>
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
                            textToCopy={this.state.result}
                            clearFunc={this.handleClear}
                        />
                    </form>
                    {result}
                </div>
            </div>
        );
    }
}
 
export default DateConv;