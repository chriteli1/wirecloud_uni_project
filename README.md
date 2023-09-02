# wirecloud_uni_project
**This is a repo for my university thesis on IoT data visualization using FIWARE's Wirecloud.**

Wirecloud is a Django web application that lets the user create dashboards with virtually no coding. It relies on APIs that FIWARE has developed.

- For the needs of the project I created some Wirecloud widgets to help with the visualization of data from an IoT system. 
- These widgets need an intermediate server to receive data from the APIs, so a Python sript was created to open a Flask server that helps with that.
- There was no infrastructure for the collection of data, so I created an additional Python script to send data to be visualized.

