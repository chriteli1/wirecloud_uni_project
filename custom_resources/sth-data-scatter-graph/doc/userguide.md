# Introduction

This is a widget for scatter plotting STH Comet data for PM1, PM2.5 and PM10 in relation with RH. It makes HTTP GET requests to a proxy server that brings data from Comet, for the selected (through the map) entity.

# Settings

- **Aggregation method**: Choose to fetch the max, min or average value.
- **Aggregation period**: Choose to fetch data per minute, hour or day.
- **Measurements for y axis**: Write the attributes you want to plot on y axis. If more than one, divide them only with a comma(,).
- **Measurement for x axis**: Write the attribute you want to plot on x axis. It has to be only one.
- **Proxy URL**: Enter the URL of the proxy server responsible for fetching data from Comet. 

# Wiring

## Input Endpoints

- **Map output info**: Connect here the output of the map.

## Usage

You have to use this widget with the OpenLayers Map widget so the user can choose an entity. Just connect the output of the map widget to the input of this widget. Once you choose a widget on the map, a scatter plot will be created with the three PM units valeus on the vertical axis and the RH values on the horizontal.