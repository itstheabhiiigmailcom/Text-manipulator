import Alert from './Alert';
import './App.css';
import About from './components/About';
import Docs from './components/Docs';
import Navbar from './components/Navbar';
import TextForm from './components/TextForm';
import Workspace from './components/Workspace';
import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  //usestate to set the dark Mode
  const [mode, setMode] = useState(() => (localStorage.getItem('textutils.mode') === 'dark' ? 'dark' : 'light'));
  //usestate to give an alert
  const [alert, setAlert] = useState(null);
  const alertTimer = useRef(null);

  useEffect(() => {
    // Bootstrap 5.3 colour modes restyle every component from this one attribute
    document.documentElement.setAttribute('data-bs-theme', mode);
    localStorage.setItem('textutils.mode', mode);
  }, [mode]);

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    clearTimeout(alertTimer.current);
    // setting timeout to dismiss the alert automatically after 2000 ms
    alertTimer.current = setTimeout(() => setAlert(null), 2000);
  };

  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
      document.title = 'Textsmith - Dark Mode';
      showAlert('Dark mode has been enabled', 'success');
    } else {
      setMode('light');
      document.title = 'Textsmith - Light Mode';
      showAlert('Light mode has been enabled', 'success');
    }
  };

  return (
    <>
      <Router>
        <Navbar title="Textsmith" mode={mode} toggleMode={toggleMode} />
        <Alert alert={alert} />
        <div className="my-3">
          <Routes>
            <Route exact path="/about" element={<About />}></Route>
            <Route exact path="/docs" element={<Docs />}></Route>
            <Route
              exact
              path="/tools"
              element={
                <div className="container-fluid tu-container">
                  <Workspace showAlert={showAlert} />
                </div>
              }
            ></Route>
            <Route
              exact
              path="/"
              element={
                <TextForm
                  heading="Try Textsmith - Word counter, Character counter, Remove Extra spaces"
                  mode={mode}
                  showAlert={showAlert}
                />
              }
            ></Route>
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
