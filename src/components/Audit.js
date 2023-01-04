import React from "react";
import "../css/audit.css";
import ToolHeader from "./ToolHeader.js";

class Audit extends React.Component {
    render () {
        return (
            <div className="toolContainer">
                <ToolHeader value="Аудит" />
                <div className="toolBody">
                    <form >
                        <div className="fieldset">
                            <div id="auditGrid">
                                <div><label htmlFor="domain_name">Домен:</label></div><div><input type="text" id="domain_name" name="domain_name" placeholder="vo.megafon.ru"/></div><div></div><div></div>
                                <div><label htmlFor="dat_beg" >Начало:</label></div>
                                <div><input type="date" name="date_beg" id="date_beg" /></div>
                                <div><label htmlFor="time_beg">Время:</label></div><div><input type="time" name="time_beg" id="time_beg" step="1" /></div>
                                <div></div><div className="info"> (по умолчанию - текущий день, время: 00-00-01)</div>
                                <div><label htmlFor="dat_end">Конец:</label></div><div><input type="date" name="dat_end" id="dat_end" /></div>
                                <div><label htmlFor="time_end">Время:</label></div><div><input type="time" name="time_end" id="time_end" step="1" /></div>
                                <div></div><div className="info"> (по умолчанию - текущий день, время: 23-59-59)</div>
                            </div>
                            <div id="options">
                                <div><label htmlFor="searchStr">Поиск в результатах:</label></div><div><input type="text" id="searchStr"/></div>
                                <div><label className="hidden_checkbox_lbl" htmlFor="case_sens">Учитывать регистр</label></div><div><input type="checkbox" id="case_sens" value="1" /></div>
                            </div>
                        </div>
                        <div id="buttons">
                            <input type="submit" className="go" value="Go!" />
                        </div>
                    </form>
                    <div className="text_result" >Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequatur, est praesentium excepturi nisi sunt eaque? Nulla ex nobis asperiores sapiente inventore, magni repellat alias odit molestiae, earum reprehenderit provident velit.</div>
                </div>
            </div>
        )
    }
}

export default Audit