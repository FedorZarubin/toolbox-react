import React from "react";
import { Link } from "react-router-dom";
import sidebarLogo from "../img/logo.svg";
import '../css/App.css';
import Icon from "@mdi/react";
import { mdiFileTree, mdiHistory, mdiCalendarClockOutline, mdiNumeric} from '@mdi/js'

class Sidebar extends React.Component {
    render () {
        return (
            <div className="sidebar">
                <div className="sidebarHeader">
                    <img src={sidebarLogo} className="sidebarIcon" alt="sidebarLogo" />
                    <div className="itemTitle">ITOOLABS ToolBox</div>
                </div>
                <div className="sidebarItemsList">
                    <div className="sidebarItem" val="audit">
                        <Link to="/audit">
                            <Icon path={mdiHistory} size="40px"/>
                            <div className="itemTitle"><label>Аудит</label></div>
                        </Link>
                    </div>
                    <div className="sidebarItem" val="prefsParse">
                        <Link to="/prefsParse">
                            <Icon path={mdiFileTree} size="40px"/>
                            <div className="itemTitle">Парсер префсов</div>
                        </Link>
                    </div>
                    <div className="sidebarItem" val="dateConv">
                        <Link to="/dateConv">
                            <Icon path={mdiCalendarClockOutline} size="40px"/>
                            <div className="itemTitle">Конвертер даты</div>
                        </Link>
                    </div>
                    <div className="sidebarItem" val="mfTools">
                        <Link to="/numProc">
                            <Icon path={mdiNumeric} size="40px"/>
                            <div className="itemTitle">Обработка номеров</div>
                        </Link>
                    </div>

                </div>
            </div>
        )
    }
}

export default Sidebar