import React, {useEffect, useRef, useState} from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "chartjs-adapter-dayjs-4";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { getUserInfo } from './Utilities';

import {
  Button,
  Container,
  Card,
  Row,
  Col,
  Form,
  Spinner,
  Stack,
  Popover,
  Offcanvas,
  OverlayTrigger
} from "react-bootstrap";

import {DismissiblePriceTab} from "./PricesChart";
import {SCHEDULE_START, SCHEDULE_END, NumQuestionsSet} from "./data/constants";
// import ScheduleChart from "./ScheduleChart";
// import RequirementsTab from "./RequirementsTab";
import { ControlTab } from "./ControlTabAlice";
import RequirementsTab from "./RequirementsTabAlice";
import { ExplanationTab } from "./ExplanationTabAlice";
import {PriceTab, ChartNavigation} from "./PricesChart";

import ScheduleChart from "./ScheduleChart";

import { Alice, BobNightShift, defaultModel } from "./data/requirements";

function ScheduleChartCard({ title, tasks, pollingActive, price, open, colorGrey }) {
  const [viewMin, setViewMin] = useState(SCHEDULE_START);
  const [viewMax, setViewMax] = useState(SCHEDULE_END);

  return (
  <Card>
    <Card.Header>
      <Stack direction={"horizontal"} gap={2}>
        <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
        <Form.Label className="fw-semibold fw-semibold me-auto">{title}</Form.Label>
      </Stack>
    </Card.Header>
    <Card.Body>
      {open ? 
        <div className="mt-0 mb-5" style={{height: "26rem"}}>
          {
            pollingActive === false ?
            <Form.Text className="text-muted">{`The bill of the schedule is ${price.toFixed(2)} pence (p).`}</Form.Text>
            : <Form.Text className="text-muted"></Form.Text>
          }
        
        <ScheduleChart tasks={tasks} schedule_start={SCHEDULE_START} view_min={viewMin} view_max={viewMax} colorGrey={colorGrey}/>
        <ChartNavigation viewMin={viewMin} setViewMin={setViewMin} viewMax={viewMax} setViewMax={setViewMax} />
        </div>
        : null
      }
    </Card.Body>
  </Card>
  );
}

function FloatingButtons({ username, api_token, requirements }) {
  const [showDetails, setShowDetails] = useState(false);
  const handleClose = () => setShowDetails(false);

  const popover = (
    <Popover id="popover-basic" style={{maxWidth:"46rem"}}>
        <Popover.Header as="h3">
          <strong>Energy Price Tariff</strong>
        </Popover.Header>
        <Popover.Body style={{width:"46rem"}}>
          <PriceTab username={username} api_token={api_token} />
        </Popover.Body>
    </Popover>
  );

  return (
    <div style={{position:"fixed", top:"80px", left:"20px", width:"2rem"}}>
      <Stack direction="vertical" gap={1} className={"flex-wrap"}>
        <OverlayTrigger trigger="click" placement="right-start" overlay={popover} >
          <Button >Price</Button>
        </OverlayTrigger>
        <Button onClick={()=>setShowDetails(true)}> Scenario Reminder </Button>
      </Stack>

      <Offcanvas show={showDetails} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Scenario Reminder</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p>{`${requirements.brief}`}</p>
          <p>{`Here are ${requirements.name}'s requirements:`}</p>
          <ul>
            {requirements.values.map((requirement, index) => (
                <li key={index}>{requirement.fullTexts}</li>
            ))}
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </div>

  );
}

