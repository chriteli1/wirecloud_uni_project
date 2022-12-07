# Introduction

This is a widget for plotting STH Comet data. It makes HTTP GET requests to a proxy server that brings data from Comet, for the selected (through the map) entity.

# Settings
 
- **Proxy URL**: Enter the URL of the proxy server responsible for fetching data from Comet. 

# Wiring

## Input Endpoints

- **Map output info**: Connect here the output of the map.

## Usage

You have to use this widget with the OpenLayers Map widget so the user can choose an entity. Just connect the output of the map widget to the input of this widget.