import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { 
  Button,
  Container,
  Card,
  Form, 
  InputGroup,
  Stack, 
  OverlayTrigger,
  Popover,
  Table,
} from "react-bootstrap";

import { DAYS, HOURS, APPLIANCES, PARAMS } from "./data/constants";
import { CheckRequirements } from "./RequirementsTabAlice";

function computePrices(tasks, importPrices, exportPrices) {
  let batteryImportPrice = 0;
  let batteryExportPrice = 0;
  let washerPrice = 0;
  let dryerPrice = 0;
  let dishWasherPrice = 0;
  let vehiclePrice = 0;
  if (tasks.length > 0 && exportPrices.length > 0 && importPrices.length > 0) {
    for (const task of tasks) {
      for (let timestep = task.start; timestep < task.start + task.duration; timestep++) {

        if (task.device === "Battery" && task.action === "Charge") {
            batteryImportPrice += importPrices[timestep].y * PARAMS.Battery.rate;
        } else if (task.device === "Battery" && task.action === "Discharge") {
            batteryExportPrice += exportPrices[timestep].y * PARAMS.Battery.rate;
        } else if (task.device === "Washer") {
            washerPrice += importPrices[timestep].y * PARAMS.Washer.rate;
        } else if (task.device === "Dryer") {
            dryerPrice += importPrices[timestep].y * PARAMS.Dryer.rate;
        } else if (task.device === "Dishwasher") {
            dishWasherPrice += importPrices[timestep].y * PARAMS.Dishwasher.rate;
        } else if (task.device === "Vehicle") {
            vehiclePrice += importPrices[timestep].y * PARAMS.Vehicle.rate;
        }
      }
    }
  }
  return ({
    total: batteryImportPrice + washerPrice + dryerPrice + dishWasherPrice + vehiclePrice - batteryExportPrice,
    BatteryCharge: batteryImportPrice, 
    BatteryDischarge: - batteryExportPrice, 
    Washer: washerPrice, 
    Dryer: dryerPrice,
    Dishwasher: dishWasherPrice,
    Vehicle: vehiclePrice
  }
  );
}

function PriceBreakdown({oldTasks, modifiedTasks, oldBill, newBill, importPrices, exportPrices}) {
  const oldPrice = computePrices(oldTasks, importPrices, exportPrices);
  const newPrice = computePrices(modifiedTasks, importPrices, exportPrices);

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Bill breakdown</Popover.Header>
      <Popover.Body>
        <Form.Text>{`Default AI schedule bill is ${oldBill.toFixed(2)} pence (p).`}</Form.Text>
        <Form.Text>{`Your bill is ${newBill.toFixed(2)} pence (p).`}</Form.Text>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th><Form.Text>Appliance</Form.Text></th>
              <th><Form.Text>Default</Form.Text></th>
              <th><Form.Text>New</Form.Text></th>
            </tr>
          </thead>
          <tbody>
            {
              APPLIANCES.map((appliance) => {
                return (
                  <tr>
                    <td><Form.Text>{appliance}</Form.Text></td>
                    <td><Form.Text>{oldPrice[appliance].toFixed(2)} p</Form.Text></td>
                    <td><Form.Text>{newPrice[appliance].toFixed(2)} p</Form.Text></td>
                  </tr>
                );
              }
              )
            }
            <tr>
              <td><Form.Text>Battery Charge</Form.Text></td>
              <td><Form.Text>{oldPrice.BatteryCharge.toFixed(2)} p</Form.Text></td>
              <td><Form.Text>{newPrice.BatteryCharge.toFixed(2)} p</Form.Text></td>
            </tr>
            <tr>
              <td><Form.Text>Battery Discharge</Form.Text></td>
              <td><Form.Text>{oldPrice.BatteryDischarge.toFixed(2)} p</Form.Text></td>
              <td><Form.Text>{newPrice.BatteryDischarge.toFixed(2)} p</Form.Text></td>
            </tr>
          </tbody>
        </Table>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="right-start" overlay={popover}>
      <Button variant="success">{"More"}</Button>
    </OverlayTrigger>
  );
}

