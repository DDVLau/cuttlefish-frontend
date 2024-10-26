import React, { useEffect, useState } from "react";

import {
  Container,
  Tab,
  Tabs,
  Card,
  Row,
  Col,
  Figure,
  Button,
  ButtonToolbar, Table, Spinner, 
  Stack,
  Pagination,
  OverlayTrigger,
  Popover,
  Ratio,
  Image
} from "react-bootstrap";

import picture_placeholder from "../images/placeholder.png";
import favicon from "../images/favicon.ico";

import pricetab_img from "../images/PriceTab.png";
import battery_img from "../images/Battery.png";
import addschedule_img from "../images/addSchedule.png";
import addappliances_img from "../images/applianceWindow.png";
import controlgp_img from "../images/ControlGroup.png";

import tariff_gif from "../images/tariff.gif";
import addpreference_gif from "../images/addPreference.gif";
import advancedOptions_gif from "../images/advancedOptions.gif";
import modifypreference_gif from "../images/modifyPreference.gif";
import deletepreference_gif from "../images/deletePreference.gif";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarning,
  faCircleInfo,
  faCopy,
  faXmark
} from '@fortawesome/free-solid-svg-icons'

import Header from "../components/Header";
import Footer from "../components/Footer";
import { DismissiblePriceTab } from "../PricesChart";
import { ControlTabMini } from "../ControlTabAlice";
import { getUserInfo } from '../Utilities';

import "bootstrap/dist/css/bootstrap.min.css";


const TutorialPage1 = () => {
  const popover = (
    <Popover id="popover-basic" style={{maxWidth:"960px"}}>
        <Popover.Body style={{width:"960px"}}>
          <Ratio aspectRatio="16x9">
            <Image src={tariff_gif} fluid />
          </Ratio>
        </Popover.Body>
    </Popover>
  );

  const isControlGroup = localStorage.getItem("isControlGroup")==="true"?true:false;

  return (
    <>
      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
          <h6 className="display-6 px-4">Tutorial: Scenario and Your Task</h6>
          <div className="px-4 py-3">
            <p class={"lh-lg"}>
              Welcome to your future smart home! 
              In this tutorial, you will learn how to use a <em>Cuttlefish AI</em> scheduler to optimise your home appliance usage based on dynamic energy tariffs. 
            </p>

            <h4 class="my-3">Dynamic energy tariff</h4>
            <p class={"lh-lg"}>
              The energy price tariff shows what you will pay and earn for energy in <em>pence (p)</em> per <em>kilowatt-hour (kWh)</em>.
              Prices vary in one-hour slots.
              Pink bars represent the price you pay when importing energy from the grid, while blue bars represent the price you earn when exporting energy to the grid. 
              You can use the <mark>Price</mark> button on the left column to view the price chart.
              <mark>Zoom in</mark> and <mark>Zoom out</mark> buttons allow you to see the price in detail (in hours). See the animation on the right for more details.
            </p> 
          </div>
        </Col>

        <Col xs={2} sm={2}>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
          <Figure className="d-flex justify-content-center align-items-center mx-auto">
            <Figure.Image
              width={640}
              height={640}
              src={pricetab_img}
            />
          </Figure>
        </Col>

        <Col xs={2} sm={2}>
          <OverlayTrigger trigger="hover" placement="left" overlay={popover}>
            <Button>Demo animation</Button>
          </OverlayTrigger>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>
        <Col xs={8} sm={8}>
    
        <h4 class="my-3">Your home battery</h4>
        <p class={"lh-lg"}>
          Your home is equipped with a smart battery that can charge and discharge, allowing you to store energy from the grid for later use in powering your appliances and/or selling back to the grid. The red colour indicates that the battery is charging, while the yellow colour indicates that the battery is discharging. The battery schedule is set automatically by Cuttlefish AI so as to minimise energy costs.
        </p>
        <Figure className="d-flex justify-content-center align-items-center mx-auto">
          <Figure.Image
            width={640}
            height={320}
            src={battery_img}
          />
        </Figure>

        <h4 class="my-3">Home setting</h4>
        <p class={"lh-lg"}>
          You have four smart appliances: a <strong>washer</strong>, a <strong>dryer</strong>, a <strong>dishwasher</strong> and a <strong>electric vehicle</strong> (vehicle for short) with the following assumptions.
        </p>
        <ul>
          <li class={"lh-lg"}>
            A washer cycle takes <strong>2 hours</strong> to complete. It consumes 0.75 kW per hour, which equals <strong>1.5 kWh</strong> per cycle.
          </li>
          <li class={"lh-lg"}>
            A dryer cycle takes <strong>3 hours</strong> to complete. It consumes 1.5 kW per hour, which equals <strong>4.5 kWh</strong> per cycle.
          </li>
          <li class={"lh-lg"}>
            A dishwasher cycle takes <strong>1 hours</strong> to complete. It consumes 1 kW per hour, which equals <strong>1 kWh</strong> per cycle.
          </li>
          <li class={"lh-lg"}>
            A vehicle cycle takes <strong>4 hours</strong> to complete. It consumes 5 kW per hour, which equals <strong>20 kWh</strong> per cycle.
          </li>
        </ul>
        <p class={"lh-lg"}>
          The dynamic tariff matters. 
          For example, the prices on Monday from 18:00 to 21:00 are 24.93 pence, 11.72 pence and 9.45 pence (per kWh), respectively. 
          If powered from the grid, a washer cycle on Monday from 18:00-20:00 would cost 27.49 pence (0.75*24.93 + 0.75*11.72). 
          On the other hand, a washer cycle on Monday from 19:00-21:00 would cost less, at 15.88 pence (0.75*11.72 + 0.75*9.45).
        </p>
        <h4 class="my-3">Your task</h4>

        {
          isControlGroup===true?
          <p class={"lh-lg"}>
            In this study, Cuttlefish AI will determine when appliances operate. 
            Cuttlefish AI will generate a schedule that considers your appliance requirements and energy prices. 
            You have two friends, Alice and Bob, who own identical home appliances but have different requirements due to their professions. 
            Alice and Bob have requested that you review their Cuttlefish AI schedules. 
            In the next section, you will learn how to review the schedule for appliances.
          </p>
        :
          <p class={"lh-lg"}>
            In this study, Cuttlefish AI will determine when appliances operate. 
            Cuttlefish AI will generate a schedule that considers your appliance requirements and energy prices. 
            You have two friends, Alice and Bob, who own identical home appliances but have different requirements due to their professions. 
            Alice and Bob have requested that you review their Cuttlefish AI schedules. 
            You can submit questions to Cuttlefish AI about their schedules. 
            In the next section, you will learn how to submit these questions.
          </p>
        }


        </Col>
        <Col xs={2} sm={2}>
        </Col>
      </Row>
    </>
  );
}

