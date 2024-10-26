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
    Modal, 
    Stack, 
    Spinner, 
    Pagination, 
    Card } from "react-bootstrap";
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { Col, Row } from 'react-bootstrap';
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMagnifyingGlassMinus, faMagnifyingGlassPlus, faArrowRotateRight, faArrowLeft, faArrowRight,
    faCircleInfo, faClock,
    faBoltLightning
} from '@fortawesome/free-solid-svg-icons'

import { range } from "./Utilities";
import { type } from "@testing-library/user-event/dist/type";

import dayjs from "dayjs";
import ScheduleChart from "./ScheduleChartPilot";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];
const APPLIANCES = ["Washer", "Dryer", "Dishwasher", "Vehicle"];

const WASHERDURATION = 2;
const DRYERDURATION = 3;
const DISHWASHERDURATION = 1;
const VEHICLEDURATION = 8;

const SCHEDULE_START = dayjs().startOf("year").add(1, "week"); // Start of next week is Sunday
const SCHEDULE_END = SCHEDULE_START.add(1, "week"); // End of next week is Sunday


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


function WindowModalByDay({ isVisible, onCancel, onSave, window, setWindow, minDuration=1}) {
    const startHourOptions = {};
    const endHourOptions = {};

    for (const day of DAYS) {
        startHourOptions[day] = HOURS.slice(0, 24).map((value, index) => 
            <option key={index} value={index} disabled={24 - index + 1 <= minDuration} >{value} </option>);
        endHourOptions[day] = HOURS.map((value, index) => 
            <option key={index} value={index} disabled={(index - minDuration + 1) <= window[day].startHour}>{value}</option>);
    }

    const [checkedItems, setCheckedItems] = useState([]);

    let isWindowInvalid = DAYS.map((day) => {
        return window[day].selected === 1 && (window[day].endHour - window[day].startHour < minDuration);
    }).includes(true) || checkedItems.length === 0;

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
                    Edit window
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Row>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="MondayCheck" label="Monday" value="Monday" onChange={event => handleCheckboxChange(window, event)} checked={window.Monday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Monday.startHour} onChange={event => updateWindow({ ...window, Monday: {...window.Monday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Monday.selected===0}>{startHourOptions.Monday}</Form.Select>
                                    <Form.Select value={window.Monday.endHour} onChange={event => updateWindow({ ...window, Monday: {...window.Monday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Monday.selected===0} isInvalid={(window.Monday.endHour-window.Monday.startHour)<minDuration}>{endHourOptions.Monday}</Form.Select>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="TuesdayCheck" label="Tuesday" value="Tuesday" onChange={event => handleCheckboxChange(window, event)} checked={window.Tuesday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Tuesday.startHour} onChange={event => updateWindow({ ...window, Tuesday: {...window.Tuesday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Tuesday.selected===0}>{startHourOptions.Tuesday}</Form.Select>
                                    <Form.Select value={window.Tuesday.endHour} onChange={event => updateWindow({ ...window, Tuesday: {...window.Tuesday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Tuesday.selected===0} isInvalid={(window.Tuesday.endHour-window.Tuesday.startHour)<minDuration}>{endHourOptions.Tuesday}</Form.Select>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="WednesdayCheck" label="Wednesday" value="Wednesday" onChange={event => handleCheckboxChange(window, event)} checked={window.Wednesday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Wednesday.startHour} onChange={event => updateWindow({ ...window, Wednesday: {...window.Wednesday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Wednesday.selected===0}>{startHourOptions.Wednesday}</Form.Select>
                                    <Form.Select value={window.Wednesday.endHour} onChange={event => updateWindow({ ...window, Wednesday: {...window.Wednesday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Wednesday.selected===0} isInvalid={(window.Wednesday.endHour-window.Wednesday.startHour)<minDuration}>{endHourOptions.Wednesday}</Form.Select>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="ThursdayCheck" label="Thursday" value="Thursday" onChange={event => handleCheckboxChange(window, event)} checked={window.Thursday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Thursday.startHour} onChange={event => updateWindow({ ...window, Thursday: {...window.Thursday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Thursday.selected===0}>{startHourOptions.Thursday}</Form.Select>
                                    <Form.Select value={window.Thursday.endHour} onChange={event => updateWindow({ ...window, Thursday: {...window.Thursday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Thursday.selected===0} isInvalid={(window.Thursday.endHour-window.Thursday.startHour)<minDuration}>{endHourOptions.Thursday}</Form.Select>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="FridayCheck" label="Friday" value="Friday" onChange={event => handleCheckboxChange(window, event)} checked={window.Friday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Friday.startHour} onChange={event => updateWindow({ ...window, Friday: {...window.Friday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Friday.selected===0}>{startHourOptions.Friday}</Form.Select>
                                    <Form.Select value={window.Friday.endHour} onChange={event => updateWindow({ ...window, Friday: {...window.Friday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Friday.selected===0} isInvalid={(window.Friday.endHour-window.Friday.startHour)<minDuration}>{endHourOptions.Friday}</Form.Select>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="SaturdayCheck" label="Saturday" value="Saturday" onChange={event => handleCheckboxChange(window, event)} checked={window.Saturday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Saturday.startHour} onChange={event => updateWindow({ ...window, Saturday: {...window.Saturday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Saturday.selected===0}>{startHourOptions.Saturday}</Form.Select>
                                    <Form.Select value={window.Saturday.endHour} onChange={event => updateWindow({ ...window, Saturday: {...window.Saturday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Saturday.selected===0} isInvalid={(window.Saturday.endHour-window.Saturday.startHour)<minDuration}>{endHourOptions.Saturday}</Form.Select>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Form.Check className="fw-semibold" type="checkbox" id="SundayCheck" label="Sunday" value="Sunday" onChange={event => handleCheckboxChange(window, event)} checked={window.Sunday.selected===1}/>
                            </Col>
                            <Col xs={8}>
                                <InputGroup>
                                    <Form.Select value={window.Sunday.startHour} onChange={event => updateWindow({ ...window, Sunday: {...window.Sunday, startHour: parseInt(event.target.value)} })} 
                                    disabled={window.Sunday.selected===0}>{startHourOptions.Sunday}</Form.Select>
                                    <Form.Select value={window.Sunday.endHour} onChange={event => updateWindow({ ...window, Sunday: {...window.Sunday, endHour: parseInt(event.target.value)} })} 
                                    disabled={window.Sunday.selected===0} isInvalid={(window.Sunday.endHour-window.Sunday.startHour)<minDuration}>{endHourOptions.Sunday}</Form.Select>
                                </InputGroup>
                            </Col>
                        </Row>
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


function getWindowByDayLabel(window) {
    const MAX_LENGTH = 60;
    let label = "";
    for (const day of DAYS) {
        if (window[day].selected === 1 && label.length < MAX_LENGTH) {
            label += `${day} ${HOURS[window[day].startHour]} to ${HOURS[window[day].endHour]} `;
        }
    }
    if (label.length > 0 && label.length < MAX_LENGTH) {
        return label;
    } else if (label.length > 0 && label.length > MAX_LENGTH) {
        return label.substring(0, MAX_LENGTH) + "...";
    } else {
        return "Invalid window";
    }
}


function WindowTag({ window, onEditSelf, onDeleteSelf }) {
    return (
        <Badge bg={"light"} text={"dark"}>
            <Stack direction={"horizontal"} gap={1}>
                <a href={"#"} className={"link-primary"} onClick={onEditSelf}>{getWindowLabel(window)}</a>
                <CloseButton onClick={onDeleteSelf} />
            </Stack>
        </Badge>
    );
}


function WindowTagByDay({ window, onEditSelf, onDeleteSelf }) {
    return (
        <Badge bg={"light"} text={"dark"}>
            <Stack direction={"horizontal"} gap={1}>
                <a href={"#"} className={"link-primary"} onClick={onEditSelf}>{getWindowByDayLabel(window)}</a>
                <CloseButton onClick={onDeleteSelf} />
            </Stack>
        </Badge>
    );
}


function WindowTagCollection({ windowCollection, onEditWindow, onDeleteWindow }) {
    if (windowCollection.length > 0) {
        let mappedWindow = [];
        for (const item of windowCollection) {
            if (item.value.type === 1) {
                mappedWindow = [
                    ...mappedWindow, 
                    <WindowTagByDay key={item.key} window={item.value} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} />
                ];
            } else if (item.value.type === 0){
                mappedWindow = [
                    ...mappedWindow, 
                    <WindowTag key={item.key} window={item.value} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} />
                ];
            }
        }
        return mappedWindow;
    } else {
        return <Badge bg={"white"} text={"dark"}>No windows</Badge>
    }
}


function PreferenceModal({ 
    isVisible, onCancel, onSave, windowCollection, cycles, setCycles, 
    onCreateWindow, onDeleteWindow, onEditWindow, 
    onCreateWindowByDay}) {

    const cyclesOptions = range(6, 1).map(value =>
        <option key={value} value={value}>At least {value} cycle{value === 1 ? "" : "s"}</option>
    );

    return (
        <Modal show={isVisible} onHide={onCancel} animation={false} backdrop={"static"} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit preference
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className={"fw-semibold"}>Valid windows</Form.Label>
                        <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                            <WindowTagCollection windowCollection={windowCollection} onEditWindow={onEditWindow} onDeleteWindow={onDeleteWindow}/>
                            <Button size={"sm"} onClick={onCreateWindowByDay}>Add window</Button>
                            <Button size={"sm"} onClick={onCreateWindow}>Advanced Options</Button>
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


function getPreferenceLabel(windowCollection, cycles) {
    if (windowCollection.length >= 1) {
        const windowDays = [];
        for (const [index, day] of DAYS.entries()) {
            for (const window of windowCollection) {
                if (window.value.type === 0 && window.value.startDay <= index && index <= window.value.endDay) {
                    windowDays.push(index);
                    break;
                } else if (window.value.type === 1 && window.value[day].selected === 1) {
                    windowDays.push(index);
                    break;
                }
            }
        }

        const startHours = new Set();
        const endHours = new Set();
        for (const window of windowCollection) {
            if (window.value.type === 0) {
                startHours.add(window.value.startHour);
                endHours.add(window.value.endHour);
            } else if (window.value.type === 1) {
                for (const day of DAYS) {
                    if (window.value[day].selected === 1) {
                        startHours.add(window.value[day].startHour);
                        endHours.add(window.value[day].endHour);
                    }
                }
            }
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
                if (windowCollection[0].value.type === 0) {
                    return `from ${HOURS[windowCollection[0].value.startHour]} to ${HOURS[windowCollection[0].value.endHour]}`;
                } else if (windowCollection[0].value.type === 1) {
                    for (const day of DAYS) {
                        if (windowCollection[0].value[day].selected === 1) {
                            return `from ${HOURS[windowCollection[0].value[day].startHour]} to ${HOURS[windowCollection[0].value[day].endHour]}`;
                        }
                    }
                }
            }
            return "at various times";
        }

        return `At least ${cycles} cycle${cycles === 1 ? "" : "s"} ${getDayLabel()} ${getTimeLabel()}`;
    } else {
        return "Invalid preference";
    }
}


function PreferenceTag({ windowCollection, cycles, onEditSelf, onDeleteSelf }) {
    return (
        <Badge bg={"light"} text={"dark"}>
            <Stack direction={"horizontal"} gap={1}>
                <a href={"#"} className={"link-primary"} onClick={onEditSelf}>{getPreferenceLabel(windowCollection, cycles)}</a>
                <CloseButton onClick={onDeleteSelf} />
            </Stack>
        </Badge>
    );
}


function PreferenceTagCollection({ preferenceCollection, onEditWindow, onDeleteWindow }) {
    if (preferenceCollection.length > 0) {
        return preferenceCollection.map(item =>
            <PreferenceTag key={item.key} windowCollection={item.windows} cycles={item.cycles} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} />
        );
    } else {
        return <Badge bg={"white"} text={"dark"}>No preferences</Badge>
    }
}


function DependencyModal({ isVisible, onCancel, onSave, appliance, dependency, setDependency, disabledAppliance=[] }) {
    const actionOptions = [1, 2, 3, 6, 12, 24, 48].map(value =>
        <option key={value} value={value}>{appliance} cycle may start at most {value} hour{value === 1 ? "" : "s"} after...</option>
    );

    const eventOptions = APPLIANCES.map((value, index) => {
        if (value !== appliance && !disabledAppliance.includes(value)) {
            return <option key={value} value={value}>...end of {value.toLowerCase()} cycle</option>;
        }
    });

    return (
        <Modal show={isVisible} onHide={onCancel} animation={false} backdrop={"static"} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit dependency
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className={"fw-semibold"}>Appliance action</Form.Label>
                        <Form.Select defaultValue={dependency.hours} onChange={event => setDependency({ ...dependency, hours: parseInt(event.target.value) })}>{actionOptions}</Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className={"fw-semibold"}>Reference event</Form.Label>
                        <Form.Select defaultValue={dependency.appliance} onChange={event => setDependency({ ...dependency, appliance: event.target.value })}>{eventOptions}</Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onSave} disabled={false}>Save</Button>
                <Button onClick={onCancel} variant={"secondary"}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}


function getDependencyLabel(appliance, dependency) {
    console.log(dependency)
    return `Start at most ${dependency.hours} hour${dependency.hours === 1 ? "" : "s"} after end of ${dependency.appliance.toLowerCase()} cycle`;
}


function DependencyTag({ appliance, dependency, onEditSelf, onDeleteSelf }) {
    return (
        <Badge bg={"light"} text={"dark"}>
            <Stack direction={"horizontal"} gap={1}>
                <a href={"#"} className={"link-primary"} onClick={onEditSelf}>{getDependencyLabel(appliance, dependency)}</a>
                <CloseButton onClick={onDeleteSelf} />
            </Stack>
        </Badge>
    );
}


function DependencyTagCollection({ appliance, dependencyCollection, onEdit, onDelete }) {
    if (dependencyCollection.length > 0) {
        return dependencyCollection.map(item =>
            <DependencyTag key={item.key} appliance={appliance} dependency={item.value} onEditSelf={() => onEdit(item.key)} onDeleteSelf={() => onDelete(item.key)} />
        );
    } else {
        return <Badge bg={"white"} text={"dark"}>No dependencies</Badge>
    }
}


function PlanTag({ task, onEditSelf, onDeleteSelf }){
    // return (
    //     <Badge bg={"light"} text={"dark"}>
    //         <Stack direction={"horizontal"} gap={1}>
    //             <a href={"#"} className={"link-primary"} onClick={onEditSelf}>{getPlanLabel(task)}</a>
    //             <CloseButton onClick={onDeleteSelf} />
    //         </Stack>
    //     </Badge>
    // );
    return (
        <Badge bg={"light"} text={"dark"}>
            <Stack direction={"horizontal"} gap={1}>
                <span>{getPlanLabel(task)}</span>
            </Stack>
        </Badge>
    );
}

function getPlanLabel(task) {
    const start = SCHEDULE_START.add(task.start, "hour");
    const end = SCHEDULE_START.add(task.start + task.duration, "hour");

    function getStartTimeLabel() {
        console.log(SCHEDULE_START, SCHEDULE_END, start.day(), end)
        return `on ${DAYS[start.day()===0 ? 6: start.day()-1]} ${start.format("HH:mm")}`;
    }

    function getEndTimeLabel() {
        if (start.day() === end.day()) {
            return `to ${end.format("HH:mm")}`;
        } else {
            return `to ${DAYS[end.add(1, "hour").day()-1]} ${end.format("HH:mm")}`;
        }
    }

    return `1 cycle of ${task.device} ${getStartTimeLabel()} ${getEndTimeLabel()}`;
}


function PlanTagCollection({ planCollection, onEditWindow, onDeleteWindow }) {
    let planWindow = [];
    if (planCollection.length > 0) {
        // There should be only one window here
        for (const item of planCollection) {
            planWindow = [
                ...planWindow, 
                <PlanTag key={item.key} task={item.task} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} />
            ];
        }

        return planWindow;
    }
    if (planCollection.length === 0 || planWindow.length === 0) {
        return <Badge bg={"white"} text={"dark"}>No plan</Badge>
    }
}

function PlanJustifyForm({ appliance, tasks, savedPreferences, setSavedPreferences, savedDependencies, setSavedDependencies, minDuration=1 }) {
    const defaultWindow = {
        startDay: 0,
        startHour: 0,
        endDay: 0,
        endHour: 1,
        type: 0
    };

    // savedPlanCollection => [{key:..., value: {startDay:..., startHour:..., endDay:..., endHour:...}}]
    // savedPreferences => {key:..., windows: savedPlanCollection, cycles:...}
    const [savedPlanCollection, setSavedPlanCollection] = useState([]);

    const [activeWindow, setActiveWindow] = useState(defaultWindow);
    const [selectedWindowKey, setSelectedWindowKey] = useState(null);
    const [isWindowModalVisible, setIsWindowModalVisible] = useState(false);

    function onCancelWindowModal() {
        setIsWindowModalVisible(false);
    }

    function onEditWindowModal(windowKey) {
        const savedWindow = savedPlanCollection.find(item => item.key === windowKey);
        setSelectedWindowKey(windowKey);
        setActiveWindow(savedWindow.value.value);
        setIsWindowModalVisible(true);
    }

    function onDeleteWindowModal(windowKey) {
        setSavedPlanCollection(savedPlanCollection.filter(item => item.key !== windowKey));
    }

    function onSaveWindowModal() {
        setIsWindowModalVisible(false);
        if (savedPlanCollection.find(item => item.key === selectedWindowKey)) {
            setSavedPlanCollection(
                savedPlanCollection.map(item => {
                    if (item.key === selectedWindowKey) {
                        console.log(`Updating the plan ${selectedWindowKey}`);
                        return { key: item.key, value: {key: null, value: activeWindow}, task: {...item.task, start: activeWindow.startDay*24+activeWindow.startHour}  };
                    } else {
                        return item;
                    }
                })
            );
            console.log(activeWindow)
            setSavedPreferences(savedPreferences.map(item => {
                if (item.key === selectedWindowKey) {
                    console.log(`Updating the preference ${selectedWindowKey}`);
                    return { key: item.key, windows: [{key: null, value: activeWindow}], cycles: 1 };
                } else {
                    return item;
                }
            }
            ));
        } else {
            console.log("Cannot find the plan");
        }

    }

    function assignWindow(task) {
        return {
            ...defaultWindow,
            startDay: Math.floor(task.start / 24),
            endDay: Math.floor((task.start + task.duration) / 24),
            startHour: task.start % 24,
            endHour: (task.start % 24 + task.duration) % 24,
            type: 0
        };
    }

    useEffect(() => {
        // Create windows
        let currentPlanCollection = tasks.map((item) => {
            if (item.device !== 'Battery' && item.device === appliance) {
                return { key: uuid(), value: {key: null, value: assignWindow(item)}, task: item };
            } else {
                return undefined;
            }
        });
        
        currentPlanCollection = currentPlanCollection.filter((plan) => plan !== undefined);

        const currentPreference = currentPlanCollection.length===0 ? [] : currentPlanCollection.map((plan) => {
            return { key: plan.key, windows: [plan.value], cycles: 1 };
        });

        setSavedPlanCollection(currentPlanCollection);
        setSavedPreferences(currentPreference);
        // setSavedDependencies(savedDependencies);
    }, [tasks]);
  
    return (
      <Card className="form-control">
        <Form.Label className={"fw-semibold"}>{`The AI schedule for ${appliance}`}</Form.Label>
        <Card.Body>
            <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                <PlanTagCollection
                planCollection={savedPlanCollection}
                onEditWindow={onEditWindowModal}
                onDeleteWindow={onDeleteWindowModal}
                />
            </Stack>
        </Card.Body>
        <WindowModal
            isVisible={isWindowModalVisible}
            onCancel={onCancelWindowModal}
            onSave={onSaveWindowModal}
            window={activeWindow}
            setWindow={setActiveWindow}
            minDuration={minDuration}
            isStrictMode={true}
        />
      </Card>
    );
}


function ExplanationForm({ appliance, stage, oldTasks, modifiedTasks, importPrices, exportPrices}) {
    function computePrices(tasks) {
        let batteryImportPrice = 0;
        let batteryExportPrice = 0;
        let washerPrice = 0;
        let dryerPrice = 0;
        if (tasks.length > 0) {
            for (const task of tasks) {
                for (let timestep = task.start; timestep < task.start + task.duration; timestep++) {
                    if (task.device === "Battery") {
                        if (task.action === "Charge") {
                            batteryImportPrice += importPrices[timestep].y * 1;
                        }
                        if (task.action === "Discharge") {
                            batteryExportPrice += exportPrices[timestep].y * 1;
                        }
                    } else if (task.device === "Washer") {
                        washerPrice += importPrices[timestep].y * 0.75;
                    } else if (task.device === "Dryer") {
                        dryerPrice += importPrices[timestep].y * 3;
                    }
                }
            }
        }
        return {
            total: batteryImportPrice - batteryExportPrice + washerPrice + dryerPrice,
            BatteryCharge: batteryImportPrice, 
            BatteryDischarge: batteryExportPrice, 
            Washer: washerPrice, 
            Dryer: dryerPrice
        };
    }

    const oldPrice = computePrices(oldTasks);
    const newPrice = computePrices(modifiedTasks);
    const batteryChargeChange = newPrice.BatteryCharge - oldPrice.BatteryCharge;
    const batteryDischargeChange = newPrice.BatteryDischarge - oldPrice.BatteryDischarge;
    const washerChange = newPrice.Washer - oldPrice.Washer;
    const dryerChange = newPrice.Dryer - oldPrice.Dryer;

    let text = "";
    if (newPrice.total-oldPrice.total > 0 && (newPrice.Washer!==0 || newPrice.Dryer!==0)) {
        text = `Your price will increase by ${(newPrice.total - oldPrice.total).toFixed(2)} in pence (p) .`;
    } else if (newPrice.total - oldPrice.total < 0 && (newPrice.Washer!==0 || newPrice.Dryer!==0)) {
        text = `Your price will decrease by ${Math.abs(newPrice.total - oldPrice.total).toFixed(2)} in pence (p) .`;
    } else {
        text = `It seems that you did not change the plan.`;
    }

    let detailText = "";
    if (dryerChange > 0 && newPrice.Dryer!==0) {
        detailText += `You pay ${dryerChange.toFixed(2)} pence (p) more for Dryer. `;
    } else if (dryerChange < 0 && newPrice.Dryer!==0) {
        detailText = `You pay ${Math.abs(dryerChange).toFixed(2)} pence (p) less for Dryer. `;
    }
    if (washerChange > 0 && newPrice.Washer!==0) {
        detailText += `You pay ${washerChange.toFixed(2)} pence (p) more for Washer. `;
    } else if (washerChange < 0 && newPrice.Washer!==0) {
        detailText = `You pay ${Math.abs(washerChange).toFixed(2)} pence (p) less for Washer. `;
    }
    if (batteryChargeChange > 0 && newPrice.BatteryCharge!==0) {
        detailText += `You pay ${batteryChargeChange.toFixed(2)} pence (p) more for Battery Charge. `;
    } else if (batteryChargeChange < 0 && newPrice.BatteryCharge!==0) {
        detailText = `You pay ${Math.abs(batteryChargeChange).toFixed(2)} pence (p) less for Battery Charge. `;
    }
    if (batteryDischargeChange > 0 && newPrice.BatteryDischarge!==0) {
        detailText += `You earn ${batteryDischargeChange.toFixed(2)} more from Battery Discharge. `;
    } else if (batteryDischargeChange < 0 && newPrice.BatteryDischarge!==0) {
        detailText = `You earn ${Math.abs(batteryDischargeChange).toFixed(2)} less from Battery Discharge. `;
    }

    if (detailText === "") {
        detailText = "No detailed price change on appliances.";
    }

    const popover = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">Price change on appliances.</Popover.Header>
          <Popover.Body>
            {detailText}
          </Popover.Body>
        </Popover>
      );

    if (stage === 0) {
        return (
            <Card className="form-control mt-3 mb-3">
                <Form.Label className={"fw-semibold"}>{`Explanation on your total price`}</Form.Label>
                <Card.Body>
                    <Form.Text>{`The total income is ${-newPrice.total.toFixed(2)} pence (p). It consists of: `}</Form.Text>
                    <br />
                    <ul>
                        <li><Form.Text>{`Battery Charge: ${newPrice.BatteryCharge.toFixed(2)} pence (p)`}</Form.Text></li>
                        <li><Form.Text>{`Battery Discharge: ${newPrice.BatteryDischarge.toFixed(2)} pence (p)`}</Form.Text></li>
                        <li><Form.Text>{`Washer: ${newPrice.Washer.toFixed(2)} pence (p)`}</Form.Text></li>
                        <li><Form.Text>{`Dryer: ${newPrice.Dryer.toFixed(2)} pence (p)`}</Form.Text></li>
                    </ul>
                </Card.Body>
            </Card>
        );
    } else if (stage === 1){
        return (
            <Card className="form-control mt-3 mb-3">
                <Form.Label className={"fw-semibold"}>{`Explanation on your price change for ${appliance}`}</Form.Label>
                <Card.Body>
                    <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                        <Form.Text>{text}</Form.Text>
                        <br />
                        <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                            <Button variant="success">Details</Button>
                        </OverlayTrigger>
                    </Stack>
                </Card.Body>
            </Card>
        );
    }

}


function AppliancePreferenceForm({ appliance, savedPreferences, setSavedPreferences, savedDependencies, setSavedDependencies, minDuration=1, useDependency=true }) {
    const defaultWindow = { 
        startDay: 0, 
        startHour: 0, 
        endDay: 0, 
        endHour: 1,
        type: 0
    };
    const defaultWindowByDay = { 
        Monday:{selected: 0, startHour: 0, endHour: 24},
        Tuesday:{selected: 0, startHour: 0, endHour: 24},
        Wednesday:{selected: 0, startHour: 0, endHour: 24},
        Thursday:{selected: 0, startHour: 0, endHour: 24},
        Friday:{selected: 0, startHour: 0, endHour: 24},
        Saturday:{selected: 0, startHour: 0, endHour: 24},
        Sunday:{selected: 0, startHour: 0, endHour: 24},
        type: 1
    };

    const defaultWindowCollection = [];
    const defaultCycles = 1;
    const defaultDependency = { hours: 1, appliance: APPLIANCES[0] === appliance ? APPLIANCES[1] : APPLIANCES[0] };

    const [activeWindow, setActiveWindow] = useState(defaultWindow);
    const [activeWindowByDay, setActiveWindowByDay] = useState(defaultWindowByDay); // new window added
    const [activeWindowCollection, setActiveWindowCollection] = useState(defaultWindowCollection); // Try to reuse
    // const [activeWindowByDayCollection, setActiveWindowByDayCollection] = useState(defaultWindowByDayCollection); // new window added
    const [activeCycles, setActiveCycles] = useState(defaultCycles);
    const [activeDependency, setActiveDependency] = useState(defaultDependency);

    const [selectedPreferenceKey, setSelectedPreferenceKey] = useState(null);
    const [selectedWindowKey, setSelectedWindowKey] = useState(null);
    const [selectedWindowByDayKey, setSelectedWindowByDayKey] = useState(null); // new window added
    const [selectedDependencyKey, setSelectedDependencyKey] = useState(null);

    const [isPreferenceModalVisible, setIsPreferenceModalVisible] = useState(false);
    const [isWindowModalVisible, setIsWindowModalVisible] = useState(false);
    const [isWindowByDayModalVisible, setIsWindowByDayModalVisible] = useState(false); // new window added
    const [isDependencyModalVisible, setIsDependencyModalVisible] = useState(false);

    function onCreatePreference() {
        setActiveWindowCollection(defaultWindowCollection);
        setActiveCycles(defaultCycles);
        setSelectedPreferenceKey(uuid());
        setIsPreferenceModalVisible(true);
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
            setSavedPreferences([...savedPreferences, { key: selectedPreferenceKey, windows: activeWindowCollection, cycles: activeCycles }]);
        }
    }

    function onCancelPreferenceModal() {
        setIsPreferenceModalVisible(false);
    }

    function onCreateWindow() {
        setActiveWindow(defaultWindow);
        setSelectedWindowKey(uuid());
        setIsPreferenceModalVisible(false);
        setIsWindowModalVisible(true);
        setIsWindowByDayModalVisible(false);
    }

    function onCreateWindowByDay() {
        setActiveWindowByDay(defaultWindowByDay);
        setSelectedWindowByDayKey(uuid());
        setIsPreferenceModalVisible(false);
        setIsWindowModalVisible(false);
        setIsWindowByDayModalVisible(true);
    }

    function onEditWindow(windowKey) {
        const savedWindow = activeWindowCollection.find(item => item.key === windowKey);
        if (savedWindow && savedWindow.value.type === 0) {
            setSelectedWindowKey(windowKey);
            setActiveWindow(savedWindow.value);
            setIsPreferenceModalVisible(false);
            setIsWindowModalVisible(true);
        } else if (savedWindow && savedWindow.value.type === 1) {
            setSelectedWindowByDayKey(windowKey);
            setActiveWindowByDay(savedWindow.value);
            setIsPreferenceModalVisible(false);
            setIsWindowByDayModalVisible(true);
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

    function onSaveWindowByDayModal() {
        setIsWindowByDayModalVisible(false);
        setIsPreferenceModalVisible(true);
        if (activeWindowCollection.find(item => item.key === selectedWindowByDayKey)) {
            setActiveWindowCollection(activeWindowCollection.map(item => {
                if (item.key === selectedWindowByDayKey) {
                    return { ...item, value: activeWindowByDay };
                } else {
                    return item;
                }
            }));
        } else {
            setActiveWindowCollection([...activeWindowCollection, { key: selectedWindowByDayKey, value: activeWindowByDay}]);
        }
    }

    function onCancelWindowModal() {
        setIsWindowModalVisible(false);
        setIsPreferenceModalVisible(true);
    }

    function onCancelWindowByDayModal() {
        setIsWindowByDayModalVisible(false);
        setIsPreferenceModalVisible(true);
    }

    function onCreateDependency() {
        setActiveDependency(defaultDependency);
        setSelectedDependencyKey(uuid());
        setIsDependencyModalVisible(true);
    }

    function onEditDependency(dependencyKey) {
        const savedDependency = savedDependencies.find(item => item.key === dependencyKey);
        if (savedDependency) {
            setActiveDependency(savedDependency.value);
            setSelectedDependencyKey(dependencyKey);
            setIsDependencyModalVisible(true);
        }
    }

    function onDeleteDependency(dependencyKey) {
        setSavedDependencies(savedDependencies.filter(item => item.key !== dependencyKey));
    }

    function onSaveDependencyModal() {
        setIsDependencyModalVisible(false);
        const savedDependency = savedDependencies.find(item => item.key === selectedDependencyKey);
        if (savedDependency) {
            setSavedDependencies(savedDependencies.map(dependencyItem => {
                if (dependencyItem.key === selectedDependencyKey) {
                    return { ...dependencyItem, value: activeDependency };
                } else {
                    return dependencyItem;
                }
            }));
        } else {
            setSavedDependencies([...savedDependencies, { key: selectedDependencyKey, value: activeDependency }]);
        }
    }

    function onCancelDependencyModal() {
        setIsDependencyModalVisible(false);
    }
    
    if (useDependency==true) {
    return (
        <Card className="form-control">
            {/* <Card.Header>{appliance}</Card.Header> */}
            <Form.Label className={"fw-semibold"}>{appliance}</Form.Label>
            <Card.Body>
                <Stack gap={1}>
                    <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                        <PreferenceTagCollection preferenceCollection={savedPreferences} onEditWindow={onEditPreference} onDeleteWindow={onDeletePreference} />
                        <Button size={"sm"} onClick={onCreatePreference}>Add preference</Button>
                    </Stack>
                    <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                        <DependencyTagCollection appliance={appliance} dependencyCollection={savedDependencies} onEdit={onEditDependency} onDelete={onDeleteDependency} />
                        <Button size={"sm"} onClick={onCreateDependency}>Add dependency</Button>
                    </Stack>
                </Stack>
            </Card.Body>
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
                onCreateWindowByDay={onCreateWindowByDay}
            />
            <WindowModal
                isVisible={isWindowModalVisible}
                onCancel={onCancelWindowModal}
                onSave={onSaveWindowModal}
                window={activeWindow}
                setWindow={setActiveWindow}
                minDuration={minDuration}
            />
            <WindowModalByDay
                isVisible={isWindowByDayModalVisible}
                onCancel={onCancelWindowByDayModal}
                onSave={onSaveWindowByDayModal}
                window={activeWindowByDay}
                setWindow={setActiveWindowByDay}
                minDuration={minDuration}
            />
            <DependencyModal
                isVisible={isDependencyModalVisible}
                onCancel={onCancelDependencyModal}
                onSave={onSaveDependencyModal}
                appliance={appliance}
                dependency={activeDependency}
                setDependency={setActiveDependency}
                disabledAppliance={["Dishwasher", "Vehicle"]}
            />
        </Card>
    );
    } else {
    return (
        <Card className="form-control">
            <Form.Label className={"fw-semibold"}>{appliance}</Form.Label>
            <Card.Body>
            <Card.Text>
                <Stack gap={1}>
                    <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                        <PreferenceTagCollection preferenceCollection={savedPreferences} onEditWindow={onEditPreference} onDeleteWindow={onDeletePreference} />
                        <Button size={"sm"} onClick={onCreatePreference}>Add preference</Button>
                    </Stack>
                </Stack>
            </Card.Text>
            </Card.Body>
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
                onCreateWindowByDay={onCreateWindowByDay}
            />
            <WindowModal
                isVisible={isWindowModalVisible}
                onCancel={onCancelWindowModal}
                onSave={onSaveWindowModal}
                window={activeWindow}
                setWindow={setActiveWindow}
                minDuration={minDuration}
            />
            <WindowModalByDay
                isVisible={isWindowByDayModalVisible}
                onCancel={onCancelWindowByDayModal}
                onSave={onSaveWindowByDayModal}
                window={activeWindowByDay}
                setWindow={setActiveWindowByDay}
                minDuration={minDuration}
            />
        </Card>
    );
}
}

function ExperimentPagination({ currentStage, setCurrentStage }) {
    return (
        <Pagination>
            <Pagination.Item 
                onClick={() => {setCurrentStage(0); window.scrollTo(0, 0);}} 
                active={currentStage===0 || currentStage===1 || currentStage===2 ?true:false}
            >{1}</Pagination.Item>
            <Pagination.Item 
                onClick={() => {setCurrentStage(3); window.scrollTo(0, 0);}} 
                active={currentStage===3 || currentStage===4 ?true:false}
                disabled={currentStage<2}
            >{2}</Pagination.Item>
            <Pagination.Item 
                onClick={() => {setCurrentStage(5); window.scrollTo(0, 0);}} 
                active={currentStage===5 ?true:false}
                disabled={currentStage<4}
            >{3}</Pagination.Item>
        </Pagination>
    );
}


function ChartNavigation({viewMin, setViewMin, viewMax, setViewMax}) {
    function handleZoomOut() {
        const oldMin = viewMin;
        const oldMax = viewMax;
        const newMin = oldMin.subtract(1, "day");
        const newMax = oldMax.add(1, "day");
        const newDiff = newMax.diff(newMin, "day");
        if (newMin < SCHEDULE_START) {
            setViewMin(SCHEDULE_START);
            setViewMax(SCHEDULE_START.add(newDiff, "day"));
        } else if (newMax > SCHEDULE_END) {
            setViewMin(SCHEDULE_END.subtract(newDiff, "day"));
            setViewMax(SCHEDULE_END);
        } else {
            setViewMin(newMin);
            setViewMax(newMax);
        }
    }

    function handleZoomIn() {
        const newMin = viewMin.add(1, "day");
        const newMax = viewMax.subtract(1, "day");
        const newDiff = newMax.diff(newMin, "day");
        if (newMin < SCHEDULE_START) {
            setViewMin(SCHEDULE_START);
            setViewMax(SCHEDULE_START.add(newDiff, "day"));
        } else if (newMax > SCHEDULE_END) {
            setViewMin(SCHEDULE_END.subtract(newDiff, "day"));
            setViewMax(SCHEDULE_END);
        } else {
            setViewMin(newMin);
            setViewMax(newMax);
        }
    }

    function handleReset() {
        setViewMin(SCHEDULE_START);
        setViewMax(SCHEDULE_END);
    }

    function handlePrevious() {
        setViewMin(viewMin.subtract(1, "day"));
        setViewMax(viewMax.subtract(1, "day"));
    }

    function handleNext() {
        setViewMin(viewMin.add(1, "day"));
        setViewMax(viewMax.add(1, "day"));
    }

    return (
        <ButtonToolbar aria-label="Navigation" className={"justify-content-evenly"}>
            <ButtonGroup aria-label="Level">
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleZoomOut} disabled={viewMax.diff(viewMin, "day") >= 7}>
                    <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                    Zoom out
                </Button>
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleZoomIn} disabled={viewMax.diff(viewMin, "day") <= 1}>
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                    Zoom in
                </Button>
            </ButtonGroup>
            <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleReset} disabled={(viewMin <= SCHEDULE_START) && (viewMax >= SCHEDULE_END)}>
                <FontAwesomeIcon icon={faArrowRotateRight} />
                Reset
            </Button>
            <ButtonGroup aria-label="Page">
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handlePrevious} disabled={viewMin <= SCHEDULE_START}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Previous
                </Button>
                <Button variant="outline-secondary" size="sm" className={"icon-link"} onClick={handleNext} disabled={viewMax >= SCHEDULE_END}>
                    <FontAwesomeIcon icon={faArrowRight} />
                    Next
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    );
}

function ScheduleTab({ tasks, data_labels=["Washer", "Battery"], chartheight=384}) {
    const [viewMin, setViewMin] = useState(SCHEDULE_START);
    const [viewMax, setViewMax] = useState(SCHEDULE_END);

    return (
        <Container>
            <div className="py-5" style={{height: `${chartheight}px`}}>
                <ScheduleChart tasks={tasks} schedule_start={SCHEDULE_START} view_min={viewMin} view_max={viewMax} data_labels={data_labels}/>
            </div>
            <ChartNavigation viewMin={viewMin} setViewMin={setViewMin} viewMax={viewMax} setViewMax={setViewMax} />
        </Container>
    );
}


function RequirementsTabPilot({ username, api_token, savedSchedules, setSavedSchedules, pollingActive, setPollingActive }) {
    const [savedWasherPreferences, setSavedWasherPreferences] = useState([]);
    const [savedWasherDependencies, setSavedWasherDependencies] = useState([]); // Not used
    const [savedWasherNewPreferences, setSavedWasherNewPreferences] = useState([]);
    const [savedWasherNewDependencies, setSavedWasherNewDependencies] = useState([]); // Not used
    const [savedWasherFinalPreferences, setSavedWasherFinalPreferences] = useState([]);

    const [savedDryerPreferences, setSavedDryerPreferences] = useState([]);
    const [savedDryerNewPreferences, setSavedDryerNewPreferences] = useState([]);
    const [savedDryerDependencies, setSavedDryerDependencies] = useState([]);
    const [savedDryerNewDependencies, setSavedDryerNewDependencies] = useState([]);
    const [savedDryerFinalPreferences, setSavedDryerFinalPreferences] = useState([]);



    const [currentStage, setCurrentStage] = useState(0);
    // 0: start, 1: washer requirements, 2: explanation, 3: dryer requirements, 4: explanation, 5: schedule

    // Price Tab
    const [importPrices, setImportPrices] = useState([]);
    const [exportPrices, setExportPrices] = useState([]);

    useEffect(() => {
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
    }, []);

    // Schedule Tab
    const [tasks, setTasks] = useState([]);
    const [tasksDryer, setTasksDryer] = useState([]);
    const [tasksWasher, setTasksWasher] = useState([]);
    const [tasksDryerModified, setTasksDryerModified] = useState([]);
    const [tasksWasherModified, setTasksWasherModified] = useState([]);

    // Following seems necessarily for setInterval and clearInterval to work
    const savedSchedulesRef = useRef(savedSchedules);
    const pollingActiveRef = useRef(pollingActive);

    function formatPreferences(preferences) {
        const formattedPreferences = [];
        for (const preference of preferences) {
            const timesteps = [];
            for (let timestep = 0; timestep < 168; timestep++) {
                for (const window of preference.windows) {
                    if (window.value.type === 0) {
                        const windowStartTimestep = window.value.startDay * 24 + window.value.startHour;
                        const windowEndTimestep = window.value.endDay * 24 + window.value.endHour;
                        if (windowStartTimestep <= timestep && timestep < windowEndTimestep) {
                            timesteps.push(timestep);
                            break;
                        }
                    } else if (window.value.type === 1) {
                        for (const [index, day] of DAYS.entries()) {
                            if (window.value[day].selected === 1) {
                                const windowStartTimestep = index * 24 + window.value[day].startHour;
                                const windowEndTimestep = index * 24 + window.value[day].endHour;
                                if (windowStartTimestep <= timestep && timestep < windowEndTimestep) {
                                    timesteps.push(timestep);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            formattedPreferences.push({ timesteps: timesteps, min_required_cycles: preference.cycles });
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

    function getProblem(savedWasherPreferences, savedWasherDependencies, savedDryerPreferences, savedDryerDependencies){
        return {
            "horizon": 168,
            "battery": {
                "capacity": 6,
                "rate": 1,
                "initial_level": 0,
                "min_required_level": 0
            },
            "appliances": [
                {
                    "label": "Washer",
                    "duration": WASHERDURATION,
                    "rate": 0.75,
                    "min_required_cycles": formatPreferences(savedWasherPreferences),
                    "dependencies": formatDependencies(savedWasherDependencies)
                },
                {
                    "label": "Dryer",
                    "duration": DRYERDURATION,
                    "rate": 1.5,
                    "min_required_cycles": formatPreferences(savedDryerPreferences),
                    "dependencies": formatDependencies(savedDryerDependencies)
                },
                {
                    "label": "Dishwasher",
                    "duration": DISHWASHERDURATION,
                    "rate": 1.2,
                    "min_required_cycles": formatPreferences([]),
                    "dependencies": formatDependencies([])
                },
                {
                    "label": "Vehicle",
                    "duration": VEHICLEDURATION,
                    "rate": 5,
                    "min_required_cycles": formatPreferences([]),
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

    function onSaveWasher() {
        setCurrentStage(1);
        const problem = getProblem(savedWasherPreferences, savedWasherDependencies, savedDryerPreferences, savedDryerDependencies);
        onSave(problem);
    }

    function onSaveWasherNew() {
        setCurrentStage(2);
        const problem = getProblem(savedWasherNewPreferences, [], savedDryerNewPreferences, []);
        onSave(problem);
    }

    function onSaveDryer() {
        setCurrentStage(3);
        const problem = getProblem(savedWasherNewPreferences, [], savedDryerPreferences, savedDryerDependencies);
        onSave(problem);
        setSavedDryerNewDependencies(savedDryerDependencies);
    }

    function onSaveDryerNew() {
        setCurrentStage(4);
        const problem = getProblem(savedWasherNewPreferences, [], savedDryerNewPreferences, []);
        onSave(problem);
    }


    function updateTasks(data) {
        if (currentStage === 0) {
            setTasksWasher(data);
        }
        if (currentStage === 1) {
            setTasksWasher(data);
        }
        if (currentStage === 2) {
            setTasksWasherModified(data);
            setTasksDryer(data);
        }
        if (currentStage === 3) {
            setTasksDryer(data);

        }
        if (currentStage === 4) {
            setTasksDryerModified(data);
        }
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
                    if (data != null) {
                        console.log(data);
                        setPollingActive(false);
                        setTasks(data);
                        updateTasks(data);
                    }
                })
                .catch((error) => console.log(error));
        }
    }


    useEffect(() => 
        {
            const initProblem = getProblem(savedWasherPreferences, savedWasherDependencies, savedDryerPreferences, savedDryerDependencies);
            onSave(initProblem);
        }, []);

    useEffect(() => {
        const interval = setInterval(updateSchedule, 2000);
        return () => clearInterval(interval);
    }, [currentStage]);

    useEffect(() => {
        savedSchedulesRef.current = savedSchedules;
        localStorage.setItem("savedSchedules", JSON.stringify(savedSchedules));
    }, [savedSchedules]);

    useEffect(() => {
        pollingActiveRef.current = pollingActive;
        updateSchedule();
    }, [pollingActive]);

    if (currentStage === 0 || currentStage === 1 || currentStage === 2) {
    return (
        <Container className={"m-3"}>
            <h6 className={"display-6"}>
                Schedule your appliances
            </h6>
            <p>
                Please set up your requirement for washer.
            </p>
            <Card style={{ width: '40rem' }}>
                <Card.Header>
                    <FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon> Information for washer
                </Card.Header>
                <Card.Body>
                    <Card.Text>
                        <FontAwesomeIcon icon={faClock}></FontAwesomeIcon> A washer cycle takes <strong>2 hours</strong> to complete.
                        <br />
                        <FontAwesomeIcon icon={faBoltLightning}></FontAwesomeIcon> It consumes 0.75 kW per hour, which equals <strong>1.5 kWh</strong> for a two-hour run.
                </Card.Text>
                </Card.Body>
            </Card>

            <Container className={"mt-3 p-3 bg-light"}>
                <Form>
                <h3 className={"p-3"}> Part I: Set up your washer requirement </h3>
                <Row>
                    <Col className="m-3">
                        <Row>
                            <AppliancePreferenceForm  appliance={"Washer"} savedPreferences={savedWasherPreferences} setSavedPreferences={setSavedWasherPreferences} savedDependencies={savedWasherDependencies} setSavedDependencies={setSavedWasherDependencies} minDuration={WASHERDURATION} useDependency={false} />
                            <figure className="text-center">
                                <Button className="m-3" variant="primary" onClick={onSaveWasher} disabled={savedWasherPreferences.length===0}>Schedule with AI</Button>
                            </figure>
                        </Row>
                        <Row>
                            <PlanJustifyForm appliance={"Washer"} tasks={tasksWasher} savedPreferences={savedWasherPreferences} setSavedPreferences={setSavedWasherNewPreferences} savedDependencies={[]} setSavedDependencies={setSavedDryerFinalPreferences} minDuration={WASHERDURATION}/>
                            <ExplanationForm appliance={"Washer"} stage={0} oldTasks={tasksWasher} modifiedTasks={tasksWasher} importPrices={importPrices} exportPrices={exportPrices} />
                        </Row>
                    </Col>
                    <Col className="m-3">
                        <Card>
                            <Card.Header>
                                <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                                    <Form.Label className="fw-semibold">Your home schedule for next week</Form.Label>
                                    <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
                                </Stack>
                            </Card.Header>
                        <Card.Body>
                            <ScheduleTab tasks={tasksWasher} data_labels={["Washer", "Battery"]}/>
                        </Card.Body>
                        </Card>
                    </Col>
                </Row>
                </Form>
            </Container>

            <Container className={"p-3 mt-3 bg-light"}>
                {/* Adjust Preference */}
                <h3 className={"p-3"}> Do you want to modify your preference? </h3>
                <Row>
                    <Col className="m-3">
                        <Row>
                            <AppliancePreferenceForm appliance={"Washer"} savedPreferences={savedWasherNewPreferences} setSavedPreferences={setSavedWasherNewPreferences} savedDependencies={savedWasherDependencies} setSavedDependencies={setSavedWasherDependencies} minDuration={WASHERDURATION} useDependency={false} />
                            <figure className="text-center">
                                <Button className="m-3" variant="primary" onClick={onSaveWasherNew} disabled={savedWasherNewPreferences.length===0}>Reschedule with AI</Button>
                            </figure>
                        </Row>
                        <Row>
                            <PlanJustifyForm appliance={"Washer"} tasks={tasksWasherModified} savedPreferences={savedWasherNewPreferences} setSavedPreferences={setSavedWasherFinalPreferences} savedDependencies={[]} setSavedDependencies={setSavedDryerFinalPreferences} minDuration={WASHERDURATION}/>
                            <ExplanationForm appliance={"Washer"} stage={1} oldTasks={tasksWasher} modifiedTasks={tasksWasherModified} importPrices={importPrices} exportPrices={exportPrices} />
                        </Row>
                    </Col>
                    <Col className="m-3">
                        <Card>
                            <Card.Header>
                                <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                                    <Form.Label className="fw-semibold">Your home schedule for next week</Form.Label>
                                    <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
                                </Stack>
                            </Card.Header>
                        <Card.Body>
                            <ScheduleTab tasks={tasksWasherModified} data_labels={["Washer", "Battery"]}/>
                        </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <figure className="text-center">
                <Button className="m-3" variant="primary" onClick={() => {setCurrentStage(3); window.scrollTo(0, 0);}} disabled={currentStage<2}>Next</Button>
            </figure>
            <Stack gap={3} className="d-flex justify-content-center align-items-center mx-auto mt-3">
                <ExperimentPagination currentStage={currentStage} setCurrentStage={setCurrentStage} />
            </Stack>
            {/* <p>Schedules: {JSON.stringify(savedSchedules)}</p> */}

        </Container>

    );
    } else if (currentStage === 3 || currentStage === 4) {
        return (
            <Container className={"m-3"}>
                <h6 className={"display-6"}>
                    Schedule your appliances
                </h6>
                <p>
                    Please set up your requirement for dryer.
                </p>
                <Card style={{ width: '40rem' }}>
                    <Card.Header>
                        <FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon> Information for dryer
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>
                            <FontAwesomeIcon icon={faClock}></FontAwesomeIcon> A dryer cycle takes <strong>3 hours</strong> to complete.
                            <br />
                            <FontAwesomeIcon icon={faBoltLightning}></FontAwesomeIcon> It consumes 1.5 kW per hour, which equals <strong>4.5 kWh</strong> for a three-hour run.
                    </Card.Text>
                    </Card.Body>
                </Card>

                <Container className={"p-3 mt-3 bg-light"}>
                    <h3 className={"p-3"}> Part II: Set up your dryer requirement </h3>
                    <Row>
                        <Col className="m-3">
                            <Row>
                                <AppliancePreferenceForm appliance={"Dryer"} savedPreferences={savedDryerPreferences} setSavedPreferences={setSavedDryerPreferences} savedDependencies={savedDryerDependencies} setSavedDependencies={setSavedDryerDependencies} minDuration={DRYERDURATION}/>
                                <figure className="text-center">
                                    <Button className="m-3" variant="primary" onClick={onSaveDryer} disabled={savedDryerPreferences.length===0}>Schedule with AI</Button>
                                </figure>
                            </Row>
                            <Row>
                                <PlanJustifyForm appliance={"Dryer"} tasks={tasksDryer} savedPreferences={savedDryerPreferences} setSavedPreferences={setSavedDryerNewPreferences} savedDependencies={savedDryerPreferences} setSavedDependencies={setSavedDryerNewDependencies} minDuration={DRYERDURATION}/>
                                <ExplanationForm appliance={"Dryer"} stage={0} oldTasks={tasksDryer} modifiedTasks={tasksDryer} importPrices={importPrices} exportPrices={exportPrices} />
                            </Row>
                        </Col>
                        <Col className="m-3">
                            <Card>
                                <Card.Header>
                                <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                                    <Form.Label className="fw-semibold">Your home schedule for next week</Form.Label>
                                    <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
                                </Stack>
                                </Card.Header>
                                <Card.Body>
                                    <ScheduleTab tasks={tasksDryer} data_labels={["Washer", "Dryer", "Battery"]}/>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                <Container className={"p-3 mt-3 bg-light"}>
                    {/* Adjust Preference */}
                    <h3 className={"p-3"}> Do you want to modify your preference? </h3>
                    <Row>
                        <Col className="m-3">
                            <Row>
                                <AppliancePreferenceForm appliance={"Dryer"} savedPreferences={savedDryerNewPreferences} setSavedPreferences={setSavedDryerNewPreferences} savedDependencies={savedDryerNewDependencies} setSavedDependencies={setSavedDryerNewDependencies} minDuration={DRYERDURATION} />
                                <figure className="text-center">
                                    <Button className="m-3" variant="primary" onClick={onSaveDryerNew} disabled={savedDryerNewPreferences.length===0}>Reschedule with AI</Button>
                                </figure>
                            </Row>
                            <Row>
                                <PlanJustifyForm appliance={"Dryer"} tasks={tasksDryerModified} savedPreferences={savedDryerNewPreferences} setSavedPreferences={setSavedDryerNewPreferences} savedDependencies={savedDryerNewPreferences} setSavedDependencies={setSavedDryerNewDependencies} minDuration={DRYERDURATION}/>
                                <ExplanationForm appliance={"Dryer"} stage={1} oldTasks={tasksDryer} modifiedTasks={tasksDryerModified} importPrices={importPrices} exportPrices={exportPrices} />
                            </Row>
                        </Col>
                        <Col className="m-3">
                            <Card>
                                <Card.Header>
                                <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
                                    <Form.Label className="fw-semibold">Your modified home schedule for next week</Form.Label>
                                    <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
                                </Stack>
                                </Card.Header>
                                <Card.Body>
                                    <ScheduleTab tasks={tasksDryerModified} data_labels={["Washer", "Dryer", "Battery"]}/>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <figure className="text-center">
                    <ButtonGroup aria-label="Page">
                        <Button className="m-3" variant="secondary" onClick={() => {setCurrentStage(2); window.scrollTo(0, 0);}} >Previous</Button>
                        <Button className="m-3" variant="primary" onClick={() => {setCurrentStage(5); window.scrollTo(0, 0);}} disabled={currentStage<4}>Next</Button>
                    </ButtonGroup>
                </figure>
                <Stack gap={3} className="d-flex justify-content-center align-items-center mx-auto m-3">
                    <ExperimentPagination currentStage={currentStage} setCurrentStage={setCurrentStage} />
                </Stack>
                {/* <p>Schedules: {JSON.stringify(savedSchedules)}</p> */}
            </Container>

            // <Container className={"p-5"}>
            //     <h1 className={"title"}>
            //         Your requirements
            //     </h1>
            //     <Form>
            //         <h3 className={"p-3"}> Experiment 2: Set your dryer </h3>
            //         <Row className={"p-5"}>
            //             <Col>
            //                 <AppliancePreferenceForm appliance={"Dryer"} savedPreferences={savedDryerPreferences} setSavedPreferences={setSavedDryerPreferences} savedDependencies={savedDryerDependencies} setSavedDependencies={setSavedDryerDependencies} minDuration={DRYERDURATION}/>
            //                 <Button onClick={onSaveDryer} disabled={savedDryerPreferences.length===0}>Save Preference</Button>
            //             </Col>
            //             <Col>
            //                 <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
            //                     <Form.Label className="fw-semibold">Your home schedule for next week</Form.Label>
            //                     <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
            //                 </Stack>
            //                 <div className="py-5" style={{height: "384px"}}>
            //                     <ScheduleChart tasks={tasksDryer} schedule_start={SCHEDULE_START} view_min={viewMin} view_max={viewMax} data_labels={["Washer", "Dryer", "Battery"]}/>
            //                 </div>
            //             </Col>
            //         </Row>
            //         <Row className={"p-5"}>
            //             <Col>
            //                 <AppliancePreferenceForm appliance={"Dryer"} savedPreferences={savedDryerPreferences} setSavedPreferences={setSavedDryerPreferences} savedDependencies={savedDryerDependencies} setSavedDependencies={setSavedDryerDependencies} minDuration={DRYERDURATION}/>
            //                 <Button onClick={onSaveDryerNew} disabled={savedDryerPreferences.length===0}>Save Preference</Button>

            //                 <PlanJustifyForm className={"p-5"} appliance={"Dryer"} tasks={tasksDryer} savedPreferences={savedDryerNewPreferences} setSavedPreferences={setSavedDryerNewPreferences} minDuration={DRYERDURATION}/>
            //                 <Button onClick={onSaveDryerNew} disabled={savedWasherPreferences.length===0 && savedDryerPreferences.length===0}>Save Your Plan</Button>
            //                 <br className="m-5" />
            //                 <ExplanationForm className={"p-5"} appliance={"Dryer"} oldTasks={tasksDryer} modifiedTasks={tasksDryerModified} importPrices={importPrices} exportPrices={exportPrices} />
            //             </Col>
            //             <Col>
            //                 <Stack direction={"horizontal"} gap={1} className={"flex-wrap"}>
            //                     <Form.Label className="fw-semibold">Your home schedule for next week</Form.Label>
            //                     <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} size="sm" />
            //                 </Stack>
            //                 <div className="py-5" style={{height: "384px"}}>
            //                     <ScheduleChart tasks={tasksDryerModified} schedule_start={SCHEDULE_START} view_min={viewMin} view_max={viewMax} data_labels={["Washer", "Dryer", "Battery"]}/>
            //                 </div>
            //             </Col>
            //         </Row>
            //     </Form>
            //     <Stack gap={3} className="d-flex justify-content-center align-items-center mx-auto">
            //         <ExperimentPagination currentStage={currentStage} setCurrentStage={setCurrentStage} />
            //     </Stack>
            //     <p>Schedules: {JSON.stringify(savedSchedules)}</p>
                
            // </Container>
        );
    } else if (currentStage === 5) {
        return (
        <Container>
            <Stack direction={"horizontal"} gap={2}>
                <h6 className={"display-6"}>
                    Your final home schedule
                </h6>
                <Spinner animation="border" variant={"secondary"} className={pollingActive? "" : "visually-hidden"} />
            </Stack>
            <p className="h6">
                Review your home schedule for next week.
            </p>
                <ScheduleTab tasks={tasksDryerModified} data_labels={["Washer", "Dryer", "Battery"]} chartheight={512}/>
            <Stack gap={3} className="justify-content-center align-items-center mt-5">
                <Link to={`/survey`} relative="path">
                    <Button variant="primary">Survey</Button>
                </Link>
                <ExperimentPagination currentStage={currentStage} setCurrentStage={setCurrentStage} />
            </Stack>
        </Container>
        );
    }
}


export default RequirementsTabPilot;
