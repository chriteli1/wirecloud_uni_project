# Web application for visualizing data from IoT systems
**This is a repo for a web application that helps with IoT data visualization using FIWARE's Wirecloud (part of my university thesis).**

Wirecloud is a Django web application that lets the user create dashboards with virtually no coding.

- For this project I created some Wirecloud widgets to help with the visualization of data from an IoT system. 
- These widgets need an intermediate server to receive data from the APIs that Wirecloud relies on for data feed, so a Python sript was created to open a Flask server that helps with that.
- There was no infrastructure for the collection of data, so I created an additional Python script to send data to be visualized.

Web app preview:

![image](https://github.com/chriteli1/wirecloud_uni_project/assets/73424544/abdec573-5ae9-4908-9d33-b9695e0ed04f)
*Tab 1*

![image](https://github.com/chriteli1/wirecloud_uni_project/assets/73424544/7addcfd2-8873-4018-84fe-b29c6d5f71f9)
*Tab 2*

![image](https://github.com/chriteli1/wirecloud_uni_project/assets/73424544/268f8fa8-6f12-47d9-a12e-dc92d636bcc3)
*Tab 3*

![image](https://github.com/chriteli1/wirecloud_uni_project/assets/73424544/8c6af0a4-be9b-4622-8156-d152da1ab007)
*Tab 4*
