import '../css/App.css';
import React, {useState} from 'react';
import {Link, createBrowserRouter, RouterProvider, Outlet, Navigate} from "react-router-dom";
import Icon from "@mdi/react";
import { mdiFileTree, mdiHistory, mdiCalendarClockOutline, mdiNumeric, mdiXml, mdiGiftOutline, mdiBookCogOutline} from '@mdi/js'
import Sidebar from "./Sidebar";
import Home from './Home';

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
  },
  "IndividualTariff":{
    path: "individualTariff",
    title: "Конструктор ИТП",
    icon: mdiBookCogOutline 
  }
};

function Layout () {
  return (
    <div className="App">
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
        <Outlet/>
      </div>
    </div>
  )
}


function App () {
  const initialState = Object.keys(toolsIndex).reduce((obj,i)=>{return Object.assign(obj,{[i]:null})},{});
  const [state, setState] = useState(initialState);
  
  const toolsRoutes = Object.keys(toolsIndex).map(t=>{
    return { 
      path: toolsIndex[t].path,
      element: React.createElement(require('./'+t)[t],{
        savedState: state[t],
        saveState: (toolState)=>(setState({...state, [t]:toolState})),
        title: toolsIndex[t].title
      })
      }
  })

  const router = createBrowserRouter([
    {
      element: <Layout/>,
      children: [
        { path: "/", element: <Home/> },
        ...toolsRoutes,
        { path: "*", element: <Navigate to={"/"}/> },
      ]
    }
  ]);
    
  return (

    // <div className="App">
    //   <BrowserRouter>
    //     <Sidebar>
    //       {Object.keys(toolsIndex).map(t=>{
    //         return (
    //           <div className="sidebarItem" val={toolsIndex[t].path} key={t}>
    //             <Link to={"/"+toolsIndex[t].path}>
    //                 <Icon path={toolsIndex[t].icon} size="40px"/>
    //                 <div className="itemTitle"><label>{toolsIndex[t].title}</label></div>
    //             </Link>
    //           </div>
    //         )
    //       })}
    //     </Sidebar>
    //     <div className="content" >
    //       <Routes>
    //           <Route path='/' element={<Home/>} />
    //           {Object.keys(toolsIndex).map(t=>{
    //             return (<Route 
    //               path={toolsIndex[t].path} 
    //               element={React.createElement(require('./'+t)[t],{
    //                 savedState: this.state[t],
    //                 saveState: (state)=>(this.setState({[t]:state})),
    //                 title: toolsIndex[t].title
    //               })}
    //               key={t} />)
    //           })}
    //           {/* <Route path='audit' element={<Audit savedState={auditState} saveState={auditSaveState}/>} />
    //           <Route path='prefsParse' element={<PrefsParse savedState={prefsParseState} saveState={prefsParseSaveState}/>} />
    //           <Route path='dateConv' element={<DateConv savedState={dateConvState} saveState={dateConvSaveState}/>} />
    //           <Route path='numProc' element={<NumProc savedState={numProcState} saveState={numProcSaveState}/>} /> */}
    //       </Routes>
    //     </div>
    //   </BrowserRouter>
    // </div>
    
    // <BrowserRouter>
    //   <Routes>
    //     <Route element={<Layout />}>
    //       <Route path='/' element={<Home/>} />
    //       {Object.keys(toolsIndex).map(t=>{
    //         return (<Route 
    //           path={toolsIndex[t].path} 
    //           element={React.createElement(require('./'+t)[t],{
    //             savedState: this.state[t],
    //             saveState: (state)=>(this.setState({[t]:state})),
    //             title: toolsIndex[t].title
    //           })}
    //           key={t} />)
    //       })}
    //     </Route>
    //   </Routes>
    // </BrowserRouter>

    <RouterProvider router={router} />
  );

  
}

export default App;