const TutorialPage2 = () => {
  const {username, api_token} = getUserInfo();

  const [tasks, setTasks] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [pollingActive, setPollingActive] = useState(false);

  const popoverAddPreference = (
    <Popover id="popover-basic" style={{maxWidth:"960px"}}>
        <Popover.Body style={{width:"960px"}}>
          <Ratio aspectRatio="16x9">
            <Image src={addpreference_gif} fluid />
          </Ratio>
        </Popover.Body>
    </Popover>
  );

  const popoverAdvancedOptions = (
    <Popover id="popover-basic" style={{maxWidth:"960px"}}>
        <Popover.Body style={{width:"960px"}}>
          <Ratio aspectRatio="16x9">
            <Image src={advancedOptions_gif} fluid />
          </Ratio>
        </Popover.Body>
    </Popover>
  );

  const popoverModifyPreference = (
    <Popover id="popover-basic" style={{maxWidth:"960px"}}>
        <Popover.Body style={{width:"960px"}}>
          <Ratio aspectRatio="16x9">
            <Image src={modifypreference_gif} fluid />
          </Ratio>
        </Popover.Body>
    </Popover>
  );

  const popoverDeletePreference = (
    <Popover id="popover-basic" style={{maxWidth:"960px"}}>
        <Popover.Body style={{width:"960px"}}>
          <Ratio aspectRatio="16x9">
            <Image src={deletepreference_gif} fluid />
          </Ratio>
        </Popover.Body>
    </Popover>
  );

  return (
    <>
      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>

        <h6 className="display-6 py-2">User Manual & Exercise</h6>
        <h5 className="py-2">Part I: How to set up and modify windows and cycles of an appliance?</h5>

          <p class={"lh-lg px-2"}>
            <strong>Step 0: </strong>Check your energy price tariff carefully by clicking on <mark>Price</mark> button on the left hand side of the page. 
            The price changes hourly and it gives you an idea of two key things: the <em>window</em> (the time period when the appliance can run) and the <em>cycles</em> (the number of times the appliance will run within the window).
          </p>
          <p class={"lh-lg px-2"}>
            <strong>Step 1: </strong>
            You can add one cycle to your designed day(s) for an appliance.
            Click the <mark>Add</mark> button to open a new window. 
            Tick the checkboxes before the day, then set the start time and end time. 
            Then, click the <mark>Save</mark> button to save the changes.
          </p>

          </Col>

        <Col xs={2} sm={2}>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
          <Figure className="d-flex justify-content-center align-items-center mx-auto">
            <Figure.Image
              width={900}
              height={900}
              src={addappliances_img}
            />
          </Figure>
        </Col>

        <Col xs={2} sm={2}>
          <Card>
            <Card.Header><FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon> Advanced Options</Card.Header>
            <Card.Body>
              <Card.Text>
                <p>
                You can use <mark>Advanced</mark> button to set a more specific time period (e.g., overnight).
                </p>
                <p>
                Watch the animation for examples.
                </p>
                <OverlayTrigger trigger="hover" placement="left" overlay={popoverAdvancedOptions}>
                  <Button>Demo animation</Button>
                </OverlayTrigger>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
          <p class={"lh-lg px-2"}>
            <strong>Step 2: </strong>
            After saving the windows, a new tag will be added. 
            Once you've completed the setup for all appliances, click <mark>Schedule with Cuttlefish AI</mark> or <mark>Ask Questions</mark>. This will display the Cuttlefish AI schedule in the chart.
          </p>
          <Figure className="d-flex justify-content-center align-items-center mx-auto">
            <Figure.Image
              width={900}
              height={900}
              src={addschedule_img}
            />
          </Figure>

        </Col>

        <Col xs={2} sm={2}>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
          <p class={"lh-lg px-2"}>
            <strong>Step 3: </strong>
            If you're not satisfied with the windows that you have set up, you can modify or delete them.
            Click on a tag to modify a window, or click on the cross icon <FontAwesomeIcon icon={faXmark} color="grey"> </FontAwesomeIcon> to delete it. 
            You can also copy a time window by clicking on the copy icon <FontAwesomeIcon icon={faCopy} color="grey"></FontAwesomeIcon>.
          </p>

        </Col>

        <Col xs={2} sm={2}>
          <Stack direction={"vstack"} gap={1} className="flex-wrap">
            <OverlayTrigger trigger="hover" placement="left" overlay={popoverModifyPreference}>
              <Button>Animation to modify</Button>
            </OverlayTrigger>

            <OverlayTrigger trigger="hover" placement="left" overlay={popoverDeletePreference}>
              <Button>Animation to delete</Button>
            </OverlayTrigger>
          </Stack>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
        
        <h5>Part II: Exercise for Setting up Windows for Washer and Dryer</h5>

        <div className="px-2 py-2">
          <p class={"lh-lg"}>
            <strong>Step 1: </strong> 
            Add a cycle for the washer. You can set your own start time and end time for the washer cycle, e.g., Monday 9:00 - 19:00.
          </p>
          <p class={"lh-lg"}>
            <strong>Step 2: </strong> 
            Similar to the washer, add a cycle for the dryer on the same day.
          </p>

          <p class={"lh-lg"}>
            <strong>Step 3: </strong> 
            Click <mark>Schedule with AI</mark> and review the home schedule chart. 
            You can modify existing cycles or add more if you want. When you're finished, proceed to Alice's Scenario.
          </p>
          </div>
        </Col>

        <Col xs={2} sm={2}>
        </Col>
      </Row>

      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
        <Container>
          <ControlTabMini username={username} api_token={api_token} tasks={tasks} setTasks={setTasks} savedSchedules={savedSchedules} setSavedSchedules={setSavedSchedules} pollingActive={pollingActive} setPollingActive={setPollingActive} />
        </Container>
        </Col>

        <Col xs={2} sm={2}>
          <Card>
            <Card.Header><FontAwesomeIcon icon={faWarning}></FontAwesomeIcon> Tips</Card.Header>
            <Card.Body>
              <Card.Text>
              <p>
              We recommend you start with a larger period instead of a smaller one.
              </p>
              The AI may take some time (usually less than 1 minute) to compute. Please wait if it is processing like this <Spinner animation="border" variant={"secondary"} size="sm"/>.
              <p>
              The AI could keep running and not return any results. In this case, you can set new time windows/cycles and then reschedule to solve this problem.
              </p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      
      <Row>
        <Col xs={2} sm={2}>
        </Col>

        <Col xs={8} sm={8}>
          <p class={"lh-lg"}>
            When you are ready, click the button to see Alice's scenario.
          </p>

          <figure className="text-center">
            <Button href="/tutorial#alice">Next: Alice's Scenario</Button>
          </figure>
        </Col>

        <Col xs={2} sm={2}>
        </Col>
      </Row>

  </>
  );
}

