import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { 
  Badge, 
  Button,
  ButtonToolbar,
  ButtonGroup,
  CloseButton, 
  Container, 
  Form, 
  InputGroup, 
  ListGroup,
  Modal, 
  Stack, 
  Spinner, 
  Pagination, 
  Placeholder,
  Card 
} from "react-bootstrap";
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { Col, Row } from 'react-bootstrap';
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMagnifyingGlassMinus, faMagnifyingGlassPlus, faArrowRotateRight, faArrowLeft, faArrowRight,
    faCircleInfo, faClock,
    faBoltLightning,
    faCircleCheck, faCircleXmark,
    faWarning,
    faCopy,
} from '@fortawesome/free-solid-svg-icons'

import { range } from "./Utilities";
import { type } from "@testing-library/user-event/dist/type";

import {PriceTab, ChartNavigation} from "./PricesChart";
import ScheduleChart from "./ScheduleChart";

import { DAYS, HOURS, APPLIANCES, SCHEDULE_START, SCHEDULE_END, PARAMS } from "./data/constants";


function WindowModal({ isVisible, onCancel, onSave, window, setWindow, minDuration=1, isStrictMode=false }) {
    const startDayOptions = DAYS.map((value, index) =>
        <option key={index} value={index}>{value}</option>
    );

    const startHourOptions = HOURS.slice(0, 24).map((value, index) =>
        <option key={index} value={index}>{value}</option>
    );

    const endDayOptions = DAYS.map((value, index) =>
        <option key={index} value={index} disabled={window.startDay > index || (window.startDay === index && window.startHour === 23 && index !== 6)}>{value}</option>
    );

    const endHourOptions = (window.endDay === 6 ? HOURS : HOURS.slice(0, 24)).map((value, index) =>
        <option key={index} value={index} disabled={window.startDay > window.endDay || (window.startDay === window.endDay && (index - minDuration + 1) <= window.startHour) || (window.startDay < window.endDay && 24*(window.endDay-window.startDay)+index-window.startHour<minDuration)}>{value}</option>
    );

    const isWindowInvalid = window.startDay > window.endDay || 
    (window.startDay === window.endDay && window.startHour >= window.endHour) || 
    (window.startDay === window.endDay && (window.endHour - minDuration + 1) <= window.startHour) || 
    (window.startDay < window.endDay && 24*(window.endDay-window.startDay)+window.endHour-window.startHour<minDuration);

    function updateWindow(newWindow) {
        let newEndDay = newWindow.endDay < newWindow.startDay ? newWindow.startDay : newWindow.endDay;
        let newEndHour = (newEndDay === newWindow.startDay && newWindow.endHour <= newWindow.startHour && (newWindow.endHour - minDuration + 1) >= window.startHour) ? newWindow.startHour + minDuration : newWindow.endHour;
        if (isStrictMode === true) {
            newEndDay = newWindow.startDay;
            newEndHour = newWindow.startHour + minDuration;
        }
        if (newEndDay < 6 && newEndHour > 23) {
            newEndDay = newWindow.endDay < newWindow.startDay ? newWindow.startDay : newEndDay + 1;
            newEndHour = newEndHour - 24;
        }
        setWindow({
            ...newWindow,
            endDay: newEndDay,
            endHour: newEndHour
        });
    }
    
    return (
        <Modal show={isVisible} onHide={onCancel} animation={false} backdrop={"static"} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit window
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className={"fw-semibold"}>From</Form.Label>
                        <InputGroup>
                            <Form.Select value={window.startDay} onChange={event => updateWindow({ ...window, startDay: parseInt(event.target.value) })}>{startDayOptions}</Form.Select>
                            <Form.Select value={window.startHour} onChange={event => updateWindow({ ...window, startHour: parseInt(event.target.value) })}>{startHourOptions}</Form.Select>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className={"fw-semibold"}>To</Form.Label>
                        <InputGroup>
                            <Form.Select value={window.endDay} onChange={event => updateWindow({ ...window, endDay: parseInt(event.target.value) })} isInvalid={window.startDay > window.endDay || (window.startDay === window.endDay && window.startHour === 23 && window.endDay !== 6)} disabled={isStrictMode}>{endDayOptions}</Form.Select>
                            <Form.Select value={window.endHour} onChange={event => updateWindow({ ...window, endHour: parseInt(event.target.value) })} isInvalid={isWindowInvalid} disabled={isStrictMode}>{endHourOptions}</Form.Select>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onSave} disabled={isWindowInvalid}>Save</Button>
                <Button onClick={onCancel} variant={"secondary"}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}


function getWindowLabel(window) {
    if (window.startDay === window.endDay && window.startHour < window.endHour) {
        return `${DAYS[window.startDay]} ${HOURS[window.startHour]} to ${HOURS[window.endHour]}`
    } else if (window.startDay < window.endDay) {
        return `${DAYS[window.startDay]} ${HOURS[window.startHour]} to ${DAYS[window.endDay]} ${HOURS[window.endHour]}`;
    } else {
        return "Invalid window";
    }
}


