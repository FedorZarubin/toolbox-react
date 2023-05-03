// import logo from '../img/logo.svg';
import '../css/App.css';
import React, {useState} from 'react';
import Sidebar from "./Sidebar.js";
import Audit from "./Audit.jsx";
import PrefsParse from './PrefsParse.js';
import Home from './Home';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import DateConv from './DateConv';
import NumProc from './NumProc';

function App() {
  const [auditState, auditSaveState] = useState(null);
  const [prefsParseState, prefsParseSaveState] = useState(null);
  const [dateConvState, dateConvSaveState] = useState(null);
  const [numProcState, numProcSaveState] = useState(null);
  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar/>
        <div className="content" >
          <Routes>
              <Route path='/' element={<Home/>} />
              <Route path='audit' element={<Audit savedState={auditState} saveState={auditSaveState}/>} />
              <Route path='prefsParse' element={<PrefsParse savedState={prefsParseState} saveState={prefsParseSaveState}/>} />
              <Route path='dateConv' element={<DateConv savedState={dateConvState} saveState={dateConvSaveState}/>} />
              <Route path='numProc' element={<NumProc savedState={numProcState} saveState={numProcSaveState}/>} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