const TutorialPage2Control = () => {
return (
  <>
    <Row>
    <Col xs={2} sm={2}>
    </Col>

    <Col xs={8} sm={8}>

    <h6 className="display-6 py-2">User Manual: How to review the schedule of an appliance? </h6>
      <p class={"lh-lg px-2"}>
        Check your energy price tariff carefully by clicking on <mark>Price</mark> button on the page. 
        The price changes hourly and it gives you an idea of two key things: the <em>window</em> (the time period when the appliance can run) and the <em>cycles</em> (the number of times the appliance will run within the window).
      </p>
      <p class={"lh-lg px-2"}>
        The AI-generated schedule is displayed within the chart. The coloured block indicates the appliance's operation time.
        You can hover the mouse on the block of the chart to see more details.
      </p>

      <Figure className="d-flex justify-content-center align-items-center mx-auto">
        <Figure.Image
          width={900}
          height={900}
          src={controlgp_img}
        />
      </Figure>

      </Col>

    <Col xs={2} sm={2}>
    </Col>
    </Row>
    
    
    <Row>
    <Col xs={2} sm={2}>
    </Col>

    <Col xs={8} sm={8}>
      <p class={"lh-lg"}>
        When you are ready, click the button to see Alice's scenario.
      </p>

      <figure className="text-center">
        <Button href="/tutorial#alice">Next: Alice's Scenario</Button>
      </figure>
    </Col>

    <Col xs={2} sm={2}>
    </Col>
  </Row>
  </>
);
}

