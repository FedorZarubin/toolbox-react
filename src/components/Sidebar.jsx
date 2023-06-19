import React from "react";
import { Link } from "react-router-dom";
import '../css/App.css';
import LogoSvg from "./LogoSvg";

class Sidebar extends React.Component {
    render () {
        return (
            <div className="sidebar">
                <div className="sidebarHeader">
                    <Link to={"/"}>
                        <LogoSvg/>
                        <div className="itemTitle">ITOOLABS ToolBox</div>
                    </Link>
                </div>
                <div className="sidebarItemsList">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default Sidebar