export function ExplanationTab({ requirements, oldTasks, modifiedTasks, oldCost, newCost, pollingActive}) {
  const oldTasksWithoutBattery = oldTasks.filter(task => task.device !== "Battery");
  const tasksWithoutBattery = modifiedTasks.filter(task => task.device !== "Battery");

  function convertArrayToText(changedAppliances) {
    let text = "";
    for (let i = 0; i < changedAppliances.length; i++) {
      text += `${changedAppliances[i].charAt(0).toLowerCase() + changedAppliances[i].substring(1)}`;
      if (i === changedAppliances.length - 2) {
        text += " and ";
      }
      else if (i < changedAppliances.length - 2){
        text += ", ";
      }
    }
    return text;
  }

  function getTaskChangeExplanation() {
    let changedAppliances = [];
    let text = "";

    for (let appliance of APPLIANCES) {
      const oldTaskApp = oldTasksWithoutBattery.filter(task => task.device === appliance);
      const modifiedTaskApp = tasksWithoutBattery.filter(task => task.device === appliance);
      if (oldTaskApp.length !== modifiedTaskApp.length || oldTaskApp.some((task, index) => task.start !== modifiedTaskApp[index].start || task.duration !== modifiedTaskApp[index].duration)){
        changedAppliances.push(appliance);
      }
    }

    if (oldTasksWithoutBattery === tasksWithoutBattery) {
      return "It seems that the schedule remains unchanged. ";
    } else if (changedAppliances.length === 0) {
      return "No appliance has been changed according to your questions. ";
    } else {
      text = convertArrayToText(changedAppliances);
      return "The appliances " + text + " have been changed according to your questions. ";
    }
    
  }
          
  function getPriceChangeExplanation(oldTasks, modifiedTasks, oldPrice, newPrice) {
    let text = "";

    if (CheckRequirements(requirements.values, modifiedTasks).every((value, index) => value === true) && newCost - oldCost > 0) {
      text += `The minimum cost satisfying the question is higher than the Cuttlefish AI schedule. `
    } else if (CheckRequirements(requirements.values, modifiedTasks).every((value, index) => value === true) && newCost - oldCost <= 0) {
      text += `The dryer is probably running before the washer cycles according to your question. The minimum cost satisfying the question is lower than the Cuttlefish AI schedule. `
    }

    if (newCost - oldCost > 0) {
        text += `Your total bill increases by ${Math.abs(newCost - oldCost).toFixed(2)} in pence (p). The alternative schedule bill is ${newCost.toFixed(2)} p, while Cuttlefish schedule bill is ${oldCost.toFixed(2)} p.`;
    } else if (Math.abs(newCost - oldCost) < 0.01) {
        text = `It seems that the bill remains unchanged. The Cuttlefish schedule bill is ${oldCost.toFixed(2)} pence (p).`;
    }

    let detailText = "";
    APPLIANCES.map((appliance) => {
      const oldTaskNum = oldTasks.filter(task => task.device === appliance).length;
      const modifiedTaskNum = modifiedTasks.filter(task => task.device === appliance).length;
      const change = newPrice - oldPrice;
      if (modifiedTaskNum-oldTaskNum > 0 && change > 0) {
          detailText += `You pay more for ${appliance} because you added ${modifiedTaskNum-oldTaskNum} cycles. `;
          const newRequirementsStatus = CheckRequirements(requirements.values, modifiedTasks);
          if (newRequirementsStatus.every((value, index) => value === true)){
            detailText += `The new cycles are redundant as all the requirements are already met. `;
          }
      } else if (modifiedTaskNum-oldTaskNum < 0 && change < 0) {
          detailText = `You pay less for ${appliance} because the number of cycles descrease from ${oldTaskNum} to ${modifiedTaskNum}. `;
      }
    }
    );

    return text+" "+detailText;
  }
    
  function getRequirementsChangeExplanation(oldTasks, modifiedTasks) {
    const oldRequirementsStatus = CheckRequirements(requirements.values, oldTasks);
    const newRequirementsStatus = CheckRequirements(requirements.values, modifiedTasks);

    let text = "";
    let detailedText = "";
    let requirementNotMet = "";
    if (oldRequirementsStatus.every((value, index) => value === newRequirementsStatus[index])) {
      return "All original requirements are met in alternative AI schedule.";
    } else {
      for (let i = 0; i < oldRequirementsStatus.length; i++) {
        if (oldRequirementsStatus[i] !== newRequirementsStatus[i]) {
          requirementNotMet += ` ${i+1}`;
          detailedText += `${requirements.values[i].fullTexts} `;
        }
      }
      text = `The question is not consistent with the original requirements. The alternative AI schedule failed to meet ${requirements.name}'s requirement(s) number ${requirementNotMet}. `;
    }
    return text + " " + detailedText;
  }

  return (
    <Card>
      <Card.Header className={"fw-semibold"}>{`Explanation`}</Card.Header>
      <Card.Body>
          { !pollingActive && tasksWithoutBattery.length > 0 ? 
          <>
          <p><Form.Text>{getRequirementsChangeExplanation(oldTasks, modifiedTasks)}</Form.Text></p>
          <p><Form.Text>{getTaskChangeExplanation(oldTasks, modifiedTasks)}</Form.Text></p>
          <p><Form.Text>{getPriceChangeExplanation(oldTasks, modifiedTasks, oldCost, newCost)}</Form.Text></p>
          </>
          :
          <p><Form.Text>{`The alternative AI schedule is being generated. Please wait.`}</Form.Text></p>
          }
      {/* <PriceBreakdown oldTasks={oldTasks} modifiedTasks={modifiedTasks} oldBill={oldCost} newBill={newCost} importPrices={importPrices} exportPrices={exportPrices} /> */}
      </Card.Body>
    </Card>
  )
}