function WindowTag({ window, onEditSelf, onDeleteSelf, onCopySelf }) {
    return (
        <Badge bg={"light"} text={"dark"}>
            <Stack direction={"horizontal"} gap={1}>
                <a href={"#"} className={"link-primary"} onClick={onEditSelf}>{getWindowLabel(window)}</a>
                <Button variant={"outline-light"} size={"sm"} onClick={onCopySelf}><FontAwesomeIcon icon={faCopy} color={"grey"}></FontAwesomeIcon></Button>
                <CloseButton onClick={onDeleteSelf} />
            </Stack>
        </Badge>
    );
}


function WindowTagCollection({ windowCollection, onEditWindow, onDeleteWindow, onCopyWindow }) {
  if (windowCollection.length > 0) {
      return windowCollection.map(item =>
          <WindowTag key={item.key} window={item.value} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} onCopySelf={() =>onCopyWindow(item.key)} />
      );
  } else {
      return <Badge bg={"white"} text={"dark"}>No windows</Badge>
  }
}


function PreferenceModal({ isVisible, onCancel, onSave, windowCollection, cycles, setCycles, onCreateWindow, onDeleteWindow, onEditWindow, onCopyWindow }) {

  const cyclesOptions = range(6, 1).map(value =>
      <option key={value} value={value}>At least {value} cycle{value === 1 ? "" : "s"}</option>
  );

  return (
      <Modal show={isVisible} onHide={onCancel} animation={false} backdrop={"static"} centered>
          <Modal.Header closeButton>
            <Modal.Title>
                Edit requirement
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className={"fw-semibold"}>Valid windows</Form.Label>
                <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                  <WindowTagCollection windowCollection={windowCollection} onEditWindow={onEditWindow} onDeleteWindow={onDeleteWindow} onCopyWindow={onCopyWindow} />
                  <Button size={"sm"} onClick={onCreateWindow}>Add window</Button>
                </Stack>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className={"fw-semibold"}>Required number of cycles</Form.Label>
                <Form.Select defaultValue={cycles} onChange={event => setCycles(parseInt(event.target.value))}>{cyclesOptions}</Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button onClick={onSave} disabled={windowCollection.length === 0}>Save</Button>
              <Button onClick={onCancel} variant={"secondary"}>Cancel</Button>
          </Modal.Footer>
      </Modal>
  );
}


function PreferenceModalByDay({ isVisible, onCancel, onSave, window, setWindow, windowCollection, cycles, setCycles, onCreateWindow, minDuration=1}) {
  const startHourOptions = {};
  const endHourOptions = {};

  for (const day of DAYS) {
      startHourOptions[day] = HOURS.map((value, index) => 
          <option key={index} value={index} disabled={24 - index + 1 <= minDuration} >{value} </option>);
      endHourOptions[day] = ((day === "Sunday") ? HOURS : HOURS.slice(0, 24)).map((value, index) => 
          <option key={index} value={index} disabled={(index - minDuration + 1) <= window[day].startHour}>{value}</option>);
  }

  const [checkedItems, setCheckedItems] = useState([]);

  // let isWindowInvalid = DAYS.map((day) => {
  //     return window[day].selected === 1 && (window[day].endHour - window[day].startHour < minDuration);
  // }).includes(true) || checkedItems.length === 0;
  const isWindowInvalid = false;

  function handleCheckboxChange(newWindow, event) {
      const item = event.target.value;
      const isChecked = event.target.checked;
      if (isChecked) {
          setCheckedItems([...checkedItems, item]);
          newWindow[item] = {...newWindow[item], selected: 1};
      } else {
          setCheckedItems(checkedItems.filter((checkedItem) => checkedItem !== item));
          newWindow[item] = {...newWindow[item], selected: 0};
      }
      setWindow(newWindow)
  };

  function updateWindow(newWindow) {
      for (const day of DAYS) {
          if (newWindow[day].selected === 0) {
              continue;
          }
          let newEndHour = (newWindow[day].endHour - newWindow[day].startHour <= minDuration) ? newWindow[day].startHour + minDuration : newWindow[day].endHour;
          newWindow[day] = {
              ...newWindow[day],
              endHour: newEndHour
          };
      }
      setWindow(newWindow);
  }

  return (
      <Modal show={isVisible} onHide={onCancel} animation={false} backdrop={"static"} centered>
        <Modal.Header closeButton>
            <Modal.Title>
                Add 1 cycle to
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              {
                DAYS.map((day, index) => (
                  <Row>
                    <Col>
                      <Form.Check className="fw-semibold" type="checkbox" id={`${day}Check`} label={day} value={day} onChange={event => handleCheckboxChange({ ...window }, event)} checked={window[day].selected===1}/>
                    </Col>
                    <Col xs={6} sm={8}>
                      <InputGroup>
                        <Form.Select value={window[day].startHour} onChange={event => updateWindow({ ...window, [day]: {...window[day], startHour: parseInt(event.target.value)} })}
                        disabled={window[day].selected===0}>{startHourOptions[day]}</Form.Select>
                        <Form.Select value={window[day].endHour} onChange={event => updateWindow({ ...window, [day]: {...window[day], endHour: parseInt(event.target.value)} })}
                        disabled={window[day].selected===0} isInvalid={(window[day].endHour-window[day].startHour)<minDuration}>{endHourOptions[day]}</Form.Select>
                      </InputGroup>
                    </Col>
                  </Row>
                ))
              }
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onSave} disabled={isWindowInvalid}>Save</Button>
            <Button onClick={onCancel} variant={"secondary"}>Cancel</Button>
        </Modal.Footer>
      </Modal>
  );


}


