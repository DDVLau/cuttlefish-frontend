import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  Nav,
} from "react-bootstrap";

import favicon from "../images/favicon.ico";

import "bootstrap/dist/css/bootstrap.min.css";


function Header( { prolificID, activeTab } ) {
  const [show, setShow] = useState(false);

  function onWithdraw() {
    const isWithdraw = window.confirm("Do you want to withdraw from the study?");
    if (isWithdraw) {
      window.location.href = `/complete-page?status=withdrawn`;
    }
  }

  function idleLogout(time) {
    var t;
    window.onload = window.onmousemove = window.onmousedown = window.ontouchstart = window.ontouchmove = window.onclick = window.onkeydown = resetTimer;
    window.addEventListener('scroll', resetTimer, true); // improved; see comments

    function recordInactivity() {
      const recordedTime = localStorage.getItem("inactiveTime");
      let inactiveTime = recordedTime ? recordedTime : "";
      inactiveTime = inactiveTime + Date().toString();
      localStorage.setItem("inactiveTime", inactiveTime);
    }

    function resetTimer() {
      clearTimeout(t);
      t = setTimeout(recordInactivity, time);  // time is in milliseconds
    }
  }

  useEffect(() => {
    document.title = "Cuttlefish | React";
    document.querySelector("link[rel~='icon']").href = favicon;
  }, []);

  useEffect(() => {
    idleLogout(300000);
  },[]);

  useEffect(() => {
    if (!prolificID || prolificID === "unknown user") {
      setShow(true);
    }
  }, [prolificID]);
  
  return (
    <>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <div class="navbar-header">
          <ul class="nav justify-content-start">
            <li class="nav-item">
              <a class="navbar-brand" href="/">
                <span> Cuttlefish</span>
              </a>
            </li>
          </ul>
        </div>

        <ul class="nav nav-underline justify-content-centered">
          <li class="nav-item">
            <a class={activeTab===1?"nav-link active":activeTab>=1?"nav-link":"nav-link disabled"} aria-current={activeTab===1?"page":"true"} href='/'>Consent</a>
          </li>
          <li class="nav-item">
            <a class={activeTab===2?"nav-link active":activeTab>=2?"nav-link":"nav-link disabled"} aria-current={activeTab===2?"page":"true"} href='/tutorial'>Tutorial</a>
          </li>
          <li class="nav-item">
            <a class={activeTab===3?"nav-link active":activeTab>=3?"nav-link":"nav-link disabled"} aria-current={activeTab===3?"page":"true"} href='/tutorial#alice'>Alice</a>
          </li>
          <li class="nav-item">
            <a class={activeTab===4?"nav-link active":activeTab>=4?"nav-link":"nav-link disabled"} aria-current={activeTab===4?"page":"true"} href='/tutorial#bob'>Bob</a>
          </li>
          <li class="nav-item">
            <a class={activeTab===5?"nav-link active":activeTab>=5?"nav-link":"nav-link disabled"} aria-current={activeTab===5?"page":"true"} href='/survey'>Survey</a>
          </li>
        </ul>

        <ul class="nav justify-content-end">
            <li class="nav-item mr-2">
              
            </li>
            <li class="nav-item">
              <a><Button variant="outline-danger" size="sm" onClick={onWithdraw}>Withdraw</Button></a>
            </li>
        </ul>
      </div>
    </nav>
    <p class="text-end">Prolific ID: <strong>{prolificID}</strong></p>

    <Modal label={"logout"} show={show && activeTab!=1}>
      <Modal.Header>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You have not logged in.</p>
        <Nav.Link href="/">
          <Button variant="primary">Go to Home</Button>
        </Nav.Link>
      </Modal.Body>
    </Modal>
    </>
  );
}

export default Header;

