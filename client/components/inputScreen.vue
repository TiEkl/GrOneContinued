<template>
    <div>
        <!-- here is the main screen the user sees when the go on the page (input field n such) -->
        <!-- Header and explanation of the product -->
        <!-- input field and button (hide after user presses btn, it was an ok url, and now results are loading) -->
        <!-- hidden loading screen that only shows up
            when the user has submitted by pressing the btn (dont allow user to submit some invalid url) -->
        <!-- replace with another component when viewing the result -->

        <div class="col-sm-3"></div>
        <div class="col-sm-6">

            <div v-if="url_accepted===false">   
                <form>
                    <label for="url_input_form">Please enter a valid GitHub project url</label>
                    <input id="url_input_form" class="form-control" type ="url" v-model="Url_Input.url" required pattern="https?://.+">
                    <button class="btn btn-info" type="button" @click="save_url()">Create visualization</button>
                </form>    
            </div>

            <div v-if="url_accepted===true">
                <div id="showProgress">
                    <div id="progressBar"></div>
                </div>
            </div>
           
        </div>
        <div class="col-sm-3"></div>

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
                url_accepted: false
            }
        },
        methods:{
            save_url(){
                 axios.post('http://localhost:3000/api/urls', new_url)
                .then((response)=>{

                    url_accepted = true;
                })
                .catch((error)=>{
                    console.log(error.response);  
                });
            }
        },
        mounted(){

        }
    };
</script>


<style>



</style>

