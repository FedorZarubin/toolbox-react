// import logo from '../img/logo.svg';
import '../css/App.css';
import Sidebar from "./Sidebar.js";
import Audit from "./Audit.js";
import PrefsParse from './PrefsParse.js';
import Home from './Home';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar/>
        <div className="content" >
          <Routes>
              <Route path='/' element={<Home/>} />
              <Route path='audit' element={<Audit/>} />
              <Route path='prefsParse' element={<PrefsParse/>} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
