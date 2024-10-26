import React, { useCallback, useEffect, useState } from "react";
import { redirect, redirectDocument } from "react-router-dom";

import { Model, StylesManager } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.css";

import favicon from "../images/favicon.ico";

import { cg_json } from "../data/survey_json_cg.js";
import { tg_json } from "../data/survey_json_tg.js";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { getUserInfo } from "../Utilities.js";
import CompletePage from './CompletePage';

StylesManager.applyTheme("defaultV2");


export function SurveyPage() {
  const { username, api_token } = getUserInfo();
  const isControlGroup = localStorage.getItem("isControlGroup") === "true"? true: false;

  const [surveySaved, setSurveySaved] = useState(false);

  function onSaveSurvey(survey, username, api_token) {
    console.log(survey);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${username},${api_token}`,
        },
        body: JSON.stringify(survey)
    };
    fetch(`${process.env.REACT_APP_API_URL}/survey`, options)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            setSurveySaved(true);
        })
        .catch((error) => console.log(error));
  }
  
  function onValueChanged(_, options) {
    console.log("New value: " + options.value);
  }
  
  function onComplete(survey) {
    console.log("Survey complete! Results: " + JSON.stringify(survey.data));
    const savedSchedulesAlice = localStorage.getItem("savedSchedulesAlice");
    const savedSchedulesBob = localStorage.getItem("savedSchedulesBob");
    const consent_given = localStorage.getItem("consent_given");
    const inactiveTime = localStorage.getItem("inactiveTime");

    let savedInfo = {... survey.data, "savedSchedulesAlice": savedSchedulesAlice, "savedSchedulesBob": savedSchedulesBob, "consent_given": consent_given, "inactiveTime": inactiveTime, "isControlGroup": isControlGroup};

    if (!username || !api_token) {
        console.error("Missing username or api_token");
        return;
    } else {
      onSaveSurvey(savedInfo, username, api_token);
    }
  }
  
  const model = new Model(isControlGroup?cg_json:tg_json);
  return (
    <>
      <Header prolificID={username} activeTab={5}/>
      <div className="container">
      <Survey
        model={model}
        onComplete={onComplete}
        completedHtml={
          `<h3>Thank you for completing the survey!</h3> <h5>Please click <a href=/complete-page?status=completed>here</a>.</h5>`
        }
        onValueChanged={onValueChanged}
      />
      </div>
      <Footer />
    </>
  );
}

export default SurveyPage;