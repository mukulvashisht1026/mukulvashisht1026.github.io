import React, { Component } from "react";

export default class Navbar extends Component {
  render() {
    return (
      <header>
        <h1 className="navbar-logo">Logo</h1>

        <nav className="nav-links">
          <ul>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Work Experience</a>
            </li>
            <li>
              <a href="#">Projects</a>
            </li>
          </ul>
        </nav>
        <a className="vr" href="#">
          <button>Veiw Resume</button>
        </a>
      </header>
    );
  }
}