function getPreferenceLabel(windowCollection, cycles) {
  if (windowCollection.length >= 1) {
      const windowDays = [];
      for (const [index] of DAYS.entries()) {
          for (const window of windowCollection) {
              if (window.value.startDay <= index && index <= window.value.endDay) {
                  windowDays.push(index);
                  break;
              }
          }
      }

      const startHours = new Set();
      const endHours = new Set();
      for (const window of windowCollection) {
          startHours.add(window.value.startHour);
          endHours.add(window.value.endHour);
      }

      function getDayLabel() {
          if (windowDays.length === 7) {
              return "any day";
          }
          if (windowDays.length === 1) {
              return `on ${DAYS[windowDays[0]]}`;
          }
          return "on various days";
      }

      function getTimeLabel() {
          if (startHours.size === 1 && endHours.size === 1) {
              return `from ${HOURS[windowCollection[0].value.startHour]} to ${HOURS[windowCollection[0].value.endHour]}`;
          }
          return "at various times";
      }

      return `${cycles} cycle${cycles === 1? "" : "s"} ${getDayLabel()} ${getTimeLabel()}`;
  } else {
      return "Invalid preference";
  }
}


function PreferenceTag({ windowCollection, cycles, onEditSelf, onDeleteSelf, onCopySelf }) {
  return (
      <Badge bg={"light"} text={"dark"}>
          <Stack direction={"horizontal"} gap={1}>
              <a href={"#"} className={"link-primary me-auto"} onClick={onEditSelf}>{getPreferenceLabel(windowCollection, cycles)}</a>
              <Button variant={"outline-light"} size={"sm"} onClick={onCopySelf}><FontAwesomeIcon icon={faCopy} color={"grey"}></FontAwesomeIcon></Button>
              <CloseButton onClick={onDeleteSelf} />
          </Stack>
      </Badge>
  );
}


function PreferenceTagCollection({ preferenceCollection, onEditWindow, onDeleteWindow, onCopyWindow }) {
  if (preferenceCollection.length > 0) {
      return preferenceCollection.map(item =>
          <PreferenceTag key={item.key} windowCollection={item.windows} cycles={item.cycles} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} onCopySelf={() => onCopyWindow(item.key)} />
      );
  } else {
      return <Badge bg={"white"} text={"dark"}>No requirement</Badge>
  }
}

