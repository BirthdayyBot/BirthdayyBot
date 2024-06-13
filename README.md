# Birthday Bot

Birthday Bot is a Discord bot that manages server members' birthdays.

## Features

-   Records members' birthday dates
-   Sends automatic birthday messages
-   Allows users to wish a happy birthday
-   Manages reminders for upcoming birthdays

## Installation

1. Clone this repository to your local machine.
2. Make sure you have Node.js and Yarn installed.
3. Run `yarn install` to install the dependencies.
4. Import the `template.yaml` file to your doppler account. Update the variables to match your server's configuration.
5. Run `yarn start` to launch the bot.

## Configuration

For configuration we use doppler, you can import the template and modify the configuration directly on it.

[![Import to Doppler](https://raw.githubusercontent.com/DopplerUniversity/app-config-templates/main/doppler-button.svg)](https://dashboard.doppler.com/workplace/template/import?template=https%3A%2F%2Fgithub.com%2FBirthdayyBot%2FBirthdayyBot%2Fblob%2Fmaster%2Fdoppler-template.yaml)

## Usage

-   Use the `/birthday set [day] [month] <year>` command to record your birthday date.
-   Use the `/birthday list` command to see the list of birthdays for the day.
-   Use the `/birthday view <member>` command to view a member's birthday.

## Contributing

If you would like to contribute to this project, feel free to open a pull request. Any contribution is welcome!

## License

This project is licensed under the MIT License. Please see the [`LICENSE`](LICENSE) file for more information.
