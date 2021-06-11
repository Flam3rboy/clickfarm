# Clickfarm

A modular account automation tool for multiple platforms with a web dashboard:

<p float="left" align="center">
  <img width="380" src="https://user-images.githubusercontent.com/34555296/121738469-8b249f80-cafa-11eb-94b2-75480da53a8c.png">
  <img width="380" src="https://user-images.githubusercontent.com/34555296/121738705-dc349380-cafa-11eb-87bc-3ff57bb75eed.png">
  <img width="950" src="https://user-images.githubusercontent.com/34555296/121738171-2a956280-cafa-11eb-9aa5-94bd1ea91839.png">
</p>

## Installation

1. [Download](https://github.com/Flam3rboy/clickfarm/archive/refs/heads/master.zip) the repository
2. Unzip it
3. Go into the directory ``executable`` and execute the corresponding binary (Windows: ``clickfarm-win.exe``)
4. Open your local dashboard http://localhost:4932

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
- [nodejs](https://nodejs.org/) ``node`` with ``npm`` installed and added to the path
- [git](https://git-scm.com/) installed

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
