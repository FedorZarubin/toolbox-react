// input props example
// btnName="someName" - will be used to access to the buttons value while the form being analysed
// btnList={[[btn_value_1, btn_title_1],[btn_value_2, btn_title_2]]} - 2 level array with buttons values and titles
// handleChange={this.handleChange} - function-changehandler
// curValue="someValue" - a value to define which button is active

import React from "react";

function RadioBtn (props) {
    const buttons = props.btnList.map((item,idx)=>{
        return (
            <React.Fragment key={props.btnName+idx}>
                <input 
                    className="radioBtn" 
                    type="radio" 
                    id={"btn_"+props.btnName+idx}
                    name={props.btnName} 
                    value={item[0]} 
                    checked={props.curValue===item[0]} 
                    onChange={(e)=>props.handleChange(e)}/>
                <label 
                    className="radioBtnLabel" 
                    htmlFor={"btn_"+props.btnName+idx}
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