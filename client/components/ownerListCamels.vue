<!-- ownerListCamels.vue -->
<!-- This is a Vue component with some AJAX magic.
In the JS Code, we have defined a camel array (camels) that we populate using the function
getCamels(), using an AXIOS get request. Furthermore, we provide a delete function that can
delete camels using a DELETE request (again using AXIOS).

In the template tag, the only interesting part is the div with the v-for attribute. 
Here, Vue creates a div per camel in our camels array. Each div has an image and 
another div containing some basic information on the Camel (its color and position).-->
<template>
    <div class="text-center">
        <h3>Camels</h3>
        <p>Here we list all the camels the (default) backend provides.</p>
        <div v-for="camel in camels" v-bind:key="camel._id" class="media border p-3 mt-3 mb-3">
            <img src="camel.jpg" alt="Camel" class="mr-3 mt-3" style="width:60px;">
            <div class="media-body">
                <button type="button" class="close" @click="deleteCamel(camel._id)">&times;</button>
                <h4>{{camel.color}} Camel <small><i>Good value!</i></small></h4>
                <p>This camel is on position {{camel.position}}.</p>      
            </div>
        </div>
    </div>
</template>

<script>
var axios = require('axios');

module.exports = {
  name:"ListCamels",
  data () {
    return {
      camels: []
    }
  },
  methods: {
      //Performs a GET request to /api/camels using AXIOS.
        getCamels: function () {
            axios.get('/api/camels')
            .then(
                response => {
                    //This is only an example of how you can access the status code
                    if (response.status!==200) {
                        console.log("Wrong status code: " + response.status);
                    }
                    //If we get a response, empty the camels array and fill it with all camels from our endpoints
                    this.camels.length = 0;
                    for (var i = 0; i < response.data.data.length; i++) {
                        this.camels.push(response.data.data[i]);
                    }
            })
            .catch(error => {
                //In case of error, empty the camels array.
                this.camels.length = 0;
                console.log(error);
            })
            .then(function () {
                //This code is always executed, independent of the request being successful or not.
            });
        }, 
        //Performs a DELETE request to the camel with the provided ID.
        deleteCamel: function (camelID) {
            console.log("Deleting camel with ID " + camelID);
            axios.delete('/api/camels/'+camelID)
            .then(
                response => {
                    //This code basically finds the camel under question in the array and deletes it (using splice)
                    var localIndex = -1;
                    for (var i=0; i < this.camels.length; i++) {
                        if (this.camels[i]._id === camelID) {
                            localIndex = i;
                            i = this.camels.length;
                        }
                    }
                    if (localIndex !== -1) {
                        //Vue reacts to splice. So removing the element here causes the DOM to update.
                        this.camels.splice(localIndex, 1); 
                    }
                    console.log("Success: " + response.status);
            })
            .catch(error => {
                console.log(error);
            })
            .then(function () {
            });

        }
    }, 
    //This basically means that once Vue is ready, we call getCamels() to fetch
    //all camels and populate our DOM tree with them.
    mounted () {
        this.getCamels();
    }
};
</script>