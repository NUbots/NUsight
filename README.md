# NUsight
A visual real-time web-based debugging environment used to understand and improve robotics systems.

# Installation

## Windows

- Install [Node.js 4+](https://nodejs.org/en/)
- Install [Git](https://git-for-windows.github.io/)
- Install [Python 2](https://www.python.org/downloads/) - Version 2 is needed as [Node GYP doesn't support Python 3 as of this writing](https://github.com/nodejs/node-gyp/issues/193).
- Install [Microsoft Visual C++ Build Tools 2015](https://www.microsoft.com/en-us/download/details.aspx?id=49512) - Note this is not necessary if Visual Studio has been installed.
- Ensure git, python and node are on your environment PATH.
- Run the following commands:

    ```
    git clone https://github.com/NUbots/NUsight.git
    cd NUsight
    npm config set msvs_version 2015 --global # modify this to the version of visual studio installed if need be
    npm install
    ```

## Ubuntu Linux
- Install [Node.js 4+](https://nodejs.org/en/) using [Node Version Manager](https://github.com/creationix/nvm)

	```
	sudo apt-get install npm
	wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
	source ~/.profile
	nvm install node
	```
    
- Install [Python 2](https://www.python.org/downloads/) - Version 2 is needed as [Node GYP doesn't support Python 3 as of this writing](https://github.com/nodejs/node-gyp/issues/193).

    ```
    sudo apt-get install python2.7
    npm config set python python2.7
    ```
    
- Install Git

    ```
    sudo apt-get install git
    ```
    
- Run the following commands:

    ```
    git clone https://github.com/NUbots/NUsight.git
    cd NUsight
    npm install
    ```

# Running NUsight
- Run the following command:

    ```
    npm start
    ```

- Navigate your browser (Google Chrome is best supported) to [http://localhost:9090/](http://localhost:9090/)

# Troubleshooting

- If running robot code on a virtual machine and the robot connects to NUsight but no data is recieved, run the following command on the virtual machine:

	```bash 
	sudo route add -net 224.0.0.0 netmask 240.0.0.0 eth0
	```
	
- This is particularly a common problem when using virtualbox. The command forces multicast packets over the bridged interface.