const TutorialPageAlice = () => {
  return (
    <div className="container">
      <h6 className="display-6 px-4">Alice's Scenario</h6>
      
      <div className="px-4 pt-3">
      <h5 class="my-3">About Alice</h5>
      <p class={"lh-lg"}>
        Alice works as a consultant for a company. She has a washer, a dryer (i.e., a combo washer and dryer), and a dishwasher at her home. The dryer will run within 6 hours after the washer.
        She also has an electric vehicle (EV), which she can charge at home.
        Her working hours are from 9:00 to 17:00 every day.
        On Wednesdays and Fridays, Alice works from home.
        On the other days, she commutes to work by her EV, leaving home at <strong>7:00</strong> and arriving home at <strong>19:00</strong>.
        Her electric vehicle requires frequent charging due to heavy traffic.
      </p>
      <p class={"lh-lg"}>
        Alice has the following requirements for her appliances:
        <ul>
          <li>The washer and dryer should complete one cycle each next week.</li>
          <li>The washer and dryer should <strong>not</strong> operate from 23:00 to 7:00.</li>
          <li>The dishwasher should run at least two cycles next week. Alice prefers once between Monday and Thursday, and once between Friday and Sunday.</li>
          <li>The electric vehicle should charge before office workdays (Monday, Tuesday and Thursday), finishing before departure from home.</li>
        </ul>
      </p>
      <h5 class="my-3">Your Task</h5>
      <p class={"lh-lg"}>
        Cuttlefish AI has generated a schedule based on Alice's requirements. 
        Alice has invited you to help her review this Cuttlefish AI schedule.
        First, you'll be presented with Alice's schedule. You can ask questions about the appliances and modify their windows to compare differences.
        In the survey, Alice will ask you a few questions about her schedule.
      </p>
      </div>
    </div>
  );
}

