<template>
    <div>
    <!-- base router (holds header, footer, and dynamic content in router-view) -->    
    <!-- bootstrap is used -->

        <!-- header below -->
        <nav class="navbar navbar-expand-sm navbar-dark bg-dark fixed-top">
          <a href="http://localhost:8000/" class="navbar-brand"> 
            GrOne
          </a>
        </nav>

        <!-- router view below -->
        <!-- this is where we input vue components -->
        <!-- middle div is surrounded by 2 empty side divs for side padding -->
        <div class="row">
          <div class="col-sm-2">
          </div>
   
          <div class="col-sm-8 text-center mx-auto">
            <div class="text-center">
               <router-view></router-view>
            </div>
          </div>

          <div class="col-sm-2">
          </div>
        </div>

        <!-- footer below (not yet implemented) -->
        
    </div>
</template>


<script>
// should this be "baseRouter"?
  module.exports = {
    name:"BaseRouter",
  }
   
   
</script>


<style>
.frame{
}
</style>