function ErrorNoticeCard({ status, pollingActiveRef }) {
  var errorTitle = "Notice";
  var errorText = "Computation is in progress. Please wait.";

  if (status==="Solved" && !pollingActiveRef) {
    return null;
  }

  if (status==="Unsolvable")  {
    errorTitle = "Unsolvable Problem";
    errorText = "Please adjust your preference. You may check dryer windows, which must be after the washer, and redundant windows."
  } else if (status==="TimeExceeded" || status==="SpaceExceeded") {
    errorTitle = "Time or Computational Power Exceeded";
    errorText = "The excution time or computation power exceeded the limit. Try to reduce the number of cycles or windows."
  } else if (status==="Error") {
    errorTitle = "Unexpected Error";
    errorText = "Connection error. Please refresh the page and try again."
  }

  return (
    <Card className="mb-3">
      <Card.Header><FontAwesomeIcon icon={faWarning}></FontAwesomeIcon>{errorTitle}</Card.Header>
      <Card.Body>
        <Card.Text>
        {errorText}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}


function AppliancePreferenceForm({ appliance, savedPreferences, setSavedPreferences }) {
  const defaultWindow = { startDay: 0, startHour: 0, endDay: 0, endHour: PARAMS[appliance].duration, selected: 0 };
  const defaultWindowByDay = {};
  for (const [index, day] of DAYS.entries()) {
    defaultWindowByDay[day] = { startDay: index, startHour: 0, endDay: index, endHour: PARAMS[appliance].duration, selected: 0 };
  }
  const defaultWindowCollection = [];
  const defaultCycles = 1;

  const [activeWindow, setActiveWindow] = useState(defaultWindow);
  const [activeWindowByDay, setActiveWindowByDay] = useState(defaultWindowByDay);
  const [activeWindowCollection, setActiveWindowCollection] = useState(defaultWindowCollection);
  const [activeCycles, setActiveCycles] = useState(defaultCycles);

  const [selectedPreferenceKey, setSelectedPreferenceKey] = useState(null);
  const [selectedWindowKey, setSelectedWindowKey] = useState(null);

  const [isPreferenceModalVisible, setIsPreferenceModalVisible] = useState(false);
  const [isPreferenceByDayModalVisible, setIsPreferenceByDayModalVisible] = useState(false);
  const [isWindowModalVisible, setIsWindowModalVisible] = useState(false);


  function onCreatePreference() {
    setActiveWindowCollection(defaultWindowCollection);
    setActiveCycles(defaultCycles);
    setSelectedPreferenceKey(uuid());
    setIsPreferenceModalVisible(true);
  }

  function onCreatePreferenceByDay() {
    setActiveWindowByDay(defaultWindowByDay);
    setIsPreferenceByDayModalVisible(true);
  }

  function onEditPreference(preferenceKey) {
      const savedPreference = savedPreferences.find(item => item.key === preferenceKey);
      if (savedPreference) {
          setActiveWindowCollection(savedPreference.windows);
          setActiveCycles(savedPreference.cycles);
          setSelectedPreferenceKey(preferenceKey);
          setIsPreferenceModalVisible(true);
      }
  }

  function onDeletePreference(preferenceKey) {
      setSavedPreferences(savedPreferences.filter(item => item.key !== preferenceKey));
  }

  function onSavePreferenceModal() {
      setIsPreferenceModalVisible(false);
      const savedPreference = savedPreferences.find(item => item.key === selectedPreferenceKey);
      if (savedPreference) {
          setSavedPreferences(savedPreferences.map(preferenceItem => {
              if (preferenceItem.key === selectedPreferenceKey) {
                  return { ...preferenceItem, windows: activeWindowCollection, cycles: activeCycles };
              } else {
                  return preferenceItem;
              }
          }));
      } else {
          setSavedPreferences([...savedPreferences, { key: selectedPreferenceKey, windows: activeWindowCollection, cycles: activeCycles}]);
      }
  }

  function onSavePreferenceByDayModal() {
    setIsPreferenceByDayModalVisible(false);
    const savedPreference = [];
    for (const [index, day] of DAYS.entries()) {
      if (activeWindowByDay[day].selected === 1) {
        const newWindow = [{ key: uuid(), value: activeWindowByDay[day]}];
        savedPreference.push({ key: uuid(), windows: newWindow, cycles: 1 });
      }
    }
    setSavedPreferences(
      [...savedPreferences, ...savedPreference]
    );
  }

  function onCancelPreferenceModal() {
      setIsPreferenceModalVisible(false);
  }

  function onCancelPreferenceByDayModal() {
    setIsPreferenceByDayModalVisible(false);
  }

  function onCreateWindow() {
      setActiveWindow(defaultWindow);
      setSelectedWindowKey(uuid());
      setIsPreferenceModalVisible(false);
      setIsWindowModalVisible(true);
  }

  function onEditWindow(windowKey) {
      const savedWindow = activeWindowCollection.find(item => item.key === windowKey);
      if (savedWindow) {
          setSelectedWindowKey(windowKey);
          setActiveWindow(savedWindow.value);
          setIsPreferenceModalVisible(false);
          setIsWindowModalVisible(true);
      }
  }

  function onDeleteWindow(windowKey) {
      setActiveWindowCollection(activeWindowCollection.filter(item => item.key !== windowKey));
  }

  function onSaveWindowModal() {
      setIsWindowModalVisible(false);
      setIsPreferenceModalVisible(true);
      if (activeWindowCollection.find(item => item.key === selectedWindowKey)) {
          setActiveWindowCollection(activeWindowCollection.map(item => {
              if (item.key === selectedWindowKey) {
                  return { ...item, value: activeWindow };
              } else {
                  return item;
              }
          }));
      } else {
          setActiveWindowCollection([...activeWindowCollection, { key: selectedWindowKey, value: activeWindow}]);
      }
  }

  function onCopyPreferenceModal(windowKey) {
    setIsPreferenceModalVisible(false);
    const savedPreference = savedPreferences
    .find(item => item.key === windowKey);
    if (savedPreference) {
      const newPreference = { key: uuid(), windows: savedPreference.windows, cycles: savedPreference.cycles };
      setSavedPreferences([...savedPreferences, newPreference]);
    }
  }

  function onCopyWindowModal(windowKey) {
    setIsWindowModalVisible(false);
    const savedWindow = activeWindowCollection
    .find(item => item.key === windowKey);
    if (savedWindow) {
      const newWindow = { key: uuid(), value: savedWindow.value };
      setActiveWindowCollection([...activeWindowCollection, newWindow]);
    }
  }

  function onCancelWindowModal() {
      setIsWindowModalVisible(false);
      setIsPreferenceModalVisible(true);
  }

  return (
    <div>
      <Card>
        <Card.Header>
          <Stack direction={"horizontal"} gap={2}>
            <Form.Label className={"fw-semibold me-auto"}>{appliance}</Form.Label>
            <Button size={"sm"} onClick={onCreatePreferenceByDay}>Add</Button>
            <div className="vr" />
            <Button size={"sm"} onClick={onCreatePreference}>Advanced</Button>
          </Stack>
        </Card.Header>

        <Card.Body>
          <Card.Text>
            <Stack gap={1}>
                <Stack direction={"vertical"} gap={1} className={"flex-wrap"}>
                    <PreferenceTagCollection preferenceCollection={savedPreferences} onEditWindow={onEditPreference} onDeleteWindow={onDeletePreference} onCopyWindow={onCopyPreferenceModal} />
                </Stack>
            </Stack>
          </Card.Text>
        </Card.Body>
      </Card>
      
      <PreferenceModal
        isVisible={isPreferenceModalVisible}
        onCancel={onCancelPreferenceModal}
        onSave={onSavePreferenceModal}
        windowCollection={activeWindowCollection}
        cycles={activeCycles}
        setCycles={setActiveCycles}
        onCreateWindow={onCreateWindow}
        onDeleteWindow={onDeleteWindow}
        onEditWindow={onEditWindow}
        onCopyWindow={onCopyWindowModal}
      />
      <WindowModal
        isVisible={isWindowModalVisible}
        onCancel={onCancelWindowModal}
        onSave={onSaveWindowModal}
        window={activeWindow}
        setWindow={setActiveWindow}
        minDuration={PARAMS[appliance].duration}
      />
      <PreferenceModalByDay
        isVisible={isPreferenceByDayModalVisible}
        onCancel={onCancelPreferenceByDayModal}
        onSave={onSavePreferenceByDayModal}
        window={activeWindowByDay}
        setWindow={setActiveWindowByDay}
        windowCollection={activeWindowCollection}
        cycles={activeCycles}
        setCycles={setActiveCycles}
        onCreateWindow={onCreateWindow}
        onDeleteWindow={onDeleteWindow}
        minDuration={PARAMS[appliance].duration}
      />
    </div>
  );

  {/* // return (
  //     <Form.Group className="mb-3">
  //         <Form.Label className={"fw-semibold"}>{appliance}</Form.Label>
  //         <Stack gap={1}>
  //             <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
  //                 <PreferenceTagCollection preferenceCollection={savedPreferences} onEditWindow={onEditPreference} onDeleteWindow={onDeletePreference} />
  //                 <Button size={"sm"} onClick={onCreatePreference}>Add preference</Button>
  //             </Stack>
  //         </Stack>
  //         <PreferenceModal
  //             isVisible={isPreferenceModalVisible}
  //             onCancel={onCancelPreferenceModal}
  //             onSave={onSavePreferenceModal}
  //             windowCollection={activeWindowCollection}
  //             cycles={activeCycles}
  //             setCycles={setActiveCycles}
  //             onCreateWindow={onCreateWindow}
  //             onDeleteWindow={onDeleteWindow}
  //             onEditWindow={onEditWindow}
  //         />
  //         <WindowModal
  //             isVisible={isWindowModalVisible}
  //             onCancel={onCancelWindowModal}
  //             onSave={onSaveWindowModal}
  //             window={activeWindow}
  //             setWindow={setActiveWindow}
  //         />
  //     </Form.Group>
  // ); */}
}

export function ControlTabMini({ username, api_token, savedSchedules, setSavedSchedules, tasks, setTasks, pollingActive, setPollingActive }) {
  const [viewMin, setViewMin] = useState(SCHEDULE_START);
  const [viewMax, setViewMax] = useState(SCHEDULE_END);
  const [tasksStatus, setTasksStatus] = useState("");

  // Following seems necessarily for setInterval and clearInterval to work
  const savedSchedulesRef = useRef(savedSchedules);
  const pollingActiveRef = useRef(pollingActive);
  
  const [savedWasherPreferences, setSavedWasherPreferences] = useState([]);
  const [savedDryerPreferences, setSavedDryerPreferences] = useState([]);
  const [savedDishwasherPreferences, setSavedDishwasherPreferences] = useState([]);
  const [savedVehiclePreferences, setSavedVehiclePreferences] = useState([]);

  function formatPreferences(preferences) {
      const formattedPreferences = [];
      for (const preference of preferences) {
          const timesteps = [];
          for (let timestep = 0; timestep < 168; timestep++) {
              for (const window of preference.windows) {
                  const windowStartTimestep = window.value.startDay * 24 + window.value.startHour;
                  const windowEndTimestep = window.value.endDay * 24 + window.value.endHour;
                  if (windowStartTimestep <= timestep && timestep < windowEndTimestep) {
                      timesteps.push(timestep);
                      break;
                  }
              }
          }
          formattedPreferences.push({timesteps: timesteps, min_required_cycles: preference.cycles});
      }
      return formattedPreferences;
  }

  function formatDependencies(dependencies) {
      const formattedDependencies = [];
      for (const appliance of APPLIANCES) {
          let hours = null;
          for (const dependency of dependencies) {
              if (dependency.value.appliance === appliance) {
                  hours = dependency.value.hours;
                  break;
              }
          }
          formattedDependencies.push(hours);
      }
      return formattedDependencies;
  }

  function getProblem(savedWasherPreferences, savedDryerPreferences, savedDishwasherPreferences, savedVehiclePreferences){
    return {
      "horizon": 168,
      "battery": {
        "capacity": PARAMS.Battery.capacity,
        "rate": PARAMS.Battery.rate,
        "initial_level": 0,
        "min_required_level": 0
      },
      "appliances": [
        {
          "label": "Washer",
          "duration": PARAMS.Washer.duration,
          "rate": PARAMS.Washer.rate,
          "min_required_cycles": formatPreferences(savedWasherPreferences),
          "dependencies": formatDependencies([])
        },
        {
          "label": "Dryer",
          "duration": PARAMS.Dryer.duration,
          "rate": PARAMS.Dryer.rate,
          "min_required_cycles": formatPreferences(savedDryerPreferences),
          "dependencies": formatDependencies([])
        },
        {
          "label": "Dishwasher",
          "duration": PARAMS.Dishwasher.duration,
          "rate": PARAMS.Dishwasher.rate,
          "min_required_cycles": formatPreferences(savedDishwasherPreferences),
          "dependencies": formatDependencies([])
        },
        {
          "label": "Vehicle",
          "duration": PARAMS.Vehicle.duration,
          "rate": PARAMS.Vehicle.rate,
          "min_required_cycles": formatPreferences(savedVehiclePreferences),
          "dependencies": formatDependencies([])
        }
      ]
  }
  }

  function onSave(problem) {
    console.log(problem);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${username},${api_token}`,
        },
        body: JSON.stringify(problem)
    };
    fetch(`${process.env.REACT_APP_API_URL}/requirements`, options)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            setSavedSchedules([...savedSchedules, data.resource]);
            setPollingActive(true);
        })
        .catch((error) => console.log(error));
  }

  function updateSchedule() {
    if (pollingActiveRef.current) {
        const currentSchedule = savedSchedulesRef.current[savedSchedulesRef.current.length-1];
        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${username},${api_token}`,
            },
        };
        fetch(`${process.env.REACT_APP_API_URL}/tasks/${currentSchedule}`, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return null;
                }
            })
            .then((data) => {
                if (data.tasks != null) {
                  console.log(data);
                  setPollingActive(false);
                  setTasksStatus(data.status);
                  setTasks(data.tasks);
                }
            })
            .catch((error) => console.log(error));
    }
  }

  function onSaveButton () {
    const problem = getProblem(savedWasherPreferences, savedDryerPreferences, savedDishwasherPreferences, savedVehiclePreferences);
    onSave(problem);
    console.log(problem);
    updateSchedule();
  }

  useEffect(() => {
    savedSchedulesRef.current = savedSchedules;
    localStorage.setItem("savedSchedules", JSON.stringify(savedSchedules));
  }, [savedSchedules]);

  useEffect(() => {
    pollingActiveRef.current = pollingActive;
    updateSchedule();
  }, [pollingActive]);

  useEffect(() => {
    onSaveButton();
    console.log(tasks);
  }, []);

  useEffect(() => {
    const interval = setInterval(updateSchedule, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Container className={"py-3"}>
        <ErrorNoticeCard status={tasksStatus} pollingActiveRef={pollingActive}/>

        <Card>
          <Card.Header>
            <Stack direction={"horizontal"} gap={2}>
              <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
              <Form.Label className="fw-semibold">Your home schedule for next week</Form.Label>
            </Stack>
          </Card.Header>
          <Card.Body>
            <div className="mt-2 mb-5" style={{height: "25rem"}}>
              <ScheduleChart tasks={tasks} schedule_start={SCHEDULE_START} view_min={viewMin} view_max={viewMax}/>
              <ChartNavigation viewMin={viewMin} setViewMin={setViewMin} viewMax={viewMax} setViewMax={setViewMax} />
            </div>
          </Card.Body>
      </Card>
    </Container>
    <Container>
    <Row className={"py-2"}>
      <Col>
        <AppliancePreferenceForm appliance={"Washer"} savedPreferences={savedWasherPreferences} setSavedPreferences={setSavedWasherPreferences} />
      </Col>
      <Col>
        <AppliancePreferenceForm appliance={"Dryer"} savedPreferences={savedDryerPreferences} setSavedPreferences={setSavedDryerPreferences} />
      </Col>
    </Row>
    <Row className={"py-2"}>
      <Col>
        <AppliancePreferenceForm appliance={"Dishwasher"} savedPreferences={savedDishwasherPreferences} setSavedPreferences={setSavedDishwasherPreferences} />
      </Col>
      <Col>
        <AppliancePreferenceForm appliance={"Vehicle"} savedPreferences={savedVehiclePreferences} setSavedPreferences={setSavedVehiclePreferences} />
      </Col>
    </Row>
    </Container>

    <br />
    <figure className="text-center">
      <Button onClick={onSaveButton}>
      {pollingActive ? 'Loading...' : 'Schedule with AI'}
      </Button>
    </figure>
    </div>
    
  );
}

export function ControlTab({ username, api_token, 
  savedSchedules, setSavedSchedules, defaultTasks, setDefaultTasks, tasks, setTasks, setOldCost, setNewCost,
  defaultProblem, checkAsked, setOpenContrastiveChart, isControl, 
  pollingActive, setPollingActive }) {

  const [tasksStatus, setTasksStatus] = useState("");
  
  // Following seems necessarily for setInterval and clearInterval to work
  const savedSchedulesRef = useRef(savedSchedules);
  const pollingActiveRef = useRef(pollingActive);
  
  const [savedWasherPreferences, setSavedWasherPreferences] = useState([]);
  const [savedDryerPreferences, setSavedDryerPreferences] = useState([]);
  const [savedDishwasherPreferences, setSavedDishwasherPreferences] = useState([]);
  const [savedVehiclePreferences, setSavedVehiclePreferences] = useState([]);

  function formatPreferences(preferences) {
      const formattedPreferences = [];
      for (const preference of preferences) {
          const timesteps = [];
          for (let timestep = 0; timestep < 168; timestep++) {
              for (const window of preference.windows) {
                  const windowStartTimestep = window.value.startDay * 24 + window.value.startHour;
                  const windowEndTimestep = window.value.endDay * 24 + window.value.endHour;
                  if (windowStartTimestep <= timestep && timestep < windowEndTimestep) {
                      timesteps.push(timestep);
                      break;
                  }
              }
          }
          formattedPreferences.push({timesteps: timesteps, min_required_cycles: preference.cycles});
      }
      return formattedPreferences;
  }

  function formatDependencies(dependencies) {
      const formattedDependencies = [];
      for (const appliance of APPLIANCES) {
          let hours = null;
          for (const dependency of dependencies) {
              if (dependency.value.appliance === appliance) {
                  hours = dependency.value.hours;
                  break;
              }
          }
          formattedDependencies.push(hours);
      }
      return formattedDependencies;
  }

  function getProblem(savedWasherPreferences, savedDryerPreferences, savedDishwasherPreferences, savedVehiclePreferences){
    return {
      "horizon": 168,
      "battery": {
        "capacity": PARAMS.Battery.capacity,
        "rate": PARAMS.Battery.rate,
        "initial_level": 0,
        "min_required_level": 0
      },
      "appliances": [
        {
          "label": "Washer",
          "duration": PARAMS.Washer.duration,
          "rate": PARAMS.Washer.rate,
          "min_required_cycles": formatPreferences(savedWasherPreferences),
          "dependencies": formatDependencies([])
        },
        {
          "label": "Dryer",
          "duration": PARAMS.Dryer.duration,
          "rate": PARAMS.Dryer.rate,
          "min_required_cycles": formatPreferences(savedDryerPreferences),
          "dependencies": formatDependencies([])
        },
        {
          "label": "Dishwasher",
          "duration": PARAMS.Dishwasher.duration,
          "rate": PARAMS.Dishwasher.rate,
          "min_required_cycles": formatPreferences(savedDishwasherPreferences),
          "dependencies": formatDependencies([])
        },
        {
          "label": "Vehicle",
          "duration": PARAMS.Vehicle.duration,
          "rate": PARAMS.Vehicle.rate,
          "min_required_cycles": formatPreferences(savedVehiclePreferences),
          "dependencies": formatDependencies([])
        }
      ]
  }
  }

  function onSave(problem) {
    console.log(problem);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${username},${api_token}`,
        },
        body: JSON.stringify(problem)
    };
    fetch(`${process.env.REACT_APP_API_URL}/requirements`, options)
        .then((response) => {
          if (response.ok) {
              return response.json();
          } else {
              return null;
          }
        })
        .then((data) => {
            console.log(data);
            setSavedSchedules([...savedSchedules, data.resource]);
            setPollingActive(true);
        })
        .catch((error) => console.log(error));
  }

  function updateSchedule() {
    if (pollingActiveRef.current) {
        const currentSchedule = savedSchedulesRef.current[savedSchedulesRef.current.length-1];
        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${username},${api_token}`,
            },
        };
        fetch(`${process.env.REACT_APP_API_URL}/tasks/${currentSchedule}`, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return null;
                }
            })
            .then((data) => {
              if (data!==null){
                console.log(data.status);
                setTasksStatus(data.status);
                setPollingActive(false);
                  if (data.tasks != null) {
                    console.log(data);
                    setTasks(data.tasks);
                    setNewCost(data.cost);
                  }
              } else {
                console.log("Waiting for response");
              }
            })
            .catch((error) => console.log(error));
    }
  }

  function updateDefaultSchedule() {
    if (savedSchedulesRef.current.length > 0) {
        const currentSchedule = savedSchedulesRef.current[0];
        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${username},${api_token}`,
            },
        };
        fetch(`${process.env.REACT_APP_API_URL}/tasks/${currentSchedule}`, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    return null;
                }
            })
            .then((data) => {
                if (data.tasks != null) {
                  console.log(data);
                  setDefaultTasks(data.tasks);
                  setOldCost(data.cost);
                }
            })
            .catch((error) => console.log(error));
    }
  }

  function onSaveButton () {
    setTasks([]);
    var problem = getProblem(savedWasherPreferences, savedDryerPreferences, savedDishwasherPreferences, savedVehiclePreferences);
    
    for (const [index, appliance] of APPLIANCES.entries()){
      if (!checkAsked.includes(appliance) || (checkAsked.includes(appliance) && eval("saved"+`${appliance}`+"Preferences").length === 0)){
        problem["appliances"][index] = structuredClone(defaultProblem.appliances[index]);
      } else {
        let defaultRequiredCycles = defaultProblem.appliances[index].min_required_cycles;
        let savedRequiredCycles = problem["appliances"][index].min_required_cycles;

        problem["appliances"][index]["min_required_cycles"] = defaultRequiredCycles.concat(savedRequiredCycles)
      }
    }
    setOpenContrastiveChart(true);
    window.scrollTo({top: 320, left: 0, behavior: 'smooth'});

    onSave(problem);
  }

  function getTaskLabel (task) {
    const startDay = Math.floor(task.start / 24) % 7;
    const startHour = task.start % 24;
    const endDay = Math.floor((task.start + task.duration) / 24) % 7;
    const endHour = (task.start + task.duration) % 24;

    let label = task.device;
    let action = task.action;
    label = label.charAt(0).toUpperCase() + label.substring(1);
    action = action.charAt(0).toLowerCase() + action.substring(1);
    if (startDay === endDay) {
      return label + " " + action + " " + DAYS[startDay] + " " + HOURS[startHour] + "-" + HOURS[endHour];
    } else {
      return label + " " + action + " " + DAYS[startDay] + " " + HOURS[startHour] + " to " + DAYS[endDay] + " " + HOURS[endHour];
    }
  }

  function getTaskBandage (items) {
    if (items.length === 0) {
      return (
      <p className="lh-lg">
        <Badge bg={"light"} text={"dark"}>
          {"No tasks"}
        </Badge>
      </p>);
    } else {
      return (
        <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
          {
            items.map((item) => 
              <p>
                <Badge bg={"light"} text={"dark"}>
                  {getTaskLabel(item)}
                </Badge>
              </p>
              )
          }
        </Stack>
      );
    }
  }

  function getRequirementBandage (items) {
    if (items.length === 0) {
      return (
      <p className="lh-lg">
        <Badge bg={"light"} text={"dark"}>
          {"No requirement"}
        </Badge>
      </p>);
    } else {
      return (
        <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
          {
            items.map((item) => 
              <p>
                <Badge bg={"light"} text={"dark"}>
                  {getPreferenceLabel(item.windows, item.cycles)}
                </Badge>
              </p>
              )
          }
        </Stack>
      );
    }
  }

  // function checkSubsumed (oldProblem, newProblem) {
  //   let results = [];
  //   for (const [index, appliance] of APPLIANCES.entries()){
  //     let totalOldCycles = 0;
  //     let totalNewCycles = 0;
  //     let totalIntersection = 0;

  //     for (const requirement of oldProblem[index].min_required_cycles){
  //       totalOldCycles += requirement.min_required_cycles;
  //     }

  //     for (const [index2, requirement] of newProblem[index].min_required_cycles.entries()){
  //       totalNewCycles += requirement.min_required_cycles;
  //       // check list intersection
  //       for (const requirement2 of oldProblem[index].min_required_cycles){
  //         let intersection = requirement2.timesteps.filter(value => requirement.timesteps.includes(value));
  //         if (intersection.length === requirement.timesteps.length){
  //           totalIntersection += intersection.length;
  //         }
  //       }
  //     }

  //     if (totalOldCycles <= totalNewCycles && totalIntersection > 0){
  //       results.push(appliance);
  //     }
  //   }
  //   return results;
  // }

  useEffect(() => {
    var initProblem = getProblem([], [], [], []);
    initProblem["appliances"] = structuredClone(defaultProblem.appliances);
    onSave(initProblem);
    setOpenContrastiveChart(false);
  }, []);

  useEffect(() => {
    savedSchedulesRef.current = savedSchedules;
    updateDefaultSchedule();
    localStorage.setItem(`savedSchedules${defaultProblem.name}`, JSON.stringify(savedSchedules));
  }, [savedSchedules]);

  useEffect(() => {
    pollingActiveRef.current = pollingActive;
    updateSchedule();
  }, [pollingActive]);

  useEffect(() => {
    const interval = setInterval(updateSchedule, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container style={{visibility: !isControl ? 'visible' : 'hidden' }}>
      <ErrorNoticeCard status={tasksStatus} pollingActiveRef={pollingActive} />

      {
        APPLIANCES.filter((item)=>(checkAsked.includes(item))).map((appliance) => 
        <Row className="py-3">
        <Col xs={6} sm={6}>
          <Card>
            <Card.Header>
              <Form.Label className={"fw-semibold me-auto"}>Ask about {appliance}</Form.Label>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                {"Why did Cuttlefish AI recommend"}
                {getTaskBandage(defaultTasks.filter(task => task.device === appliance))}
                rather than 
                {getRequirementBandage(eval("saved"+`${appliance}`+"Preferences"))}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} sm={6}>
          <AppliancePreferenceForm appliance={appliance} savedPreferences={eval("saved"+`${appliance}`+"Preferences")} setSavedPreferences={eval("setSaved"+`${appliance}`+"Preferences")} />
        </Col>
        </Row>
        )
      }

      <figure className="text-center">
        <Button 
          onClick={onSaveButton} disabled={checkAsked.length===0}>
        {pollingActive ? 'Loading...' : 'Ask Questions'}
        </Button>
      </figure>
    </Container>
  );
}
