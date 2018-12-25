<template>
    <div>
    <!-- This is the main screen the user sees when they go on the website -->

       <!-- Header and explanation of the product -->
       <div class="row">
           <div class="col-sm-12">
                <h1>GrOne Visualization Software</h1>
                <p>See how good your code is by checking its dependencies, all with one single click of a button!</p>
                <p>Classes will be represented by nodes that are colored by package.</p>
                <p>Dependencies for a class will be shown as lines to other nodes when you hover over a node.</p>
           </div>
       </div>

       <div class="row">
            <div class="col-sm-3"></div>
            <div class="col-sm-6 middle_div">

                <!-- input field and button (is hidden after user presses submit button for a valid url) -->
                <div v-if="url_accepted===false" text-center mx-auto>
                    <form>
                        <label for="url_input_form">Please enter a valid GitHub project url</label>
                        <input id="url_input_form" class="form-control" type ="url" v-model="Url_Input.url" required pattern="https?://.+">
                        <button class="btn btn-info" type="button" @click="postProject(), btn_clicked=true">Create visualization</button>
                        <div v-if="wrong_url===true">
                            <p>This is not a valid url</p>
                        </div>
                         <div v-if="wrong_url===false && btn_clicked===true">
                            <p>Attempting to process repository</p>
                        </div>
                    </form>
                </div>

                <!-- hidden loading screen that only shows up
                when the user has submitted valid url by pressing the btn -->
                <div v-if="url_accepted===true && error_in_process===false">
                    <div id="showProgress">
                        <div id="progressBar">Now loading visualization!</div>
                    </div>
                </div>

                <!-- Error message that is displayed if the processing of a project failed -->
                <div v-if="error_in_process===true">
                    <div id="showProgress">
                        <div id="progressBar">Error! Please try with another GitHub Project</div>
                    </div>
                </div>

                <!-- when loading is complete: replace the view with another component where we show the result -->

            </div>
            <div class="col-sm-3"></div>
       </div>



    </div>
</template>


<script>
    var axios = require('axios');
    module.exports = {
        name:"InputScreen",
        data(){
            return{
                Url_Input:{
                    url:''
                },
                url_accepted: false,
                wrong_url: false,
                error_in_process: false,
                btn_clicked: false
            }
        },
        methods:{
            // method to process the URL input
            // will make a post request and subsequent requests if a proper URL has been provided
            postProject: function(){
                
                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                if(pattern.test(this.Url_Input.url)){
                // this is from nigels method want to get owner and repo strings from the url
               console.log(this.Url_Input.url);
               var url_string = new URL(this.Url_Input.url);
               var path_string = url_string.pathname;
               var path = path_string.split("/"); //splits string according to '/', creates array
               var ownerName = path[1];
               var repoName = path[2];         
                    // *****sending owner,repo to backend
                    // this is a chain of several requests to the backend
                    // if all requests go as planned we will be redirected to the graph page
                    // and the graph for our inputted project will be displayed*****
                    axios.post('http://127.0.0.1:8002/api/gitProjects', {owner: ownerName,repo:  repoName})
                    .then((response)=>{
                        console.log("get xml Success: " + response.status);
                        //console.log('***xml from backend*** '+ response.data + ' ***');
                        this.Url_Input.url = "";
                        this.url_accepted = true;
                        this.wrong_url = false;
                        
                        //here we use the response from the previous request in order to
                        //send XML data to the dependency finder
                        return axios.post('http://127.0.0.1:8002/api/dependencies',{xml: response.data});
                    })
                    .then(
                    (response) => {
                        //Here we have successfully found dependencies and saved them in the DB
                        //so now we get redirected to the GRAPH page which will display the data
                        console.log('in the last response!');
                        console.log("post request to dependencies Success: " + response.status);
                        var router = this.$router;
                      
                        console.log(JSON.stringify(response.data));
                        
                        router.push({name:'graph'});
                    })
                    .catch(error => {
                            console.log(error.response);
                            this.error_in_process = true;
                    })
                    .then(function () {

                    });
                }
                else{
                    this.wrong_url = true;
                }
            }
        },
        
        mounted(){

        }
    }
</script>


<style>

    body{
        padding-top: 100px;
    }

    #url_input_form{
        margin-bottom: 10px;
    }

    .middle_div{
        padding-top: 7%;
    }

</style>
