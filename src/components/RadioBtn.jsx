// input props example
// btnName="someName" - will be used to access to the buttons value while the form being analysed
// btnList={[[btn_value_1, btn_title_1],[btn_value_2, btn_title_2]]} - 2 level array with buttons values and titles

import React,{useState} from "react";

function RadioBtn (props) {
    const [state, changeState] = useState(0)
    const buttons = props.btnList.map((item,idx)=>{
        return (
            <React.Fragment>
                <input 
                    className="radioBtn" 
                    type="radio" 
                    id={"btn_"+props.btnName+idx}
                    key= {"btn_"+props.btnName+idx}
                    name={props.btnName} 
                    value={item[0]} 
                    checked={state===idx} 
                    onChange={()=>changeState(idx)}/>
                <label 
                    className="radioBtnLabel" 
                    htmlFor={"btn_"+props.btnName+idx}
                    key= {"lbl_"+props.btnName+idx}
                >
                    {item[1]}
                </label>
            </React.Fragment>    
        )
    })
    return (
        <div transparent="true">
            {buttons}
        </div>

    );
}

export default RadioBtn;