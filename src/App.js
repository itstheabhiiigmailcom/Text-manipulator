// import logo from './logo.svg';
import Alert from './Alert';
import './App.css';
import About from './components/About';
import Navbar from './components/Navbar';
import TextForm from './components/TextForm';
import React, {useState} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {

  //usestate to set the dark Mode
  const [mode, setMode] = useState('light');      //whether dark mode is enabled or not
  //usestate to give an alert
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type)=>{
      setAlert({
        msg: message,
        type: type 
      })
      setTimeout(()=>{            // setting timeout to dismiss the alert automatically after 1500 ms
        setAlert(null);
      },1500);
  }

  const toggleMode = ()=>{
    // removeBodyClasses();
    // console.log(cls);
    // document.body.classList.add('bg-'+cls);
      if(mode === 'light'){
        setMode('dark');
        document.body.style.backgroundColor='#042743';
        showAlert("Dark mode has beeen Enabled","success");
        // document.title = "TextUtils - Dark Mode";        // To change the title, when goes from dark to light mode
        // setInterval(()=>{
        //   document.title = "TextUtils is Amazing";
        // },2000)
        // setInterval(()=>{
        //   document.title = "Install TextUtils Now";
        // },1500)
      }
      else{
        setMode('light');
        document.body.style.backgroundColor='white';
        showAlert("Light mode has been enabled", "success");
        document.title = "TextUtils - Light Mode";
      }
  }

  return (
    <>
    <Router>
      <Navbar title="Textutils1" mode={mode} toggleMode = {toggleMode}/>
      <Alert alert={alert}/>
      <div className="container my-3">
      <Routes>
        <Route exact path="/about" element={<About mode={mode}/>}></Route>
        <Route exact path="/" element={<TextForm heading="Try TextUtils - Word counter, Character counter, 
        Remove Extra spaces" mode={mode} showAlert={showAlert}/>}></Route>
      </Routes>
      </div>
      </Router>
    </>
  );
}

export default App;
