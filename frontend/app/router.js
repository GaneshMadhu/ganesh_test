import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.resource('schedules',  function(){
        this.route('schedule', {path: '/:schedule_id'});
    });
    this.route('rules');
});

export default Router;
