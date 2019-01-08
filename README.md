# GrOne Visualizer

The GrOne visualizer illustrates the dependencies of a public Github Java project.

Only public Github repositories are officially accepted as input for the URL.
Although not officially supported, some Gitlab and Bitbucket repositories may still present a visualization.

The URL inputted must be structured like this:
  
 ```https://github.com/[owner]/[repository]```


# Deployment
The GrOne Visualizer is optimally run on 3 separate physical systems at the moment before a user can use the system.  
   + The first physical component runs the __LoadBalancer__.
   + The second physical component runs an instance of the __Blackboard__, __RepoHandler__, and __DependencyFinder__.
   + The third physical component runs another instance of the __Blackboard__, __RepoHandler__, and __DependencyFinder__.


Several prerequisites are required to be downloaded by the physical systems before the system can function.

1. srcML is required by the RepoHandler component.
    - It should be noted that srcML cannot be installed in a physical system running macOS as of the time of writing.
2. Node.js is required by all 4 components.
3. The npm manager is also required. However, npm is distributed with node, and thus if Node.js is installed, npm should be as well.

It is recommended that all 3 physical systems install both of these prerequisites if possible, as that would allow all 3 



Several steps are required to deploy the system.

1. ```npm install``` should be run first.  
2. ```npm run dependencyfinder ``` to start dependencyfinder.  
3. ```npm run repohandler ``` to start repohandler.  
4. ```npm start``` is used to initialize the server.  

# File Organization
## Client
The "Client" refers to the component that processes the visualization and contains what is presented to the user. This can be mapped to the __Visualization__ component in our component diagram which describes the architecture of the system.
The client is contained in the ```client``` folder of the repository.


## Backend
We have defined the "backend" as the contents within the ```server``` folder. This maps to the __LoadBalancer__, __Blackboard__, __RepoHandler__ and the __DependencyFinder__ components in our component diagram.




