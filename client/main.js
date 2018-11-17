const Vue = require('vue');
const VueRouter = require('vue-router');

Vue.use(VueRouter);

var router = new VueRouter({
    routes: [
      {
        path: '/',
        name: 'url_input',
        component: require("./components/inputScreen.vue")
      }
    ]
  });
  
  var baseRouter = require("./components/baseRouter.vue");
  
  new Vue({
    router: router,
    render: function(createElement) {
      return createElement(baseRouter);
    }
  }).$mount("#mountpoint");

