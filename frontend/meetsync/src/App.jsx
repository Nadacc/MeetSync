import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup';

import Home from './Pages/Home';



function App() {
  return (
    
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path='/home' element={<Home/>}/>
       
      </Routes>
    
  );
}

export default App;
