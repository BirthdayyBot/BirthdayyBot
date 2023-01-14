export default {
  "name": "birthday",
  "description": "Birthday Command",
  "options": [
    {
      "type": 1,
      "name": "register",
      "description": "Register your Birthday",
      "options": [
        {
          "type": 4,
          "name": "day",
          "description": "Day of birthday",
          "required": true
        },
        {
          "type": 3,
          "name": "month",
          "description": "Month of birthday",
          "choices": [
            {
              "name": "January",
              "value": "01"
            },
            {
              "name": "February",
              "value": "02"
            },
            {
              "name": "March",
              "value": "03"
            },
            {
              "name": "April",
              "value": "04"
            },
            {
              "name": "May",
              "value": "05"
            },
            {
              "name": "June",
              "value": "06"
            },
            {
              "name": "July",
              "value": "07"
            },
            {
              "name": "August",
              "value": "08"
            },
            {
              "name": "September",
              "value": "09"
            },
            {
              "name": "October",
              "value": "10"
            },
            {
              "name": "November",
              "value": "11"
            },
            {
              "name": "December",
              "value": "12"
            }
          ],
          "required": true
        },
        {
          "type": 4,
          "name": "year",
          "description": "Year of birthday"
        },
        {
          "type": 6,
          "name": "user",
          "description": "Set a birthday for another Person - MANAGER ONLY"
        }
      ]
    },
    {
      "type": 1,
      "name": "update",
      "description": "Update your birthday - MANAGER ONLY",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "Update a Birthday for a Person - MANAGER ONLY",
          "required": true
        },
        {
          "type": 4,
          "name": "day",
          "description": "Day of birthday",
          "required": true
        },
        {
          "type": 3,
          "name": "month",
          "description": "Month of birthday",
          "choices": [
            {
              "name": "January",
              "value": "01"
            },
            {
              "name": "February",
              "value": "02"
            },
            {
              "name": "March",
              "value": "03"
            },
            {
              "name": "April",
              "value": "04"
            },
            {
              "name": "May",
              "value": "05"
            },
            {
              "name": "June",
              "value": "06"
            },
            {
              "name": "July",
              "value": "07"
            },
            {
              "name": "August",
              "value": "08"
            },
            {
              "name": "September",
              "value": "09"
            },
            {
              "name": "October",
              "value": "10"
            },
            {
              "name": "November",
              "value": "11"
            },
            {
              "name": "December",
              "value": "12"
            }
          ],
          "required": true
        },
        {
          "type": 4,
          "name": "year",
          "description": "Year of birthday"
        }
      ]
    },
    {
      "type": 1,
      "name": "list",
      "description": "List all Birthdays in this Discord server"
    },
    {
      "type": 1,
      "name": "remove",
      "description": "Remove a birthday - MANAGER ONLY",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "The user you want to remove the birthday from",
          "required": true
        }
      ]
    },
    {
      "type": 1,
      "name": "show",
      "description": "Show the Birthday of you or a other person",
      "options": [
        {
          "type": 6,
          "name": "user",
          "description": "Show the birthday of a specific User"
        }
      ]
    },
    {
      "type": 1,
      "name": "test",
      "description": "Test your current birthday configurations"
    }
  ]
}