const TutorialPageAliceControl = () => {
  return (
    <div className="container">
      <h6 className="display-6 px-4">Alice's Scenario</h6>
      
      <div className="px-4 pt-3">
      <h5 class="my-3">About Alice</h5>
      <p class={"lh-lg"}>
        Alice works as a consultant for a company. She has a washer, a dryer (i.e., a combo washer and dryer), and a dishwasher at her home. The dryer will run within 6 hours after the washer.
        She also has an electric vehicle (EV), which she can charge at home.
        Her working hours are from 9:00 to 17:00 every day.
        On Wednesdays and Fridays, Alice works from home.
        On the other days, she commutes to work by her EV, leaving home at <strong>7:00</strong> and arriving home at <strong>19:00</strong>.
        Her electric vehicle requires frequent charging due to heavy traffic.
      </p>
      <p class={"lh-lg"}>
        Alice has the following requirements for her appliances:
        <ul>
          <li>The washer and dryer should complete one cycle each next week.</li>
          <li>The washer and dryer should <strong>not</strong> operate from 23:00 to 7:00.</li>
          <li>The dishwasher should run at least two cycles next week. Alice prefers once between Monday and Thursday, and once between Friday and Sunday.</li>
          <li>The electric vehicle should charge before office workdays (Monday, Tuesday and Thursday), finishing before departure from home.</li>
        </ul>
      </p>
      <h5 class="my-3">Your Task</h5>
      <p class={"lh-lg"}>
        Cuttlefish AI has generated a schedule based on Alice's requirements. 
        Alice has invited you to help her review this Cuttlefish AI schedule.
        You'll be presented with Alice's schedule.
        In the survey, Alice will ask you a few questions about her schedule.
      </p>
      </div>
    </div>
  );
}

const TutorialPageBob = () => {
  return (
    <div className="container">
      <h6 className="display-6 px-4">Bob's Scenario</h6>
      
      <div className="px-4 pt-3">
      <h5 class="my-3">About Bob</h5>
      <p class={"lh-lg"}>
        Bob is a nurse working in the human health department in urban area. 
        He lives alone and drives his electric car to work every day, which he can charge at home. 
        Bob works in night shifts, and his work hours are from 23:00 to 9:00 (next day). He leaves home at <strong>22:00</strong> and arrives home at <strong>10:00</strong>.
      </p>
      <p class={"lh-lg"}>
        Bob has the following requirements for her appliances:
        <ul>
          <li>The washer and dryer should complete two cycles each next week.</li>
          <li>The washer and dryer can only operate from 07:00 to 15:00. They should not run from 23:00 to 07:00 (late hours) or 15:00 to 23:00 (when Bob is home.) </li>
          <li>The dishwasher should run at least two cycles next week. </li>
          <li>The electric vehicle should charge at least two cycles next week. </li>
          <li>Bob prefers all appliances to run (or charge) once on weekdays and once on weekends.</li>
         </ul>
      </p>
      <h5 class="my-3">What should I do next?</h5>
      <p class={"lh-lg"}>
        Cuttlefish AI has generated a schedule based on Bob's requirements. 
        Bob has invited you to help him review this Cuttlefish AI schedule.
        First, you'll be presented with Bob's schedule. 
        You can ask questions about the appliances and modify their requirements to compare differences.
        In the survey, Bob will ask you a few questions about her schedule.
      </p>
      </div>
    </div>
  );
}

