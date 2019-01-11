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

                <!-- input field and button -->
                <div text-center mx-auto>
                    <form>
                        <label for="url_input_form">Please enter a valid GitHub project url</label>
                        <input id="url_input_form" class="form-control" type ="url" v-model="Url_Input.url" required pattern="https?://.+" placeholder="Example: https://github.com/hanien/GarageIOTest">
                        <button class="btn btn-info" type="button" @click="postProject(), btn_clicked=true">Create visualization</button>
                        <div v-if="wrong_url===true">
                            <p>This is not a valid url</p>
                        </div>
                         <div v-if="wrong_url===false && btn_clicked===true">
                            <p>Attempting to process repository</p>
                        </div>
                    </form>
                </div>

                <!-- Error message that is displayed if the processing of a project failed -->
                <div v-if="error_in_process===true">
                    <div>
                        <div>Error! Service unavailable or not able to process inputted GitHub repository</div>
                    </div>
                </div>    
                <div v-if="servers_offline===true">
                    <div>
                        <div>Error! Servers currently unavailable, please try again shortly!</div>
                    </div>
                </div>

                <!-- when url is accepted: replace the view with another component where we show the result -->

            </div>
            <div class="col-sm-3"></div>
       </div>
    </div>
</template>

<script>
    var axios = require('axios');
    var isGithubUrl = require('is-github-url');
    module.exports = {
        name:"InputScreen",
        data(){
            return{
                Url_Input:{
                    url:''
                },
                wrong_url: false,
                error_in_process: false,
                btn_clicked: false,
                servers_offline: false
            }
        },
        methods:{
            // method to process the URL input
            // will make a push to the graph vue component if the url was accepted
            postProject: function(){

                //var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

                if(isGithubUrl(this.Url_Input.url, { repository: true })){

                //if(pattern.test(this.Url_Input.url)){
                    this.wrong_url = false;

                    console.log('Provided URL: '+this.Url_Input.url);

                    var url_string = new URL(this.Url_Input.url);
                    var path_string = url_string.pathname;
                    var path = path_string.split("/");          //splits string according to '/', creates array
                    var ownerName = path[1];
                    var repoName = path[2];

                    var router = this.$router;
                    var testPath = `graph/${ownerName}/${repoName}`;
                    console.log(testPath);
                    router.push({path: `graph/${ownerName}/${repoName}`});
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
