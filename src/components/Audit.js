import React from "react";
import "../css/audit.css";

class Audit extends React.Component {
    render () {
        return (
            <div className="toolContainer">
                <div className="toolHeader">Аудит</div>
                <form >
                    <div id="auditGrid">
                        <div><label>Домен:</label></div><div><input type="text" name="domain_name" placeholder="vo.megafon.ru"/></div><div></div><div></div>
                        <div><label htmlFor="dat_beg" >Начало:</label></div>
                        <div><input type="date" name="date_begin" /></div>
                        <div>Время:</div><div><input type="time" name="time_begin" step="1" /></div>
                        <div></div><div className="info"> (по умолчанию - текущий день, время: 00-00-01)</div>
                        <div><label htmlFor="dat_end">Конец:</label></div><div><input type="date" name="date_end" /></div>
                        <div>Время:</div><div><input type="time" name="time_end" step="1" /></div>
                        <div></div><div className="info"> (по умолчанию - текущий день, время: 23-59-59)</div>
                    </div>
                    <div><label>Поиск в результатах:</label> <input type="text" /></div>
                    <div><input type="checkbox" value="1" /><label className="hidden_checkbox_lbl" htmlFor="case_sens">Учитывать регистр</label></div>
                    <div className="flex">
                        <input type="button" className="go" value="Go!" />
                    </div>
                    <div className="text_result" ></div>
                </form>
            </div>
        )
    }
}

export default Audit