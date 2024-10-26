export const cg_json = {
    title: "Cuttlefish Survey Questions",
    description: "Thank you for participating in our study. The study is approaching its end, please answer the following questions to help us understand your experience with the interface and scenarios.",
    completedHtmlOnCondition: [],
    pages: [
    {
      "name": "page1",
      "title": "Basic Information",
      "elements": [
        {
          "type": "boolean",
          "name": "energy_saving",
          "title": "Have you used smart energy meters or dynamic energy tariffs?",
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
      "title": "Section 1 (Alice)",
      "elements": [
        {
          "type": "rating",
          "name": "alice_difficulty",
          "title": "In Alice's case, I find it easy to understand the Cuttlefish AI schedule.",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Strongly Disagree",
          "maxRateDescription": "Strongly Agree",
          "isRequired": true
        },
        {
          "type": "rating",
          "name": "alice_satisfaction",
          "title": "In Alice's case, how satisfied are you with the Cuttlefish AI schedule?",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Not Satisfied",
          "maxRateDescription": "Very Satisfied",
          "isRequired": true
        },
        {
          "type": "rating",
          "name": "alice_helpfulness",
          "title": "I think the Cuttlefish AI schedule will be useful for Alice.",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Strongly Disagree",
          "maxRateDescription": "Strongly Agree",
          "isRequired": true
        },
        {
          "type": "comment",
          "name": "alice_comments",
          "title": "Can you briefly describe your views on the Cuttlefish AI schedule?",
          "isRequired": false,
          "defaultValue": ""
        }
      ]
    },
    {
      "name": "page3",
      "title": "Section 2 (Bob)",
      "elements": [
        {
          "type": "rating",
          "name": "bob_difficulty",
          "title": "In Bob's case, I find it easy to understand the Cuttlefish AI schedule.",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Strongly Disagree",
          "maxRateDescription": "Strongly Agree",
          "isRequired": true
        },
        {
          "type": "rating",
          "name": "bob_satisfaction",
          "title": "In Bob's case, how satisfied are you with the Cuttlefish AI schedule?",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Not Satisfied",
          "maxRateDescription": "Very Satisfied",
          "isRequired": true
        },
        {
          "type": "rating",
          "name": "bob_helpfulness",
          "title": "I think the Cuttlefish AI schedule will be useful for Bob.",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Strongly Disagree",
          "maxRateDescription": "Strongly Agree",
          "isRequired": true
        },
        {
          "type": "comment",
          "name": "bob_comments",
          "title": "Can you briefly describe your views on the Cuttlefish AI schedule?",
          "isRequired": false,
          "defaultValue": ""
        }
      ]
    },
    {
      "name": "page4",
      "title": "Section 3",
      "elements": [
        {
          "type": "rating",
          "name": "realworld_helpfulness",
          "title": "Imagine Cuttlefish AI offered a feature allowing users to ask questions and modify schedules for home appliances using AI. Do you think this would be helpful in real-world applications?",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Strongly Disagree",
          "maxRateDescription": "Strongly Agree",
          "isRequired": true
        },
        {
          "type": "rating",
          "name": "ai_understanding",
          "title": "This study had helped me understand how AI works on scheduling in smart homes.",
          "rateCount": 7,
          "rateValues": [ 1, 2, 3, 4, 5, 6, 7],
          "minRateDescription": "Strongly Disagree",
          "maxRateDescription": "Strongly Agree",
          "isRequired": true
        },
      ]
    },
    {
      "name": "page5",
      "title": "Feedback",
      "elements": [
        {
          "type": "comment",
          "name": "cg_explanation",
          "title": "Is there any explanation you would like to have about the AI schedule? Please tell us how you would like to improve it.",
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