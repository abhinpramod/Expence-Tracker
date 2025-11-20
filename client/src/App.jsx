import React from 'react'
import Signup from './auth/signup.jsx'
import Login from './auth/login.jsx'
import Dashboard from './dashboard.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux'
import useAuthCheak from './hooks/useauthcheak.js'
import Categories from './Settings/Categories.jsx';
import Budgets from './Settings/Budgets.jsx';
import Report from './Report.jsx';
const App = () => {
  const {loading} = useAuthCheak();
  const { user } = useSelector((state) => state.user);
  console.log(user);
  
  

  if(loading){
    return <div className='flex justify-center items-center min-h-screen'>
      <h1 className='text-3xl font-bold'>Loading...</h1>
    </div>
  }

  return (
    <div>
            <Toaster position="top-center" reverseOrder={false} />

      <Router>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Signup />} />
          <Route path="/login" element={user ? <Dashboard /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
          <Route path="/budgets" element={user ? <Budgets /> : <Login />} />
          <Route path="/categories" element={user ? <Categories /> : <Login />} />
          <Route path="/report" element={user ? <Report /> : <Login />} />

        </Routes>
      </Router>

    </div>
  )
}

export default App
