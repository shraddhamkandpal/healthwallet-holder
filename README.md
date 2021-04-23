# Affinidi Use Case Implementation - Driving License - Holder

## Table of contents

- [Introduction](#introduction)
- [Initial Set Up](#Initial-set-up)

  - [Generate Affinidi API Key](#generate-api-key)
  - [Configure .env File](#configure-.env-file)

- [How to run](#how-to-run)
  - [Sequence](#sequence)

## Introduction

Welcome to Driving License Use Case - Holder application. In this application, you will be able to see how does a user access his/her Affinidi Wallet which will stores all of their verifiable credentials. Holder application is important as other than viewing the credentials, it can used to accept or to approve sharing of credentials.

You can either run this program in your local machine or try it out here: https://usecases.drivinglicense-holder.vc-generator.com/

## Initial Set Up

### Generate API Key

Before you could use our API and SDK services, you would have to register to get the API keys.

1. Go to apikey.affinidi.com
2. Register for an account
3. Store the `API Key` and `API Key Hash` safely

### Configure .env file

1. Open terminal and navigate to the project folder
2. Run `cp .env.example .env`
3. Fill in the .env file with the details that you have gathered in the previous steps

```
REACT_APP_API_KEY=<<Afffinidi's API Key>>
REACT_APP_API_KEY_HASH=<<Affinidi's API Key Hash>>
REACT_APP_ENVIRONMENT=prod
```

## How to run

1. Open terminal and navigate to the project folder
2. Run `npm install`
3. Run `cp .env.example .env`
4. Populate the credentials in `.env`
5. Run `npm start`

### Sequence

Run Issuer, Holder and Verifier in this sequence in your local machine.
