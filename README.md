# Capstone Project Two

We have broken down the Capstone Project into easy-to-follow steps. Each step of the capstone contains a link with instructions for that step. You may notice this secondCapstone follows a similar pattern to your first Capstone, however, there are key differences. 

## Introduction

Welcome to EyeHR, an electronic health record for eye care practioners but accessible by patients only to their own records. 

## How to run

Setting up back end:

Run seed generator: node seed_generator.js

Creating/seeding db:
psql 
\i ehr.sql



## Features 

Dynamic listener on encounter form inputs. Every change is logged into the server rather than have to wait for page change for submission like in 
real life EHR I'm using. 
See all unsigned encounters at once. 

## Schemas

Users (CRU)
Patients (CR)
Appointments (CRUD)
Encounters (CRUD)


## Guidelines

1. You can use any technology we’ve taught you in the course, and there’s nothing stopping you from using outside libraries are services.That being said, we recommend you use React, and Node.js for this Capstone.If you completed the optional Redux unit, we recommend you use Redux as well. You can useFlask/Python but will be expected to make a much more fully featured application than last time.
2. Every step of the project has submissions. This will alert your mentor to evaluate your work. Pay attention to the instructions so you submit the right thing. You will submit the link to your GitHub repo several times, this is for your mentor’s convenience. Your URL on GitHub is static and will not change.
3. The first two steps require mentor approval to proceed, but after that, you are free to continue working on the project after you submit your work. For instance, you don’t need your mentor to approve your database schema before you start working on your site. Likewise, you don’t need your mentor to approve the first iteration of your site before you start polishing it.
4. If you get stuck, there is a wealth of resources at your disposal. The course contains all of the material you will need to complete this project, but a well-phrased Google search might yield you an immediate solution to your problem. Don’t forget that your Slack community, TAs, and your mentor there to help you out.
5.Make sure you use a free API or create your own API and deploy your project on Heroku, so everyone can see your work!
