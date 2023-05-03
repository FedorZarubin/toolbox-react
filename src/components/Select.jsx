// input props example
// selectName="someName" - will be used to access to the select value while the form being analysed
// optList={[[opt_value_1, opt_title_1],[opt_value_2, opt_title_2]]} - 2 level array with options values and titles
// handleChange={this.handleChange} - function-changehandler
// curValue="someValue" - a value to define which option is selected
// isMultiple={true|false} - defines "multiple" attr value

import React, { useState, useEffect, useCallback } from "react";
import Icon from "@mdi/react";
import { mdiMenuDown, mdiMenuUp } from "@mdi/js";
import Checkbox from "./Checkbox";

function Select(props) {
    const [isOpen,openToggle] = useState(false);
    const curValue = props.isMultiple 
        ? (Array.isArray(props.curValue) ? props.curValue : [props.curValue])
        : (Array.isArray(props.curValue) ? props.curValue[0] : props.curValue);
    const optList = props.optList || [[]];
    const selectElementText = props.isMultiple ? "Выбрано опций: "+curValue.length : optList.find(item=>item[0]===curValue)?.[1];
    const closeList = useCallback(()=>{openToggle(false)},[]);
    const closeListParams = {once:true,capture:false,passive:true};
    useEffect(()=>{
        if (props.isMultiple&&!Array.isArray(props.curValue)) {
            props.handleChange({
                target: {
                    name: props.selectName,
                    type: "select",
                    value: [optList[0][0]] 
                    } 
            })
        } else if (!props.isMultiple&&Array.isArray(props.curValue)) {
            props.handleChange({
                target: {
                    name: props.selectName,
                    type: "select",
                    value: optList[0][0] 
                    } 
            })
        }
    });
    return (
        <div className="selectBlock">
            <div 
                className="selectHeader" 
                onClick={(e)=>{
                    e.stopPropagation();
                    openToggle(!isOpen);
                    if (!isOpen) {
                        document.body.addEventListener("click",closeList,closeListParams)
                    } else {
                        document.body.removeEventListener("click",closeList,closeListParams)
                    }
                }}
            >
                <div><label>{selectElementText}</label></div>
                <div><label><Icon path={isOpen ? mdiMenuUp : mdiMenuDown} size="30px"/></label></div>
            </div>
            <div className="optionsContainer" style={{visibility: isOpen ? "visible" : "hidden"}}>
                {!props.isMultiple 
                    ? optList.map((item,idx)=>{
                        return (
                            <div 
                                className="selectOption" 
                                key={props.selectName+idx} 
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    document.querySelector("body").removeEventListener("click",closeList,closeListParams);
                                    props.handleChange(
                                        {target: {
                                            name: props.selectName,
                                            type: "select",
                                            value: item[0] 
                                        }}
                                    );
                                    openToggle(false)
                                    }}
                            >
                                <div><label>{item[1]}</label></div>
                                <div></div>
                            </div>
                        )
                    }) 
                    : optList.map((item,idx)=>{
                        return (
                            <div 
                                className="selectOption" 
                                key={props.selectName+idx}
                                // style={{visibility: isOpen ? "visible" : "hidden"}}
                                onClick={(e)=>e.stopPropagation()}
                            >
                                <div><label htmlFor={item[0]}>{item[1]}</label></div>
                                <Checkbox 
                                    cbName={item[0]}
                                    isChecked={curValue.includes(item[0])}
                                    handleChange={(e)=>{
                                        const newVal = e.target.checked ? curValue.concat([item[0]]) : curValue.filter((i)=>i!==item[0]);
                                        props.handleChange(
                                            {
                                                target: {
                                                    name: props.selectName,
                                                    type: "select",
                                                    value: newVal 
                                                    } 
                                            }
                                        )
                                    }}
                                />
                            </div>
                    )
                })}
            </div>
            <select
                style={{display:"none"}}
                name={props.selectName} 
                value={curValue}
                multiple={props.isMultiple}
                onChange={()=>{}}
            >
                {optList.map((item,idx)=>(
                    <option value={item[0]} key={idx}></option>
                ))}
            </select>
        </div>
    );
}

export default Select;