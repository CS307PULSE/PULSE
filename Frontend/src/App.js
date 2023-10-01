import "./App.css";
import { useState } from "react";
import Login from "./components/Login";
import Profile from "./components/Profile";


function App() {
  const [isLoginClicked, setLoginClicked] = useState(false);

  const handleLoginClick = () => {
    // Perform any login logic here if needed
    // For now, just set the state to true to indicate the button is clicked
    
    setLoginClicked(true);
  };
  return (
    <div>
      {isLoginClicked ? null : <Login onLoginClick={handleLoginClick} />}
      {isLoginClicked ?
        <Profile testParameter={"a"}/>
        : null
      }
      <div></div>
    </div>
  );
}

export default App;