function App() {
  const {username, api_token} = getUserInfo();
  const queryParameters = new URLSearchParams(window.location.search);
  const CHARACTER = queryParameters.get("character");
  const isControl = localStorage.getItem("isControlGroup") === 'true'? true : false;

  const defaultCharacter = CHARACTER === "bob" ? BobNightShift : Alice;
  const defaultProblem = CHARACTER === "bob" ? defaultModel.Bob : defaultModel.Alice;
  const [defaultTasks, setDefaultTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [oldCost, setOldCost] = useState(0);
  const [newCost, setNewCost] = useState(0);

  const [defaultStatus, setDefaultStatus] = useState([defaultCharacter.values.map(() => false)]);
  const [requirementsStatus, setRequirementsStatus] = useState([defaultCharacter.values.map(() => false)]);

  const [savedSchedules, setSavedSchedules] = useState([]);
  const [pollingActive, setPollingActive] = useState(false);

  const [checkAsked, setCheckAsked] = useState([]);
  const [numQuestionsAsked, setNumQuestionsAsked] = useState(0);

  const [openContrastiveChart, setOpenContrastiveChart] = useState(false);

  const [importPrices, setImportPrices] = useState([]);
  const [exportPrices, setExportPrices] = useState([]);

  function getPrices() {
    const options = {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${username},${api_token}`,
      },
    };
    fetch(`${process.env.REACT_APP_API_URL}/prices`, options)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const buildImportPrices = [];
            const buildExportPrices = [];
            for (const [timestep, datapoint] of data.entries()) {
                const timestamp = SCHEDULE_START.add(timestep, "hour").toString();
                const successorTimestamp = SCHEDULE_START.add(timestep + 1, "hour").toString()
                buildImportPrices.push({x: timestamp, x2: successorTimestamp, y: datapoint.import_price});
                buildExportPrices.push({x: timestamp, x2: successorTimestamp, y: datapoint.export_price});
            }
            setImportPrices(buildImportPrices);
            setExportPrices(buildExportPrices);
        })
        .catch((error) => console.log(error));
  }

  function onCheckAsked(appliance) {
    if (checkAsked.includes(appliance)) {
      setCheckAsked(checkAsked.filter(item => item !== appliance));
    }
    else {
      setCheckAsked([...checkAsked, appliance]);
    }
  }

  useEffect(() => {
    getPrices();
  }, []);

  useEffect(() => {
    let uniqueArray = savedSchedules.filter((value, index) => savedSchedules.indexOf(value) === index);
    setNumQuestionsAsked(uniqueArray.length);
  }, [savedSchedules]);

  return (
    <div>
    <Header prolificID={username} activeTab={CHARACTER==="bob"?4:3}/>
    
    <Row className="py-3">
      <Col xs={1} sm={1}>
        <FloatingButtons username={username} api_token={api_token} requirements={defaultCharacter} />
      </Col>
      <Col className="px-4" xs={10} sm={10}>
        {
          isControl===false ?
          <>
            <h6 className="display-6 py-3">
              Examine each appliance and battery in the Cuttlefish AI schedule
            </h6>
            <p className="lead">
              To understand why an appliance is scheduled at a specific time, you can use the boxes below to ask questions by entering new time windows/cycles for appliance(s).
              Please pay attention to the battery.
            </p>
            <p className="lead">
              An alternative schedule will be generated as an answer to your question, allowing you to compare and contrast the Cuttlefish AI schedule with the alternative schedule that would satisfy your question.
            </p>
          </>
          :
          <>
            <h6 className="display-6 py-3">
              Examine each appliance and battery in the Cuttlefish AI schedule
            </h6>
            <p className="lead">
              To understand why an appliance is scheduled at a specific time, you can hover the mouse on the coloured blocks to see more details, or check the price tab. Please pay attention to the battery.
            </p>
          </>
        }

      </Col>
    </Row>

    <Row className="py-3">
      <Col xs={1} sm={1}>
      </Col>
      { !openContrastiveChart ? 
        <>
        <Col xs={10} sm={10}>
        <Container>
          <ScheduleChartCard title={"Cuttlefish AI schedule for next week"} 
            tasks={defaultTasks} pollingActive={pollingActive} price={oldCost} open={true} colorGrey={true}/>
        </Container>
        {/* <Container className="pt-5">
          <RequirementsTab title={`Checklist for ${defaultCharacter.name}'s requirements - Cuttlefish AI schedule`} requirements={defaultCharacter.values} tasks={defaultTasks} requirementsStatus={defaultStatus} setRequirementsStatus={setDefaultStatus} colour={"light"}/>
        </Container> */}
        </Col>
        </> : null
      }
      { openContrastiveChart && !isControl ? 
        <>
        <Col xs={5} sm={5}>
        <Container>
          <ScheduleChartCard title={"Cuttlefish AI schedule for next week"} 
            tasks={defaultTasks} pollingActive={false} price={oldCost} open={true} colorGrey={true}/>
          
        </Container>
        {/* <Container className="py-3">
          <RequirementsTab title={`Checklist for ${defaultCharacter.name}'s requirements - Cuttlefish AI schedule`} requirements={defaultCharacter.values} tasks={defaultTasks} requirementsStatus={defaultStatus} setRequirementsStatus={setDefaultStatus} colour={"light"}/>
        </Container> */}
        </Col>
        <Col xs={5} sm={5}>
          <Container>
            <ScheduleChartCard title={"Alternative AI schedule for next week"} 
              tasks={tasks} pollingActive={pollingActive} price={newCost} open={openContrastiveChart} colorGrey={false}/>
            
          </Container>
          {/* <Container className="py-3">
            <RequirementsTab title={`Checklist for ${defaultCharacter.name}'s requirements - alternative AI schedule`} requirements={defaultCharacter.values} tasks={tasks} requirementsStatus={requirementsStatus} setRequirementsStatus={setRequirementsStatus} colour={"info"}/>
          </Container> */}
        </Col>
        </> : null
      }

    </Row>

    { openContrastiveChart && !isControl ? 
    <>
      <Row>
        <Col xs={1} sm={1}>
        </Col>
        <Col xs={10} sm={10} className="px-4">
          <ExplanationTab requirements={defaultCharacter} oldTasks={defaultTasks} modifiedTasks={tasks} importPrices={importPrices} exportPrices={exportPrices} oldCost={oldCost} newCost={newCost} pollingActive={pollingActive}/>
        </Col>
      </Row>
    </>
    : null }

    <Row className="py-3">
      <Col xs={1} sm={1}>
      </Col>
      
      {/* <h6 className="display-6 py-3"> Use the boxes below to enter a now window (start time and end time) for running the appliances.</h6> */}
      <Col xs={10} sm={10}>
      { !isControl ?
        <>
          <h6 className={isControl?"hidden":"display-6 py-3"}>
            Ask contrastive questions about Cuttlefish AI schedule
          </h6>
          <p className={isControl?"hidden":"lead"}>
            You can tick the boxes on appliances and enter your time windows/cycles to create an alternative schedule.
            For example, to set the washer at midday on Monday instead of the recommended schedule, tick <mark>Washer</mark> and click on <mark>Add</mark> to select a new time window, then schedule.
          </p>
          <Form>
          <Form.Group className="mb-3">
            <Form.Label className={"fw-semibold"}>I want to ask about...</Form.Label>
            <Stack direction={"horizontal"} gap={2} className={"flex-wrap"}>
              <Form.Check type={"checkbox"} id={"WasherCheck"} label={"Washer"} checked={checkAsked.includes("Washer")} onChange={() => onCheckAsked("Washer")} />
              <Form.Check type={"checkbox"} id={"DryerCheck"} label={"Dryer"} checked={checkAsked.includes("Dryer")} onChange={() => onCheckAsked("Dryer")} />
              <Form.Check type={"checkbox"} id={"DishwasherCheck"} label={"Dishwasher"} checked={checkAsked.includes("Dishwasher")} onChange={() => onCheckAsked("Dishwasher")} />
              <Form.Check type={"checkbox"} id={"VehicleCheck"} label={"Vehicle"} checked={checkAsked.includes("Vehicle")} onChange={() => onCheckAsked("Vehicle")} />
            </Stack>
          </Form.Group>
        </Form>
        </>:null
      }
        <ControlTab username={username} api_token={api_token} checkAsked={checkAsked} setCheckAsked={setCheckAsked} 
        defaultTasks={defaultTasks} setDefaultTasks={setDefaultTasks} tasks={tasks} setTasks={setTasks} 
        setOldCost={setOldCost} setNewCost={setNewCost}
        setOpenContrastiveChart={setOpenContrastiveChart} defaultProblem={defaultProblem} isControl={isControl}
        savedSchedules={savedSchedules} setSavedSchedules={setSavedSchedules} 
        pollingActive={pollingActive} setPollingActive={setPollingActive} />
      </Col>
    </Row>
    
    {
      !isControl ?
      <Row className="py-3">
      <Col xs={1} sm={1}>
      </Col>
      <Col xs={10} sm={10}>
        
        <p className="lead">
          {`You need to ask at least ${NumQuestionsSet} different questions to proceed. Now you have asked ${Math.max(numQuestionsAsked-1, 0)} questions.`}
        </p>
      </Col>
      </Row>
      : null
    }


    <figure className="text-center">
      <Button 
        disabled={(!isControl && NumQuestionsSet>numQuestionsAsked-1)?true:false}
        onClick={() => {window.location.href = (CHARACTER==="bob")? "/survey" : "/tutorial#bob"}}
        >{(CHARACTER==="bob")? "Go to Survey" : "Next Stage"}
      </Button>
    </figure>

    <Footer />
    </div>
  );
}

export default App;
