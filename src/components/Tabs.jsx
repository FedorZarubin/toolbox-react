// input props example
// content={[["tabName1", tabContent1],["tabName2", tabContent2]]} - 2 level array with name and content of each tab

import React from "react";
import "../css/Tabs.css"

class Tabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: 0};
        this.onChange = this.onChange.bind(this)
    }
    
    onChange (e) {
        this.setState({value: e.target.value})
    }

    render() { 
        const tabsList = this.props.content.map((item,idx)=>{
            return (
                <div className="tabLabel" key={item[0]} active={(this.state.value==idx).toString()}>
                    <input 
                        type="radio"    
                        id={"tab"+idx} 
                        name="tabs" 
                        value={idx} 
                        checked={this.state.value==idx}
                        onChange={this.onChange}/>
                    <label htmlFor={"tab"+idx}>{item[0]}</label>
                </div>
            ) 
        })
        return (
            <div className="tabs">
                {tabsList}
                <div className="tabContent">{this.props.content[this.state.value][1]}</div>
            </div>
        );
    }
}
 
export default Tabs