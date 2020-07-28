import React, { useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import './header.css';
import firebase from '../../firebase';
import { FaHome, FaLaptop } from 'react-icons/fa';

function Header() {

  return (
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
  );
}

export default Header;