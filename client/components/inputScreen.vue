<template>
    <div>
        <!-- here is the main screen the user sees when the go on the page (input field n such) -->
        <!-- Header and explanation of the product -->
        <!-- input field and button (hide after user presses btn, it was an ok url, and now results are loading) -->
        <!-- hidden loading screen that only shows up
            when the user has submitted by pressing the btn (dont allow user to submit some invalid url) -->
        <!-- replace with another component when viewing the result -->
       
       <div class="row">
           <div class="col-sm-12">
                <h1>GrOne Visualization Software</h1>
                <p>See how good your code is by checking its dependencies, all with one single click of a button!</p>
           </div>
       </div>
       
       <div class="row">
            <div class="col-sm-3"></div>
            <div class="col-sm-6 middle_div">

                <div v-if="url_accepted===false" text-center mx-auto>   
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

