# GrOne Visualizer

The GrOne visualizer illustrates the dependencies of a public Github Java project.  
Only public Github repositories are officially accepted as input for the URL.

The URL inputted must be structured like this:
  
> https://github.com/[owner]/[repository]

To arrive at the website, the URL is structured as such:
> {IP address of *Load Balancer*}:8002


# Deployment Instructions
The GrOne Visualizer is optimally run on 5 separate physical systems (6 if client is included) at the moment before a user can use the system. These will also be referred to as "nodes" further down.   
   1. The first physical component runs the __LoadBalancer__.  
     - For the sake of clarity we will call this node the *Load Balancer* from here onwards.
   2. The second physical component runs an instance of the __BlackboardManager__.  
     - For the sake of clarity we will call this node *Manager A*.
   3. The third physical component runs another instance of the __BlackboardManager__.  
     - For the sake of clarity we will call this node the *Manager B*.
   4. The fourth physical component runs an instance of the  __RepoHandler__.  
     - For the sake of clarity we will call this node the *Repo Handler*.
   5. The fifth physical component runs an instance of the __DependencyFinder__.  
     - For the sake of clarity we will call this node the *Dependency Finder*.

## Prerequisites
Several prerequisites are required to be downloaded by the physical systems before the system can function.

1. srcML is required by *Repo Handler*.
    - It should be noted that only __macOS 10.9, 10.10, and 10.11 support srcML__. srcML cannot be installed in a physical system running other versions other than the aforementioned versions of macOS as of the time of writing. Therefore, it is recommended that the node running *Repo Handler* be running Windows as the OS instead.  
    A full list of supported Operating Systems can be found [here](https://www.srcml.org/#download).
2. Node.js (v10) is required by all nodes.
3. The npm manager is also required. However, npm is distributed with node, and thus if Node.js is installed, npm should be as well. npm is also required by all nodes.
4. MongoDB(v4) is required by by *Manager A* and *Manager B* and must be running locally on both.

It is recommended that all physical systems install all of these prerequisites if possible, as that would allow all the physical systems to run any of the components and take on any of the "roles".

All of the separate physical systems running parts of the system must be within the same network. To make sure the system communicates properly, __all of the firewalls of all the participating systems must be disabled__.

Furthermore, __the IP address of all 5 systems must be known, and changed accordingly within the source code for it to function properly.__

### Changing the IP addresses in the source code
The IP addresses should be changed before beginning the deployment steps. 
There are different steps to perform for each node.
The IP addresses must be known for each physical node. The IPv4 address is used for this system.

Use the config.js file in the server folder to set up the different IPs.


## Deployment Steps
After the installation of the prerequisites and modifications of the IP addresses, follow these instructions:

For *Load Balancer*:
1. Open a terminal and enter ```npm install``` to install all the required dependencies and build the frontend.
2. In the same terminal, enter```npm run lb``` to start the __LoadBalancer__ component.

For *Manager A* and *Manager B*:
1. Open a terminal and enter ```npm install``` to install dependencies and build the frontend.
2. In the same terminal, enter ```npm run dev``` to start the __BlackboardManager__ component.

For *Repo Handler*:
1. Open a terminal and enter ```npm install``` to install dependencies and build the frontend.
2. In the same terminal, enter ```npm run rh ``` to start the __RepoHandler__ component.  

For *Dependency Finder*:
1. Open a terminal and enter ```npm install``` to install dependencies and build the frontend.
2. In the same terminal, enter ```npm run df ``` to start the __DependencyFinder__ component.  

***
**The website can be accessed and fully functional only after the steps above are done.**  

The Client, which can be a sixth separate physical system, can open its browser and use {IP address of *Load Balancer*}:8002 to arrive at the website.
___

## Local Testing

In order to test all components locally:
1. Set the IP addresses of all components to point ```127.0.0.1```.
2. Run the command ```npm run local```.

If testing locally, the syncing of data is disabled, as only one bbManagerApp.js instance is created.

# File Organization
## User Interface
The "User Interface" refers to the component that processes the visualization and contains what is presented to the user. This can be mapped to the __Visualization__ component in our component diagram which describes the architecture of the system.
The client is contained in the ```client``` folder of the repository.

+ The visualization is generated by the component ```dependGraph.vue``` located in the ```components``` directory.


## Backend
We have defined the "Backend" as the contents within the ```server``` folder. The Backend handles requests coming in and out of the system, and contain the logic for processing the data. This maps to the __LoadBalancer__, __BlackboardManager__, __RepoHandler__ and the __DependencyFinder__ components in our component diagram.

Naturally, the directories corresponding to each component are similarly named:
+ The __LoadBalancer__ is in the directory ```loadBalancer```.
+ The __RepoHandler__ lies within the directory ```RepoHandler```.
+ The __DependencyFinder__ maps to the directory ```DependencyFinder```.
+ The __BlackboardManager__ is in the directory ```bbManager```, but generally maps to the ```bbManagerApp.js``` in the directory. 
+ There is additional middleware to allow communication between these components. The ```bbMiddleware.js``` within the ```bbManager``` directory.




