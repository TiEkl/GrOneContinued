<!-- ownerHome.vue -->
<!-- This is a really basic (static) Vue component.
We just demonstrate how data (variables in the Vue instance) can be bound to HTML elements -->
<template>
  <div>
    <h1>{{title}}</h1>
    <p>{{description}}</p>
  </div>
</template>

<script>
module.exports = {
  name:"Home",
  data () { 
    return {
      title:"Camel Owner Home",
      description:"This is the owner's SPA. You can look at all camels, and remove them if you want."
    }
  }
};
</script>