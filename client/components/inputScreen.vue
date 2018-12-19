<template>
    <div>
    <!-- This is the main screen the user sees when they go on the website -->

       <!-- Header and explanation of the product -->
       <div class="row">
           <div class="col-sm-12">
                <h1>GrOne Visualization Software</h1>
                <p>See how good your code is by checking its dependencies, all with one single click of a button!</p>
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
            // method to send owner and repo strings that we need in the backend
            postProject: function(){
                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                if(pattern.test(this.Url_Input.url)){
                    this.wrong_url = false;
                // this is from nigels method want to get owner and repo strings from the url
               console.log(this.Url_Input.url);
               var url_string = new URL(this.Url_Input.url);
               var path_string = url_string.pathname;
               var path = path_string.split("/"); //splits string according to '/', creates array
               var ownerName = path[1];
               var repoName = path[2];
                // sending owner,repo to backend
                axios.post('/api/gitProjects', //used to be gitProjects
                {owner: ownerName,
                 repo:  repoName 
                })
                .then((response)=>{
                    console.log("get xml Success: " + response.status);
                    //console.log('***xml from backend*** '+ response.data + ' ***');
                     this.Url_Input.url = "";
                    this.url_accepted = true;
                    this.wrong_url = false;
                    
                    return axios.post('/api/dependencies',{xml: response.data});
                })
                .then(
                  (response) => {
                    //make get request to get the data
                    //visualize the data
                    console.log("post request to dependencies Success: " + response.status);
                    //console.log('***json from backend*** '+ JSON.stringify(response.data) + ' ***');
                    //return axios.get('/api/dependencies'); //we should have some ID or something so that they know which request to get!!!
                    var router = this.$router;
                    router.push("graph");
                })
                .then((response)=>{
                    //console.log("get visison Success: " + response.status);
                    //console.log("data for visualization: " + JSON.stringify(response.data.data[0].classes)+"   data for visualization END" );
                   
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
        
        mounted(){}
    };
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
