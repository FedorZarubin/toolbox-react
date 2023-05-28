// import logo from '../img/logo.svg';
import '../css/App.css';
import React from 'react';
import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
// import sidebarLogo from "../img/logo.svg";
import Icon from "@mdi/react";
import { mdiFileTree, mdiHistory, mdiCalendarClockOutline, mdiNumeric, mdiXml, mdiGiftOutline} from '@mdi/js'
import Sidebar from "./Sidebar.js";
import Home from './Home';
// import Audit from "./Audit.jsx";
// import PrefsParse from './PrefsParse.js';
// import DateConv from './DateConv';
// import NumProc from './NumProc';
// import XMLParse from './XMLParse';

const toolsIndex = {
  "Audit":{
    path: "audit",
    title: "Аудит",
    icon: mdiHistory
  },
  "PrefsParse":{
    path: "prefsParse",
    title: "Парсер префсов",
    icon: mdiFileTree
  },
  "DateConv":{
    path: "dateConv",
    title: "Конвертер даты",
    icon: mdiCalendarClockOutline
  },
  "NumProc":{
    path: "numProc",
    title: "Обработка номеров",
    icon: mdiNumeric
  },
  "XMLParse":{
    path: "xmlParse",
    title: "XML парсер",
    icon: mdiXml
  },
  "Promocodes":{
    path: "promocodes",
    title: "Промокоды",
    icon: mdiGiftOutline 
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.keys(toolsIndex).reduce((obj,i)=>{return Object.assign(obj,{[i]:null})},{});
  }
  // const [auditState, auditSaveState] = useState(null);
  // const [prefsParseState, prefsParseSaveState] = useState(null);
  // const [dateConvState, dateConvSaveState] = useState(null);
  // const [numProcState, numProcSaveState] = useState(null);
  render () {
    return (
      <div className="App">
        <BrowserRouter>
          <Sidebar>
            {Object.keys(toolsIndex).map(t=>{
              return (
                <div className="sidebarItem" val={toolsIndex[t].path} key={t}>
                  <Link to={"/"+toolsIndex[t].path}>
                      <Icon path={toolsIndex[t].icon} size="40px"/>
                      <div className="itemTitle"><label>{toolsIndex[t].title}</label></div>
                  </Link>
                </div>
              )
            })}
          </Sidebar>
          <div className="content" >
            <Routes>
                <Route path='/' element={<Home/>} />
                {Object.keys(toolsIndex).map(t=>{
                  return (<Route 
                    path={toolsIndex[t].path} 
                    element={React.createElement(require('./'+t)[t],{
                      savedState: this.state[t],
                      saveState: (state)=>(this.setState({[t]:state})),
                      title: toolsIndex[t].title
                    })}
                    key={t} />)
                })}
                {/* <Route path='audit' element={<Audit savedState={auditState} saveState={auditSaveState}/>} />
                <Route path='prefsParse' element={<PrefsParse savedState={prefsParseState} saveState={prefsParseSaveState}/>} />
                <Route path='dateConv' element={<DateConv savedState={dateConvState} saveState={dateConvSaveState}/>} />
                <Route path='numProc' element={<NumProc savedState={numProcState} saveState={numProcSaveState}/>} /> */}
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    );

  }
}

export default App;
