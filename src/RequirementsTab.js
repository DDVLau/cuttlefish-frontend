import React, {useEffect, useState} from "react";
import {v4 as uuid} from "uuid";
import {Badge, Button, CloseButton, Container, Form, InputGroup, Modal, Stack} from "react-bootstrap";
import {range} from "./Utilities";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];
const APPLIANCES = ["Washer", "Dryer", "Dishwasher", "Vehicle"];

function WindowModal({ isVisible, onCancel, onSave, window, setWindow }) {
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
        <option key={index} value={index} disabled={window.startDay > window.endDay || (window.startDay === window.endDay && window.startHour >= index)}>{value}</option>
    );

    const isWindowInvalid = window.startDay > window.endDay || (window.startDay === window.endDay && window.startHour >= window.endHour);

    function updateWindow(newWindow) {
        let newEndDay = newWindow.endDay < newWindow.startDay? newWindow.startDay : newWindow.endDay;
        let newEndHour = newEndDay === newWindow.startDay && newWindow.endHour <= newWindow.startHour? newWindow.startHour + 1 : newWindow.endHour;
        if (newEndDay < 6 && newEndHour > 23) {
            newEndDay += 1;
            newEndHour = 0;
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
                            <Form.Select value={window.endDay} onChange={event => updateWindow({ ...window, endDay: parseInt(event.target.value) })} isInvalid={window.startDay > window.endDay || (window.startDay === window.endDay && window.startHour === 23 && window.endDay !== 6)}>{endDayOptions}</Form.Select>
                            <Form.Select value={window.endHour} onChange={event => updateWindow({ ...window, endHour: parseInt(event.target.value) })} isInvalid={isWindowInvalid}>{endHourOptions}</Form.Select>
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


function WindowTagCollection({ windowCollection, onEditWindow, onDeleteWindow }) {
    if (windowCollection.length > 0) {
        return windowCollection.map(item =>
            <WindowTag key={item.key} window={item.value} onEditSelf={() => onEditWindow(item.key)} onDeleteSelf={() => onDeleteWindow(item.key)} />
        );
    } else {
        return <Badge bg={"white"} text={"dark"}>No windows</Badge>
    }
}


function PreferenceModal({ isVisible, onCancel, onSave, windowCollection, cycles, setCycles, onCreateWindow, onDeleteWindow, onEditWindow }) {

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
                            <WindowTagCollection windowCollection={windowCollection} onEditWindow={onEditWindow} onDeleteWindow={onDeleteWindow} />
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
            startHours.add(window.startHour);
            endHours.add(window.endHour);
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

        return `At least ${cycles} cycle${cycles === 1? "" : "s"} ${getDayLabel()} ${getTimeLabel()}`;
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


function DependencyModal({ isVisible, onCancel, onSave, appliance, dependency, setDependency }) {
    const actionOptions = [1, 2, 3, 6, 12, 24, 48].map(value =>
        <option key={value} value={value}>{appliance} cycle may start at most {value} hour{value === 1? "" : "s"} after...</option>
    );

    const eventOptions = APPLIANCES.map((value, index) => {
        if (value !== appliance) {
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
                        <Form.Select defaultValue={dependency.hours} onChange={event => setDependency({...dependency, hours: parseInt(event.target.value)})}>{actionOptions}</Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className={"fw-semibold"}>Reference event</Form.Label>
                        <Form.Select defaultValue={dependency.appliance} onChange={event => setDependency({...dependency, appliance: event.target.value})}>{eventOptions}</Form.Select>
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
    return `Start at most ${dependency.hours} hour${dependency.hours === 1? "" : "s"} after end of ${dependency.appliance.toLowerCase()} cycle`;
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


function AppliancePreferenceForm({ appliance, savedPreferences, setSavedPreferences, savedDependencies, setSavedDependencies }) {
    const defaultWindow = { startDay: 0, startHour: 0, endDay: 0, endHour: 1 };
    const defaultWindowCollection = [];
    const defaultCycles = 1;
    const defaultDependency = {hours: 1, appliance: APPLIANCES[0] === appliance? APPLIANCES[1] : APPLIANCES[0]};

    const [activeWindow, setActiveWindow] = useState(defaultWindow);
    const [activeWindowCollection, setActiveWindowCollection] = useState(defaultWindowCollection);
    const [activeCycles, setActiveCycles] = useState(defaultCycles);
    const [activeDependency, setActiveDependency] = useState(defaultDependency);

    const [selectedPreferenceKey, setSelectedPreferenceKey] = useState(null);
    const [selectedWindowKey, setSelectedWindowKey] = useState(null);
    const [selectedDependencyKey, setSelectedDependencyKey] = useState(null);

    const [isPreferenceModalVisible, setIsPreferenceModalVisible] = useState(false);
    const [isWindowModalVisible, setIsWindowModalVisible] = useState(false);
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
            setSavedPreferences([...savedPreferences, { key: selectedPreferenceKey, windows: activeWindowCollection, cycles: activeCycles}]);
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

    function onCancelWindowModal() {
        setIsWindowModalVisible(false);
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
            setSavedDependencies([...savedDependencies, { key: selectedDependencyKey, value: activeDependency}]);
        }
    }

    function onCancelDependencyModal() {
        setIsDependencyModalVisible(false);
    }

    return (
        <Form.Group className="mb-3">
            <Form.Label className={"fw-semibold"}>{appliance}</Form.Label>
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
            />
            <WindowModal
                isVisible={isWindowModalVisible}
                onCancel={onCancelWindowModal}
                onSave={onSaveWindowModal}
                window={activeWindow}
                setWindow={setActiveWindow}
            />
            <DependencyModal
                isVisible={isDependencyModalVisible}
                onCancel={onCancelDependencyModal}
                onSave={onSaveDependencyModal}
                appliance={appliance}
                dependency={activeDependency}
                setDependency={setActiveDependency}
            />
        </Form.Group>
    );
}


function RequirementsTab({ username, api_token, savedSchedules, setSavedSchedules, pollingActive, setPollingActive }) {
    const [savedWasherPreferences, setSavedWasherPreferences] = useState([]);
    const [savedWasherDependencies, setSavedWasherDependencies] = useState([]);

    const [savedDryerPreferences, setSavedDryerPreferences] = useState([]);
    const [savedDryerDependencies, setSavedDryerDependencies] = useState([]);

    const [savedDishwasherPreferences, setSavedDishwasherPreferences] = useState([]);
    const [savedDishwasherDependencies, setSavedDishwasherDependencies] = useState([]);

    const [savedVehiclePreferences, setSavedVehiclePreferences] = useState([]);
    const [savedVehicleDependencies, setSavedVehicleDependencies] = useState([]);

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

    const problem = {
        "horizon": 168,
        "battery": {
            "capacity": 3,
            "rate": 3,
            "initial_level": 0,
            "min_required_level": 0
        },
        "appliances": [
            {
                "label": "Washer",
                "duration": 2,
                "rate": 0.75,
                "min_required_cycles": formatPreferences(savedWasherPreferences),
                "dependencies": formatDependencies(savedWasherDependencies)
            },
            {
                "label": "Dryer",
                "duration": 3,
                "rate": 1.5,
                "min_required_cycles": formatPreferences(savedDryerPreferences),
                "dependencies": formatDependencies(savedDryerDependencies)
            },
            {
                "label": "Dishwasher",
                "duration": 1,
                "rate": 1.2,
                "min_required_cycles": formatPreferences(savedDishwasherPreferences),
                "dependencies": formatDependencies(savedDishwasherDependencies)
            },
            {
                "label": "Vehicle",
                "duration": 8,
                "rate": 5,
                "min_required_cycles": formatPreferences(savedVehiclePreferences),
                "dependencies": formatDependencies(savedVehicleDependencies)
            }
        ]
    }

    function onSave() {
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

    useEffect(() => onSave(), []);

    return (
        <Container className={"p-5"}>
            <h1 className={"title"}>
                Your requirements
            </h1>
            <Form>
                <AppliancePreferenceForm appliance={"Washer"} savedPreferences={savedWasherPreferences} setSavedPreferences={setSavedWasherPreferences} savedDependencies={savedWasherDependencies} setSavedDependencies={setSavedWasherDependencies} />
                <AppliancePreferenceForm appliance={"Dryer"} savedPreferences={savedDryerPreferences} setSavedPreferences={setSavedDryerPreferences} savedDependencies={savedDryerDependencies} setSavedDependencies={setSavedDryerDependencies} />
                <AppliancePreferenceForm appliance={"Dishwasher"} savedPreferences={savedDishwasherPreferences} setSavedPreferences={setSavedDishwasherPreferences} savedDependencies={savedDishwasherDependencies} setSavedDependencies={setSavedDishwasherDependencies} />
                <AppliancePreferenceForm appliance={"Vehicle"} savedPreferences={savedVehiclePreferences} setSavedPreferences={setSavedVehiclePreferences} savedDependencies={savedVehicleDependencies} setSavedDependencies={setSavedVehicleDependencies} />
                <Button onClick={onSave}>Save</Button>
            </Form>
            <p>Schedules: {JSON.stringify(savedSchedules)}</p>
        </Container>
    );
}


export default RequirementsTab;
