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
                        <button class="btn btn-info" type="button" @click="postProject()">Create visualization</button>
                        <div v-if="wrong_url===true">
                            <p>This is not a valid url</p>
                        </div>
                    </form>    
                </div>

                <!-- hidden loading screen that only shows up
                when the user has submitted valid url by pressing the btn -->
                <div v-if="url_accepted===true">
                    <div id="showProgress">
                        <div id="progressBar">Not yet implemented!</div>
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
                wrong_url: false
            }
        },
        methods:{

            postProject: function(Url_Input){
               var urlString = url_input;
               var path_string = url_input.pathname;
               var path = path_string.split("/"); //splits string according to '/', creates array
               ownerName = path[1];
               repoName = path[2];

                axios.post('/api/gitProjects',
                {owner: ownerName,
                 repo:  repoName })
                .then(
                  response => {
                      console.log("Success: " + response.status);
                    this.Url_Input.url = "";
                    this.url_accepted = true;
                    this.wrong_url = false;
              })
              .catch(error => {
                  console.log(error.response);
              })
              .then(function () { 
                  
              });
        },

            

            
            





            save_url(){
                //Method for saving the url in a DB, so that other methods can find it and use it
                //If saved successfully we assume that it will be taken to be filtered and prepared
                //thus we will proceed to display the progress bar
                //(I don't know if we are going to use this or not)

                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

                if(pattern.test(this.Url_Input.url)){
                    let new_url = {
                    url: this.Url_Input.url
                    }

                    axios.post('http://localhost:3000/api/urls', new_url)
                    .then((response)=>{

                    this.Url_Input.url = "";
                    this.url_accepted = true;
                    this.wrong_url = false;

                    })
                    .catch((error)=>{
                        console.log(error.response);  
                    });
                }
                else{
                    this.wrong_url = true;
                }
            }
        },
        mounted(){

        }
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

