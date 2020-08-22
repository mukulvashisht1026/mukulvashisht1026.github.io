import React, { Component } from "react";
import Navbar from "../../components/navbar";
import Cube from "../../components/cube";
import Banner from "../../components/banner";
import Skills from "../../components/skills/Skills";
export default class Homepages extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <Banner />
        <Skills />
        {/* <Cube /> */}
      </div>
    );
  }
}
