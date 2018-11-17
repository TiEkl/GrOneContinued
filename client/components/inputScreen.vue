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
                        <button class="btn btn-info" type="button" @click="save_url()">Create visualization</button>
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
            save_url(){
                //Method for saving the url in a DB, so that other methods can find it and use it
                //If saved successfully we assume that it will be taken to be filtered and prepared
                //thus we will proceed to display the progress bar
                //(I don't know if we are going to use this or not)
                console.log('inside save url');

                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

                if(pattern.test(this.Url_Input.url)){
                    console.log('inside if');
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
                    console.log('inside else');
                    this.wrong_url = true;
                }
            },
/*             valid_url(string) { //method to check if a string is a valid url or not
                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                if(pattern.test(string)) {
                    return true;
                } else {
                    return false;
                }
            } */
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

