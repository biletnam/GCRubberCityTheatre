# GCRubberCityTheatre

## Setup

Run `npm install` to install the project's dependencies. You can start
the application locally by running `npm start`.

Users will login at [http://localhost:8021] with the password specified
at deployment.

Admins will login at [http://localhost:8021/admin] with the password
specified at deployment.

## Deployment

You can deploy this to [now](https://zeit.co/) by running:

`npx now -e ADMIN_NAMES="Bob|Bill|Ronald McDonald" -e ADMIN_PASSWORD="123456" -e USER_PASSWORD="1234" -e`

You can change the passwords by altering the command that you use to deploy
the application.