const TutorialPageBobControl = () => {
  return (
    <div className="container">
      <h6 className="display-6 px-4">Bob's Scenario</h6>
      
      <div className="px-4 pt-3">
      <h5 class="my-3">About Bob</h5>
      <p class={"lh-lg"}>
        Bob is a nurse working in the human health department in urban area. 
        He lives alone and drives his electric car to work every day, which he can charge at home. 
        Bob works in night shifts, and his work hours are from 23:00 to 9:00 (next day). He leaves home at <strong>22:00</strong> and arrives home at <strong>10:00</strong>.
      </p>
      <p class={"lh-lg"}>
        Bob has the following requirements for her appliances:
        <ul>
          <li>The washer and dryer should complete two cycles each next week.</li>
          <li>The washer and dryer can only operate from 07:00 to 15:00. They should not run from 23:00 to 07:00 (late hours) or 15:00 to 23:00 (when Bob is home.) </li>
          <li>The dishwasher should run at least two cycles next week. </li>
          <li>The electric vehicle should charge at least two cycles next week. </li>
          <li>Bob prefers all appliances to run (or charge) once on weekdays and once on weekends.</li>
         </ul>
      </p>
      <h5 class="my-3">What should I do next?</h5>
      <p class={"lh-lg"}>
        Cuttlefish AI has generated a schedule based on Bob's requirements. 
        Bob has invited you to help him review this Cuttlefish AI schedule.
        You'll be presented with Bob's schedule. 
        In the survey, Bob will ask you a few questions about her schedule.
      </p>
      </div>
    </div>
  );
}

const TutorialPage = () => {
  const {username, api_token} = getUserInfo();
  const [hash, setHash] = useState(window.location.hash?window.location.hash.substring(1):"");
  const isControlGroup = localStorage.getItem("isControlGroup");

  window.addEventListener(
    "hashchange",
    () => {
      if (window.location.hash) {
        setHash(window.location.hash.substring(1)); //Puts hash in variable, and removes the # character
      }
    },
    false,
  );

  if (hash==="manual") {
    return (
      <>
        <Header prolificID={username} activeTab={2} />
        { isControlGroup==='true'? <TutorialPage2Control />:<TutorialPage2 />}
        <Pagination className="d-flex justify-content-center align-items-center mx-auto">
          <Pagination.Prev onClick={()=>{window.location.href = "/tutorial#tasks"}}/>
          <Pagination.Item key={1} onClick={()=>{window.location.href = "/tutorial#tasks"}} active={false}>{1}</Pagination.Item>
          <Pagination.Item key={2} onClick={null} active={true}>{2}</Pagination.Item>
          <Pagination.Next onClick={null} active={false}/>
        </Pagination>
        <Footer />
        <DismissiblePriceTab username={username} api_token={api_token}/>
      </>
    );
  } else if (hash==="alice") {
    return (
      <>
        <Header prolificID={username} activeTab={3} />
        <Row>
          <Col xs={2} sm={2}>
          </Col>
          <Col xs={8} sm={8}>
          { isControlGroup==='true'? <TutorialPageAliceControl /> : <TutorialPageAlice /> }
          </Col>
          <Col xs={2} sm={2}>
          </Col>
        </Row>
        <figure class="text-center m-5">
          <Button href="/app?character=alice">Get Started</Button>
        </figure>
        <Footer />
      </>
    );
  } else if (hash==="bob") {
    return (
    <>
    <Header prolificID={username} activeTab={4} />
    <Row>
      <Col xs={2} sm={2}>
      </Col>
      <Col xs={8} sm={8}>
      { isControlGroup==='true'? <TutorialPageBobControl /> : <TutorialPageBob /> }
      </Col>
      <Col xs={2} sm={2}>
      </Col>
    </Row>
    <figure class="text-center m-5">
      <Button href="/app?character=bob">Get Started</Button>
    </figure>
    <Footer />
    </>
    );
  } else {
    return (
      <>
        <Header prolificID={username} activeTab={2} />
        <TutorialPage1 />
        <Pagination className="d-flex justify-content-center align-items-center mx-auto">
          <Pagination.Prev onClick={null} active={false}/>
          <Pagination.Item key={1} onClick={null} active={true}>{1}</Pagination.Item>
          <Pagination.Item key={1} onClick={()=>{window.location.href = "/tutorial#manual"}} active={false}>{2}</Pagination.Item>
          <Pagination.Next onClick={()=>{window.location.href = "/tutorial#manual"}}/>
        </Pagination>

        <DismissiblePriceTab username={username} api_token={api_token}/>
        <Footer />
      </>
    );
  }
}

export default TutorialPage;