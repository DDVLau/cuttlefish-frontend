import React, { useEffect } from "react";
import { v4 as uuid } from "uuid";

import {ListGroup} from "react-bootstrap";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCircleCheck,
    faCircleXmark
} from '@fortawesome/free-solid-svg-icons'

function CheckApplianceTimes (appliance, tasks, n=-1 ){
  const tasksAppliance = tasks.filter((item) => item.device === appliance);
  if (n >=0 && tasksAppliance.length < n){
    return false;
  } else if (n < 0 && tasksAppliance.length === 0){// check the two adjoint applianceOns are at least timeGap apart
    return false;
  }
  return true;
}

function CheckApplianceGap (appliance, tasks, mode, timeGap=-1){
  let applianceOns = tasks.map((item) => {
    if (item.device === appliance){
      return(item.start);
    } else{
      return null;
    }
  });
  applianceOns = applianceOns.filter((item) => item !== null);
  applianceOns.sort((a, b) => a - b);

  for (let i = 0; i < applianceOns.length - 1; i++){
    if (timeGap >=0 && mode === "greater" && applianceOns[i+1] - applianceOns[i] < timeGap){
      return false;
    }
    if (timeGap >=0 && mode === "less" && applianceOns[i+1] - applianceOns[i] > timeGap){
      return false;
    }
  }
  return true;
}

function CheckPrerequisiteTimes (appliance, tasks, prerequisiteTimes){
  let status = false;
  const tasksAppliance = tasks.filter((item) => item.device === appliance);
  for (let i = 0; i < tasksAppliance.length; i++){
    for (let j = 0; j < prerequisiteTimes.length; j++){
      if (tasksAppliance[i].start >= prerequisiteTimes[j][0] && tasksAppliance[i].start+tasksAppliance[i].duration <= prerequisiteTimes[j][1]){
        status = true;
      }
    }
  }
  return status;
}

function CheckForbiddenTimes (appliance, tasks, forbiddenTimes){
  const tasksAppliance = tasks.filter((item) => item.device === appliance);
  for (let i = 0; i < tasksAppliance.length; i++){
    for (let j = 0; j < forbiddenTimes.length; j++){
      for (let t=tasksAppliance[i].start; t<tasksAppliance[i].start+tasksAppliance[i].duration; t++){
        if (t > forbiddenTimes[j][0] && t < forbiddenTimes[j][1]){
          return false;
        }
      }
    }
  }
  return true;
}

export function CheckRequirements( requirements, tasks ){
  let newRequirementsStatus = requirements.map((r) => {
    if (r.params){
      let status = true;
      for (let i = 0; i < r.params.length; i++){
        if (r.params[i].forbiddenTimes){
          status = status && CheckForbiddenTimes(r.params[i].appliance, tasks, r.params[i].forbiddenTimes);
        }
        if (r.params[i].prerequisiteTimes){
          status = status && CheckPrerequisiteTimes(r.params[i].appliance, tasks, r.params[i].prerequisiteTimes);
        }
        if (r.params[i].n){
          status = status && CheckApplianceTimes(r.params[i].appliance, tasks, r.params[i].n, r.params[i].timeGap);
        }
        if (r.params[i].timeGap){
          status = status && CheckApplianceGap(r.params[i].appliance, tasks, r.params[i].mode, r.params[i].timeGap);
        }
      }
      return status;
    }
    return false;
  });
  return newRequirementsStatus;
}

export default function RequirementsTab ( {title, requirements, tasks, requirementsStatus, setRequirementsStatus, colour="info"}) {
  useEffect(() => {
    const newRequirementsStatus = CheckRequirements(requirements, tasks);
    setRequirementsStatus(newRequirementsStatus);
  } , [tasks]);

  return (
    <ListGroup style={{width:"30rem"}} key={'sm'}>
      <ListGroup.Item variant={colour}>
        {title}
      </ListGroup.Item>
      {requirements.map((requirement, index) => (
        <ListGroup.Item key={uuid()}>
          <FontAwesomeIcon 
          icon={requirementsStatus[index]?faCircleCheck:faCircleXmark}
          color={requirementsStatus[index]?"green":"red"}></FontAwesomeIcon>
          {" "}
          {requirement.shortTexts}
      </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

