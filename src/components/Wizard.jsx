// input props example
// screens={[screen0,screen1,screen2,screen3]} - array of wizard screens content (ReactElements expected)
// activeScreen={values.wizardActiveScreen} - index of screen which must be shown
// id="some_uniq_id" - uniq id (for cases of multiple wizards are to render in one page)
// finishFunc={someFunction} - function for handling data after filling wizard fields (binds to "checkmark" button)


import { mdiCheck, mdiChevronDoubleUp, mdiChevronDown, mdiChevronUp } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";

function Wizard (props) {
    useEffect(()=>{
        const targetScreen = document.querySelector(`#${props.id} .wizardScreenBody.active`);
        const allScreens = document.querySelectorAll(`#${props.id} .wizardScreenBody`);
        const height = Array.prototype.reduce.call(targetScreen.children,(summ,i)=>{return summ+i.clientHeight},0)+20;
        allScreens.forEach((i)=>{i.removeAttribute("style")});
        targetScreen.setAttribute("style",`height:${height}px`)
    })
    const [activeScreen, setActiveScreen] = useState(props.activeScreen || 0);
    return (
        <div className="wizard" id={props.id}>
            {props.screens.map((screen,i)=>(
                <div key={i} className="wizardScreen">
                    <div className="wizardScreenHeader"><span>{"Шаг "+(i+1)}</span></div>
                    <div 
                        className={"wizardScreenBody"+(activeScreen === i ? " active" : "")}
                    >
                        {activeScreen === i && screen}
                    </div>
                    {activeScreen === i && (
                        <div className="wizardScreenCtrl">
                            {i === (props.screens.length-1) && <div onClick={()=>{setActiveScreen(0)}}><Icon path={mdiChevronDoubleUp} size="20px"/></div>}
                            {i !== 0 && <div onClick={()=>{setActiveScreen(activeScreen-1)}}><Icon path={mdiChevronUp} size="20px"/></div>}
                            {i !== (props.screens.length-1) && <div onClick={()=>{setActiveScreen(activeScreen+1)}}><Icon path={mdiChevronDown} size="20px"/></div>}
                            {i === (props.screens.length-1) && props.finishFunc && <div onClick={(e)=>{props.finishFunc(e)}}><Icon path={mdiCheck} size="20px"/></div>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Wizard ;