import dayjs from "dayjs";
dayjs.locale("en-gb");

export const SCHEDULE_START = dayjs().startOf("year").add(1, "week");
export const SCHEDULE_END = SCHEDULE_START.add(1, "week");

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const HOURS = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"];
export const APPLIANCES = ["Washer", "Dryer", "Dishwasher", "Vehicle"];

export const PARAMS = {
  "Washer": {
    "label": "Washer",
    "duration": 2,
    "rate": 0.75,
  },
  "Dryer": {
    "label": "Dryer",
    "duration": 3,
    "rate": 1.5,
  },
  "Dishwasher": {
    "label": "Dishwasher",
    "duration": 1,
    "rate": 1.2,
  },
  "Vehicle": {
    "label": "Vehicle",
    "duration": 4,
    "rate": 5.0,
  },
  "Battery": {
    "capacity": 6,
    "rate": 1.0,
    "initial_level": 0,
    "min_required_level": 0
  }
};

export const NumQuestionsSet = 5;