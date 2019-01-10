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
    - It should be noted that srcML cannot be installed in a physical system running macOS as of the time of writing. Therefore, *Repo Handler* must be either running Windows or Linux.
2. Node.js (v10) is required by all nodes.
3. The npm manager is also required. However, npm is distributed with node, and thus if Node.js is installed, npm should be as well. npm is also required by all nodes.
4. MongoDB(v4) is required by by *Manager A* and *Manager B* and must be running locally on both.

It is recommended that all physical systems install all of these prerequisites if possible, as that would allow all the physical systems to run any of the components and take on any of the "roles".

All of the separate physical systems running parts of the system must be within the same network. To make sure the system communicates properly, __all of the firewalls of all the participating systems must be disabled__.

Furthermore, __the IP address of all 5 systems must be known, and changed accordingly within the source code for it to function properly.__

### Changing the IP addresses in the source code
The IP addresses should be changed before beginning the deployment steps. 
There are different steps to perform for each node.
To find out the IP address of a physical system, ```ipconfig``` can be entered in the terminal. The IPv4 address is used for this system.

For *Load Balancer*:
1. Open the file ```balanceController.js```, located within the folder ```server/loadBalancer```.
2. The constant ```bbServer1withPort``` should be changed as such: '[IP of *Manager A*]:8000' at Line 19. 
3. The constant ```bbServer2withPort``` should be changed as such: '[IP of *Manager B*]:8000' at Line 20.
4. Save the file.

For *Manager A*:
1. Open the file ```app.js``` located inside the directory ```server```.
2. The constant ```main_server```, on line 66, should be changed as such: '[IP of *Manager A*]'. 
3. The constant ```remote_server```, on line 67,  should be changed as such: '[IP of *Manager B*]'.
4. The variable ```repo_fetcher```, on line 27, should be changed as such: '[IP of *Repo Handler*]'.
5. The variable ```dependency_finder```, on line 28, should be changed as such: '[IP of *Dependency Finder*]'.
6. Save the file.

For *Manager B*:
1. Open the file ```app.js``` located inside the directory ```server```.
2. The constant ```main_server```, on line 66, should be changed as such: '[IP of *Manager B*]'. 
3. The constant ```remote_server```, on line 67,  should be changed as such: '[IP of *Manager A*]'.
4. The variable ```repo_fetcher```, on line 27, should be changed as such: '[IP of *Repo Handler*]'.
5. The variable ```dependency_finder```, on line 28, should be changed as such: '[IP of *Dependency Finder*]'.
4. Save the file.

The Communications Middleware also needs to direct to the correct IP addresses of the *Repo Handler* and *Dependency Finder*:
1. Open the file ```bbMiddleware.js``` located inside the directory ```server/controllers```.
2. The variable ```repoHandler``` should be changed as such: '[IP of *Repo Handler*]:8001' at Line 13. 
3. The variable ```dependencyFinder``` should be changed as such: '[IP of *DependencyFinder*]:9000' at Line 14.
4. Save the file.


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

# File Organization
## Client
The "Client" refers to the component that processes the visualization and contains what is presented to the user. This can be mapped to the __Visualization__ component in our component diagram which describes the architecture of the system.
The client is contained in the ```client``` folder of the repository.

+ The visualization is generated by the component ```dependGraph.vue``` located in the ```components``` directory.


## Backend
We have defined the "backend" as the contents within the ```server``` folder. This maps to the __LoadBalancer__, __BlackboardManager__, __RepoHandler__ and the __DependencyFinder__ components in our component diagram.

Naturally, the directories corresponding to each component are similarly named:
+ The __LoadBalancer__ is in the directory ```loadBalancer```.
+ The __RepoHandler__ lies within the directory ```RepoHandler```.
+ The __DependencyFinder__ maps to the directory ```DependencyFinder```.
+ The __BlackboardManager__ is made up of several files in different directories, but generally maps to the app.js in the ```server``` folder.
+ There is additional middleware to allow communication between these components. The files within the ```controller``` and the index.js inside ```DependencyFinder``` makes up for the majority of the communication middleware.




