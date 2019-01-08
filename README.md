# GrOne Visualizer

This visualizer illustrates the dependencies of a Java project.

# Client
Only public Github repositories are officially accepted as input.
Although not officially supported, some Gitlab and Bitbucket repositories may still provide a visualization.

The client will only need to input the url of their desired github repository into the textfield.

The url inputted must be structured like this:
   ```https://github.com/[owner]/[repository]```


## Serverside

```npm install``` should be run first.
```npm run dependencyfinder ``` to start dependencyfinder.
```npm run repohandler ``` to start repohandler.
```npm start``` is used to initialize the server.

# Deployment
As the program is locally deployed, each physical component should start their respective components.
