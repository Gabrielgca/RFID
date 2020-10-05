import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import './header.css';
import { FaHome, FaLaptop } from 'react-icons/fa';

function Header() {

  return (
    <AppBar position="static" color={"transparent"}>
      <header id="main-header">
        <div className="header-content">
          <Link to="/">
            <FaHome style={{ marginRight: 10 }} />
          IBTI - Monitoramento
          </Link>
          <Link to="/login">
            <FaLaptop style={{ marginRight: 10 }} />
          Dashboard
          </Link>
        </div>
      </header>
    </AppBar>
  );
}

export default Header;