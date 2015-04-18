import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        level: {
            refreshModel: true
        },
        id: {
            refreshModel: true
        }
    },
    init: function() {
        //this.generateController('events');
    },
    setupController: function(controller, model) {
        controller.set('model', model);
    },

    beforeModel: function(transaction) {
        console.log('******************************************************');
        console.log('This is application');
        console.log(transaction);
        console.log(transaction.queryParams)
        console.log('******************************************************');

//        this.transitionTo('schedules',{queryParams: JSON.stringify(transaction.queryParams)});
    },

    model: function(params) {
//        if(params['level'] == null)
//            this.transitionTo('schedules', {queryParams: {level: 'enterprise'}});
//        else
        var data = this.store.findQuery('schedule', params);
        console.log(data)
        return data;
    },
    afterModel: function(model){
//      if (model.get('content')[0].get('data')['response'] != undefined){
//            logout();
//        }
    },
//    afterModel: function(model) {
//        var firstObj = model.get('firstObject')
//        if (firstObj !== undefined) {
//            var app_controller = this.controllerFor('application')
//            app_controller.setProperties({
//                enterprise_id: firstObj.get('enterprise_id'),
//                is_end_user: firstObj.get('is_end_user'),
//                is_admin: firstObj.get('is_admin'),
//                userId: firstObj.get('userId'),
//                user_name: firstObj.get('user_name')
//            })
//        }
//    },
    deactivate: function() {
        var model = this.get('controller.model');
        model.rollback();
        if (model.get('isNew')) {
            model.deleteRecord();
        }
    },
    actions: {
        edit_schedule: function(model, model_name) {
            console.log(model);
            console.log(model.constructor.typeKey);
            console.log('-----openModal-----');
            var namespace = this.store.adapterFor('application').namespace;
            var main_modal = this;
            var _params = {
                level: model.get('schedule_level'),
                include_events: true
            }
            this.store.findOneQuery('schedule', model.id, _params).then(function(schedule) {
                main_modal.render(model_name, {
                    into: 'application',
                    outlet: 'modal',
                    model: schedule
                });
            });
        },

        closeModal: function(model) {
            this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });
            remove_modal_backdrop();
            var current_level     = this.controllerFor('schedules').get('level')
            if (model != undefined) { //to clear cache data in store..this.store.unloadAll('schedule'); - this unloads schedule model completely forcing to do a repeat query..so when adding/deleting, refreshing model data
                if (model.get('isDirty')) {
                    model.rollback(); // When editing a schedule and not saved - to reinitialize model to previous state.
                }
            }
        },

        saveModal: function(model) {
            console.log('-----saveModal-----');
            var self = this
            var namespace = this.store.adapterFor('application').namespace
            var events_array = [];
            console.log(scheduler.toJSON());
            //Do Asynchronous action here. Set "isLoading = false" after a timeout.
            var events_JSON_Array = JSON.parse(scheduler.toJSON());
            for(var i = 0; i < events_JSON_Array.length; i++)
            {
                var event = events_JSON_Array[i];
                events_array.push(scheduler.getEvent(event.id));
            }
            var data = {
                name:           model.get('name'),
                enterprise_id:  this.controllerFor('application').get('enterprise_id'),
                events:         events_array
            }
            this.store.updateOneQuery('schedule', model.id, data).then(function(result) {
                if (result['schedule'] && Ember.isPresent(result['schedule']['error_message'])) {
                    model.rollback();
//                    show_notification('Schedule Update Failed','error',result['schedule']['error_message'])
                    show_notification('Schedule Update Failed','error','Error in updating schedule')
                } else {
                    show_notification('Schedule Update','success','Schedule Updated Successfully')
                    remove_modal_backdrop();
                    return self.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                }
            });
        },

        deleteModal: function(modalName, model) {
            console.log('-----deleteModal-----');
            this.controllerFor(modalName).set('model', model);
            return this.render(modalName, {
                into: 'application',
                outlet: 'modal'
            });
        },

        deleteSchedule: function(model) {
            console.log('-----deleteSchedule-----');
            var self = this
            var current_level     = this.controllerFor('schedules').get('level')
            model.destroyRecord().then(function(result){
                if (result.get('data') && Ember.isPresent(result.get('data')['error_message'])) {
//                    show_notification('Schedule Deletion Failed','error',result.get('data')['error_message'])
                    show_notification('Schedule Deletion Failed','error','Error in deleting schedule')
                    self.send('removeModal', result)
                    var temp = self.store.find('schedule', {level: current_level})
                    self.controller.set('model', temp);
                } else {
                    show_notification('Schedule Delete','success','Schedule Deleted Successfully')
                    remove_modal_backdrop();
                    return self.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                }
            });
        },

        new_schedule: function(modalName, schedule_level) {
            console.log('-----new_schedule-----');
            var model = this.store.createRecord('schedule')
            return this.render(modalName, {
                into: 'application',
                outlet: 'modal',
                model: model
            });
        },

        saveSchedule: function(model, sch_type) {
            console.log('======================saveSchedule=============')
            var controller = CAP.__container__.lookup("controller:application");
            controller.send('showLoading','true');
            var current_level     = this.controllerFor('schedules').get('level')
            var schedule_type     = 'Specific Dates & Time'
            var group_id          = this.controllerFor('schedules').get('selected_location_value')
            var user_id           = this.controllerFor('schedules').get('selected_user_value')
            var schedule_kind     = this.controllerFor('schedules').get('selected_schedule_kind')
            var events_array      = []
            var events_JSON_Array = JSON.parse(scheduler.toJSON());
            for(var i = 0; i < events_JSON_Array.length; i++)
            {
                var event = events_JSON_Array[i];
                events_array.push(scheduler.getEvent(event.id));
            }
            var schedule_level = this.controllerFor('schedules').get('level')
            if(schedule_level !== 'group'){
                group_id = null
            }
            if(schedule_level !== 'users'){
                user_id = null
            }
            model.setProperties({
                schedule_level: this.controllerFor('schedules').get('level'),
                schedule_type:  schedule_type,
                group_id:       group_id,
                user_id:        user_id,
                schedule_kind:  schedule_kind,
                enterprise_id:  this.controllerFor('application').get('enterprise_id'),
                events:         events_array
            });
            var self = this;
            var new_schedule = this.store.createRecord('schedule',model.get('_attributes'));
            new_schedule.validate().then(function () {
                // success
                new_schedule.save().then(function(params) {
                    if (params.get('data') && Ember.isPresent(params.get('data')['error_message'])) {
//                        show_notification('Schedule Creation Failed','error',params.get('data')['error_message'])
                        show_notification('Schedule Creation Failed','error','Error in creating schedule')
                    } else {
                        show_notification('Schedule Creation','success','Schedule Created Successfully')
                        self.send('removeModal', params)
                        var temp = self.store.find('schedule', {level: current_level})
                        self.controller.set('model', temp);
                    }
                });
            }, function() {
                // failure
                show_notification('Must Data', 'error', new_schedule.get('errors.name'))
                return false;
            });
        },

        removeModal: function(model) {
            this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });
            remove_modal_backdrop();
        }
    }
});
