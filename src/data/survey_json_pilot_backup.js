export const json = {
    title: "Cuttlefish Survey Questions",
    description: "Thank you for participating in our study. The study is approaching its end, please answer the following questions to help us understand your experience with the interface and the tutorial.",
    completedHtmlOnCondition: [],
    pages: [{
      "name": "page1",
      "title": "Basic Information",
      "elements": [
        {
          "type": "boolean",
          "name": "energy_saving",
          "title": "Have you used smart energy meters or dynamic energy tariffs for home energy saving?",
          "isRequired": true
        },
        {
          "type": "boolean",
          "name": "stem_background",
          "title": "Do you have a STEM background? (NB: STEM stands for science, technology, engineering or mathematics)",
          "isRequired": true
        },
        {
          "type": "boolean",
          "name": "ai_experience",
          "title": "Do you have any prior experience in Artificial Intelligence (AI)?",
          "isRequired": true
        }
      ]
    },
    {
      "name": "page2",
      "title": "Tutorial",
      "elements": [
        {
          "type": "radiogroup",
          "name": "tutorial_scenario",
          "title": "I find it easy to understand the scenario of the smart home appliance in tutorial.",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "tutorial_setting",
          "title": "I find it easy to understand how to set up the washer and dryers after reading the tutorial.",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "tutorial_explanations",
          "title": "I find it easy to understand the explanations in tutorial.",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
        {
          "type": "comment",
          "name": "tutorial_improvement",
          "title": "Was there anything unclear in the tutorial? Please tell us how you would like to improve.",
          "isRequired": false,
          "defaultValue": ""
        },
      ]
    },
    {
      "name": "page3",
      "title": "AI Schedule and Explanation",
      "elements": [
        {
          "type": "radiogroup",
          "name": "ai_schedule_opinion",
          "title": "After being presented with the AI schedule, what is your opinion on the AI schedule according to your preferences?",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Very Satisfied"
            },
            {
              "value": 4,
              "text": "Slightly Satisfied"
            },
            {
              "value": 3,
              "text": "Neither Satisfied nor Dissatisfied"
            },
            {
              "value": 2,
              "text": "Slightly Dissatisfied"
            },
            {
              "value": 1,
              "text": "Very Dissatisfied"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "explanation_usefulness",
          "title": "After modifying the AI schedule, what is your opinion regarding the usefulness of the explanation of price in helping you set or modify the schedule?",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Very Useful"
            },
            {
              "value": 4,
              "text": "Slightly Useful"
            },
            {
              "value": 3,
              "text": "Neither Useful nor Useless"
            },
            {
              "value": 2,
              "text": "Slightly Useless"
            },
            {
              "value": 1,
              "text": "Very Useless"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "real_world_helpfulness",
          "title": "Our survey simulates a scenario where you can ask AI about schedules for dryer and washer and modify them. Do you think this would be helpful in real world applications?",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
      ]
    },
    {
      "name": "page4",
      "title": "Curiosity & Trust",
      "elements": [
        {
          "type": "radiogroup",
          "name": "understand_ai_planning",
          "title": "This study had helped me understand how AI planning works on scheduling in smart homes.",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "xai_adoption",
          "title": "I believe the explainations will help the adoption of AI technologies.",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "ai_confidence",
          "title": "I feel the explanations have enhanced my confidence in this AI systems.",
          "isRequired": true,
          "choices": [
            {
              "value": 5,
              "text": "Strongly Agree"
            },
            {
              "value": 4,
              "text": "Agree"
            },
            {
              "value": 3,
              "text": "Neutral"
            },
            {
              "value": 2,
              "text": "Disagree"
            },
            {
              "value": 1,
              "text": "Strongly Disagree"
            }
          ]
        },
      ]
    },
    {
      "name": "page5",
      "title": "Feedback",
      "elements": [
        {
          "type": "comment",
          "name": "most_difficult_part",
          "title": "What is the most difficult part of using our interface? (e.g., adding/modifying your preference? modifying the AI schedule?)",
          "isRequired": false,
          "defaultValue": ""
        },
        {
          "type": "comment",
          "name": "interface_improvement",
          "title": "Is there anything you would change about the interface? Please tell us how you would like to improve it.",
          "isRequired": false,
          "defaultValue": ""
        },
        {
          "type": "comment",
          "name": "additional_comments",
          "title": "Do you have any additional comments or feedback on the interface or the tutorial?",
          "isRequired": false,
          "defaultValue": ""
        }
      ]
    }
  ],
    showQuestionNumbers: "on"
  };