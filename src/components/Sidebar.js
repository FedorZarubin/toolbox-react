import React from "react";
import '../css/App.css';
import sidebarLogo from "../img/logo.svg";

class Sidebar extends React.Component {
    render () {
        return (
            <div className="sidebar">
                <div className="sidebarHeader">
                    <img src={sidebarLogo} className="sidebarIcon" alt="sidebarLogo" />
                    <div className="itemTitle">ITOOLABS ToolBox</div>
                </div>
                <div className="sidebarItemsList">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default Sidebar