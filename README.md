# Clickfarm

A modular account automation tool for multiple platforms with a web dashboard:

<p float="left" align="center">
  <img width="380" src="https://user-images.githubusercontent.com/34555296/121738469-8b249f80-cafa-11eb-94b2-75480da53a8c.png">
  <img width="380" src="https://user-images.githubusercontent.com/34555296/121738705-dc349380-cafa-11eb-87bc-3ff57bb75eed.png">
  <img width="950" src="https://user-images.githubusercontent.com/34555296/121738171-2a956280-cafa-11eb-9aa5-94bd1ea91839.png">
</p>

## Installation

1. Download clickfarm:

-   [Windows](https://github.com/Flam3rboy/clickfarm/raw/master/executable/clickfarm-win.exe) (You might get a popup "Windows protected your pc", proceed by clicking on "Run anyway", this is caused because this program is not from a certified developer)
-   [Linux](https://github.com/Flam3rboy/clickfarm/raw/master/executable/clickfarm-linux) (Execute it in the terminal)
-   [MacOS](https://github.com/Flam3rboy/clickfarm/raw/master/executable/clickfarm-macos) (Open Terminal by searching in spotlight, enter `chmod +x ` and drag an drop the file into the terminal)

2. Execute it by double clicking on the file
3. Open your local dashboard at http://localhost:4932

## Disclaimer

For educational purposes only

## Platforms

### Discord

-   Register (email with password, guest with invite, method: request/browser)
-   Login (email with password, token)
-   Upload avatar
-   Verify email
-   Set date of birth
-   Set Hypesquad
-   connect (online, status)
-   Send friend Request
-   Remove friend
-   Send (Direct) message
-   Join/Leave Server
-   Add/Remove reaction
-   [ ] Science requests

### Twitch

-   Register
-   Login
-   Change profile picture
-   [ ] Send chat message
-   [ ] View stream
-   [ ] View VOD

### Todo

-   [ ] Instagram
-   [ ] Facebook
-   [ ] Spotify
-   [ ] Reddit
-   [ ] Twitter
-   [ ] Google

## Features

### Captcha solving

-   AntiCaptcha
-   2Captcha
-   [ ] Manually
-   [ ] Precaching to accelerate speed

### Email

-   IMAP client
-   Gmail (with [dot/plus trick](https://generator.email/blog/gmail-generator))

### Proxy

-   Proxy list
-   Tor
-   Huawei LTE-Stick
-   [ ] Scraper
-   [ ] VPN provider

### Lists

-   Usernames
-   Avatars
-   [ ] User agents
-   [ ] Proxies

### Todo

-   [ ] SMS verification

## Development

If you want to build or develop additional features follow this guide:

### Requirements

-   [nodejs](https://nodejs.org/) `node` with `npm` installed and added to the path
-   [git](https://git-scm.com/) installed

### Setup

Server

```
git clone https://github.com/Flam3rboy/clickfarm
cd clickfarm
npm i
npm start
```

Client:

```
cd clickfarm
cd gui
npm i
npm start
```
