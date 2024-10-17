This project uses the node.js javascript runtime environment.

First install node using the node-v20.18.0-x64.msi file included.
*Note: it may ask if you want to install Chocolatey with your node installation. You WONT need Chocolatey for this.

----

Once Node is installed you can use the run.bat file to start the ship tracker.
run.bat will open a Command Prompt window that will act as a web server to yourself.
While this Command Prompt window is open the ship table will be accessible on at the url localhost:3000

run.bat should also open a browser window and take you to the ship table.

----

Hovering over a quantum drive button should display the purchase location at the top of the page

----

Raw ship data and quantum drive purchase data are accessible in the ships.json file and the quantum_drives.json files, should you want to modify something directly.