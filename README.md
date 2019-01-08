# GrOne Visualizer

The GrOne visualizer illustrates the dependencies of a public Github Java project.

Only public Github repositories are officially accepted as input for the URL.
Although not officially supported, some Gitlab and Bitbucket repositories may still present a visualization.

The URL inputted must be structured like this:
  
 ```https://github.com/[owner]/[repository]```


# Deployment
The GrOne Visualizer is optimally run on 3 separate physical systems at the moment before a user can use the system.  
   + The first physical component runs the __LoadBalancer__.  
    For the sake of clarity we will call this physical system the *Load Balancer* from here onwards.
   + The second physical component runs an instance of the __Blackboard__, __RepoHandler__, and __DependencyFinder__.  
   For the sake of clarity we will call this physical system *Manager A*.
   + The third physical component runs another instance of the __Blackboard__, __RepoHandler__, and __DependencyFinder__.  
   For the sake of clarity we will call this physical system the *Manager B*.

## Prerequisites
Several prerequisites are required to be downloaded by the physical systems before the system can function.

1. srcML is required by *Manager A* and *Manager B*.
    - It should be noted that srcML cannot be installed in a physical system running macOS as of the time of writing.
2. Node.js (v10) is required by all 3 systems.
3. The npm manager is also required. However, npm is distributed with node, and thus if Node.js is installed, npm should be as well. npm is also required by all 3 systems
4. MongoDB(v4) is required by by *Manager A* and *Manager B* and must be running locally.

It is recommended that all 3 physical systems install all of these prerequisites if possible, as that would allow all 3 physical systems to run any of the components.

## Deployment Steps
After the installation of the prerequisites, follow these instructions:

For *Load Balancer*:
1. Open a terminal.
2. ```npm install``` to install all the required dependencies and build the frontend.
3. ```npm run loadbalancer``` to start the __LoadBalancer__ component.

For *Manager A* and *Manager B*:
1. Open a terminal and type ```npm install``` to install dependencies and build the frontend.
2. In the same terminal, type ```npm run dev``` to start the __Blackboard__ component.
3. Open another terminal and type ```npm run dependencyfinder ``` to start the __DependencyFinder__ component.  
4. Open a third terminal and type ```npm run repohandler ``` to start the __RepoHandler__ component.  

# File Organization
## Client
The "Client" refers to the component that processes the visualization and contains what is presented to the user. This can be mapped to the __Visualization__ component in our component diagram which describes the architecture of the system.
The client is contained in the ```client``` folder of the repository.


## Backend
We have defined the "backend" as the contents within the ```server``` folder. This maps to the __LoadBalancer__, __Blackboard__, __RepoHandler__ and the __DependencyFinder__ components in our component diagram.




