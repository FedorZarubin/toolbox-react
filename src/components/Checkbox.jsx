// input props example
// cbName="someName" - will be used to access to the checkbox value while the form being analysed 
// isChecked={true|false} - defines the current state of checkbox
// handleChange={this.handleChange} - function-changehandler

import Icon from "@mdi/react";
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircle } from "@mdi/js";


function Checkbox (props) {
    return (
        <div className="checkBox" style={props.style}>
            <input type="checkbox" id={props.cbName} name={props.cbName} checked={props.isChecked} onChange={(e)=>props.handleChange(e)}/>
            <label htmlFor={props.cbName}><Icon path={props.isChecked? mdiCheckboxMarkedCircle: mdiCheckboxBlankCircleOutline} size="30px"/></label>
        </div>

    );
}

export default Checkbox;