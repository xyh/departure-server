# Departure

Departure is a web app that provide real-time public transit depart time information in Bay Area. See http://departure.herokuapp.com.

## Project Structure

Both client side and server side code are in the same repository: departure-server. The whole project has three modules: data fetching scripts, api service and frontend javascript single page application (SPA)._ 

1. Data fetching script: files in scripts/tasks are for fetching (Angecies, Routes and Stops) data from 511 realtime data service. Because these data are not changing frequently so the scripts fetch all the data and put them into a MongoDB. The script can be invoked manually or scheduled recursively. **Another important job these scripts do is to call Google geocoding api to get all the stops geolocation in order we can do location-based query.**

2. API service: it provide basic retrieve interface to client side. Besides those already in database, it also provide interface that retrieve real-time departure times directly from 511 data service. 

3. SPA: I use AngularJS as the framework because I'm familiar with it so it's a good idea to use it for a prototype. 

## Feature

1. At the beginning the app will ask for permission to get user's location. If get user's location successfully, the map will move to that point and get nearby departure times. However, the user can refresh nearby departure info anytime on any area of the map by just click on the "Re-search current area" button at left bottom corner. 

2. User can also toggle Bus/Train Stops that currently doesn't have any departure time info. 

3. User can type in the search field and the Stops info will be filtered accordingly.

## Things need to improve

1. Geocoding all the stops. Currently there are ~10000 stops but Google geocoding api has it's usage cap (~2500 per day). So now there are only ~6400 stops have their geolocation. I tried Mapquest which doesn't have usage cap but some how it doesn't give me accurate enough result as Google does. 

2. Build automation test. 

3. More features. Now the app isn't very useful. There are lot of great features that can be added to make it useful. 

4. Better way to manage MongoDB connection.

5. Frontend file uglify, concatenate & compress in order to speed up the page loading time.

6. Optimize AngularJS code to increase web page performace.

## My other open source project

1. YXLocationPicker: https://github.com/xyh/YXLocationPicker. It is very easy to use library I wrote for myself because while I was working on iOS project, there always a need to let user "pick" an location. It can retrieve the location user want to input through address inputting with autocompletion and suggestion, or pin to the right location on map, or combination of both. And it will return both address (as a string) and a location (as a coordinate).

## About me

1. LinkedIn: http://www.linkedin.com/pub/yuhang-xu/20/a6/b01
2. Resume in GoogleDoc (most updated): https://docs.google.com/document/d/1b-ZQr6TymmJ4oCwc5p-0QgW_qW1yDmaaI_rNOGCswdc/edit?usp=sharing

