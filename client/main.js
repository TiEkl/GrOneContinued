const Vue = require('vue');
const VueRouter = require('vue-router');

Vue.use(VueRouter);

var router = new VueRouter({
    routes: [
      {
        path: '/',
        name: 'url_input',
        component: require("./src/components/inputScreen.vue")
      }
    ]
  });
  
  var userBaseRouter = require("./src/components/baseRouter.vue");
  
  new Vue({
    router: router,
    render: function(createElement) {
      return createElement(userBaseRouter);
    }
  }).$mount("#mountpoint");