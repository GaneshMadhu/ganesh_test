/* jshint ignore:start */

/* jshint ignore:end */

define('frontend/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].RESTAdapter.extend({});

});
define('frontend/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'frontend/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('frontend/controllers/schedules', ['exports', 'ember'], function (exports, Ember) {

        'use strict';

        exports['default'] = Ember['default'].Controller.extend({
                paginatedContent: (function () {
                        return this.get("arrangedContent");
                }).property("arrangedContent.[]") });

});
define('frontend/initializers/app-version', ['exports', 'frontend/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function (container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('frontend/initializers/export-application-global', ['exports', 'ember', 'frontend/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  };

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('frontend/models/schedule', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        schedule_type: DS['default'].attr("string"),
        name: DS['default'].attr("string"),
        group_id: DS['default'].attr("string"),
        user_id: DS['default'].attr("string"),
        user_name: DS['default'].attr("string"),
        schedule_level: DS['default'].attr("string"),
        location: DS['default'].attr("string"),
        schedule_kind: DS['default'].attr("string"),
        enterprise_id: DS['default'].attr("string"),
        events: DS['default'].attr()
    });

});
define('frontend/router', ['exports', 'ember', 'frontend/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.resource("schedules", function () {
            this.route("schedule", { path: "/:schedule_id" });
        });
        this.route("rules");
    });

    exports['default'] = Router;

});
define('frontend/routes/schedules', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        queryParams: {
            level: {
                refreshModel: true
            },
            id: {
                refreshModel: true
            }
        },
        init: function () {},
        setupController: function (controller, model) {
            controller.set("model", model);
        },

        beforeModel: function (transaction) {
            console.log("******************************************************");
            console.log("This is application");
            console.log(transaction);
            console.log(transaction.queryParams);
            console.log("******************************************************");

            //        this.transitionTo('schedules',{queryParams: JSON.stringify(transaction.queryParams)});
        },

        model: function (params) {
            //        if(params['level'] == null)
            //            this.transitionTo('schedules', {queryParams: {level: 'enterprise'}});
            //        else
            var data = this.store.findQuery("schedule", params);
            console.log(data);
            return data;
        },
        afterModel: function (model) {},
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
        deactivate: function () {
            var model = this.get("controller.model");
            model.rollback();
            if (model.get("isNew")) {
                model.deleteRecord();
            }
        },
        actions: {
            edit_schedule: function (model, model_name) {
                console.log(model);
                console.log(model.constructor.typeKey);
                console.log("-----openModal-----");
                var namespace = this.store.adapterFor("application").namespace;
                var main_modal = this;
                var _params = {
                    level: model.get("schedule_level"),
                    include_events: true
                };
                this.store.findOneQuery("schedule", model.id, _params).then(function (schedule) {
                    main_modal.render(model_name, {
                        into: "application",
                        outlet: "modal",
                        model: schedule
                    });
                });
            },

            closeModal: function (model) {
                this.disconnectOutlet({
                    outlet: "modal",
                    parentView: "application"
                });
                remove_modal_backdrop();
                var current_level = this.controllerFor("schedules").get("level");
                if (model != undefined) {
                    //to clear cache data in store..this.store.unloadAll('schedule'); - this unloads schedule model completely forcing to do a repeat query..so when adding/deleting, refreshing model data
                    if (model.get("isDirty")) {
                        model.rollback(); // When editing a schedule and not saved - to reinitialize model to previous state.
                    }
                }
            },

            saveModal: function (model) {
                console.log("-----saveModal-----");
                var self = this;
                var namespace = this.store.adapterFor("application").namespace;
                var events_array = [];
                console.log(scheduler.toJSON());
                //Do Asynchronous action here. Set "isLoading = false" after a timeout.
                var events_JSON_Array = JSON.parse(scheduler.toJSON());
                for (var i = 0; i < events_JSON_Array.length; i++) {
                    var event = events_JSON_Array[i];
                    events_array.push(scheduler.getEvent(event.id));
                }
                var data = {
                    name: model.get("name"),
                    enterprise_id: this.controllerFor("application").get("enterprise_id"),
                    events: events_array
                };
                this.store.updateOneQuery("schedule", model.id, data).then(function (result) {
                    if (result.schedule && Ember['default'].isPresent(result.schedule.error_message)) {
                        model.rollback();
                        //                    show_notification('Schedule Update Failed','error',result['schedule']['error_message'])
                        show_notification("Schedule Update Failed", "error", "Error in updating schedule");
                    } else {
                        show_notification("Schedule Update", "success", "Schedule Updated Successfully");
                        remove_modal_backdrop();
                        return self.disconnectOutlet({
                            outlet: "modal",
                            parentView: "application"
                        });
                    }
                });
            },

            deleteModal: function (modalName, model) {
                console.log("-----deleteModal-----");
                this.controllerFor(modalName).set("model", model);
                return this.render(modalName, {
                    into: "application",
                    outlet: "modal"
                });
            },

            deleteSchedule: function (model) {
                console.log("-----deleteSchedule-----");
                var self = this;
                var current_level = this.controllerFor("schedules").get("level");
                model.destroyRecord().then(function (result) {
                    if (result.get("data") && Ember['default'].isPresent(result.get("data").error_message)) {
                        //                    show_notification('Schedule Deletion Failed','error',result.get('data')['error_message'])
                        show_notification("Schedule Deletion Failed", "error", "Error in deleting schedule");
                        self.send("removeModal", result);
                        var temp = self.store.find("schedule", { level: current_level });
                        self.controller.set("model", temp);
                    } else {
                        show_notification("Schedule Delete", "success", "Schedule Deleted Successfully");
                        remove_modal_backdrop();
                        return self.disconnectOutlet({
                            outlet: "modal",
                            parentView: "application"
                        });
                    }
                });
            },

            new_schedule: function (modalName, schedule_level) {
                console.log("-----new_schedule-----");
                var model = this.store.createRecord("schedule");
                return this.render(modalName, {
                    into: "application",
                    outlet: "modal",
                    model: model
                });
            },

            saveSchedule: function (model, sch_type) {
                console.log("======================saveSchedule=============");
                var controller = CAP.__container__.lookup("controller:application");
                controller.send("showLoading", "true");
                var current_level = this.controllerFor("schedules").get("level");
                var schedule_type = "Specific Dates & Time";
                var group_id = this.controllerFor("schedules").get("selected_location_value");
                var user_id = this.controllerFor("schedules").get("selected_user_value");
                var schedule_kind = this.controllerFor("schedules").get("selected_schedule_kind");
                var events_array = [];
                var events_JSON_Array = JSON.parse(scheduler.toJSON());
                for (var i = 0; i < events_JSON_Array.length; i++) {
                    var event = events_JSON_Array[i];
                    events_array.push(scheduler.getEvent(event.id));
                }
                var schedule_level = this.controllerFor("schedules").get("level");
                if (schedule_level !== "group") {
                    group_id = null;
                }
                if (schedule_level !== "users") {
                    user_id = null;
                }
                model.setProperties({
                    schedule_level: this.controllerFor("schedules").get("level"),
                    schedule_type: schedule_type,
                    group_id: group_id,
                    user_id: user_id,
                    schedule_kind: schedule_kind,
                    enterprise_id: this.controllerFor("application").get("enterprise_id"),
                    events: events_array
                });
                var self = this;
                var new_schedule = this.store.createRecord("schedule", model.get("_attributes"));
                new_schedule.validate().then(function () {
                    // success
                    new_schedule.save().then(function (params) {
                        if (params.get("data") && Ember['default'].isPresent(params.get("data").error_message)) {
                            //                        show_notification('Schedule Creation Failed','error',params.get('data')['error_message'])
                            show_notification("Schedule Creation Failed", "error", "Error in creating schedule");
                        } else {
                            show_notification("Schedule Creation", "success", "Schedule Created Successfully");
                            self.send("removeModal", params);
                            var temp = self.store.find("schedule", { level: current_level });
                            self.controller.set("model", temp);
                        }
                    });
                }, function () {
                    // failure
                    show_notification("Must Data", "error", new_schedule.get("errors.name"));
                    return false;
                });
            },

            removeModal: function (model) {
                this.disconnectOutlet({
                    outlet: "modal",
                    parentView: "application"
                });
                remove_modal_backdrop();
            }
        }
    });
    //this.generateController('events');
    //      if (model.get('content')[0].get('data')['response'] != undefined){
    //            logout();
    //        }

});
define('frontend/templates/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1;


    data.buffer.push("<h2 id=\"title\">Welcome to Ember.js</h2>\n\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('frontend/templates/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    


    data.buffer.push("<p>\n  It works!!!!\n</p>\n");
    
  });

});
define('frontend/templates/schedules', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    data.buffer.push("TEST\n");
    stack1 = helpers._triageMustache.call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    stack1 = helpers._triageMustache.call(depth0, "paginatedContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "schedules/all_schedules", options) : helperMissing.call(depth0, "partial", "schedules/all_schedules", options))));
    data.buffer.push("\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('frontend/templates/schedules/all_schedules', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var stack1, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\r\n    <div id=\"widget_content_table\">\r\n        <table class=\"table table-striped dataTable_gridview\" id=\"schedule_table\">\r\n            <thead>\r\n            <tr>\r\n                <th>Schedule Name</th>\r\n                <th>Type</th>\r\n                <th>User</th>\r\n                <th>Location</th>\r\n                <th>Action</th>\r\n            </tr>\r\n            </thead>\r\n            <tbody> GANESH Madhu !!!!!!!!!!!!!!! MAHESHR\r\n            ");
    stack1 = helpers.each.call(depth0, "item", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\r\n                <tr>\r\n                    <td>");
    stack1 = helpers._triageMustache.call(depth0, "item.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</td>\r\n                    <td>");
    stack1 = helpers._triageMustache.call(depth0, "item.schedule_kind", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</td>\r\n                    <td>");
    stack1 = helpers._triageMustache.call(depth0, "item.user_name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</td>\r\n                    <td>");
    stack1 = helpers._triageMustache.call(depth0, "item.location", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</td>\r\n                    <td class=\"center\">\r\n                        <div class=\"pull-left\" style=\"margin-right:10px;\">\r\n                            <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "edit_schedule", "item", "open_modal", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
    data.buffer.push(">Edit</a>\r\n                        </div>\r\n                        <div class=\"pull-left\">\r\n                            <a href=\"#\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "edit_schedule", "item", "delete_modal", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
    data.buffer.push(">Delete</a>\r\n                        </div>\r\n                    </td>\r\n                </tr>\r\n            ");
    return buffer;
    }

  function program4(depth0,data) {
    
    
    data.buffer.push("\r\n    <div class=\"alert alert-warning\" style=\"margin: 12px;\"> No schedules available</div>\r\n");
    }

    stack1 = helpers['if'].call(depth0, "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    else { data.buffer.push(''); }
    
  });

});
define('frontend/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('frontend/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('frontend/tests/controllers/schedules.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/schedules.js should pass jshint', function() { 
    ok(true, 'controllers/schedules.js should pass jshint.'); 
  });

});
define('frontend/tests/helpers/resolver', ['exports', 'ember/resolver', 'frontend/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('frontend/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('frontend/tests/helpers/start-app', ['exports', 'ember', 'frontend/app', 'frontend/router', 'frontend/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('frontend/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('frontend/tests/models/schedule.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/schedule.js should pass jshint', function() { 
    ok(true, 'models/schedule.js should pass jshint.'); 
  });

});
define('frontend/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('frontend/tests/routes/schedules.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/schedules.js should pass jshint', function() { 
    ok(false, 'routes/schedules.js should pass jshint.\nroutes/schedules.js: line 23, col 45, Missing semicolon.\nroutes/schedules.js: line 34, col 26, Missing semicolon.\nroutes/schedules.js: line 72, col 14, Missing semicolon.\nroutes/schedules.js: line 88, col 81, Missing semicolon.\nroutes/schedules.js: line 89, col 25, Expected \'!==\' and instead saw \'!=\'.\nroutes/schedules.js: line 98, col 28, Missing semicolon.\nroutes/schedules.js: line 99, col 75, Missing semicolon.\nroutes/schedules.js: line 113, col 14, Missing semicolon.\nroutes/schedules.js: line 118, col 101, Missing semicolon.\nroutes/schedules.js: line 120, col 99, Missing semicolon.\nroutes/schedules.js: line 141, col 28, Missing semicolon.\nroutes/schedules.js: line 142, col 81, Missing semicolon.\nroutes/schedules.js: line 146, col 103, Missing semicolon.\nroutes/schedules.js: line 147, col 53, Missing semicolon.\nroutes/schedules.js: line 148, col 83, Missing semicolon.\nroutes/schedules.js: line 151, col 99, Missing semicolon.\nroutes/schedules.js: line 163, col 60, Missing semicolon.\nroutes/schedules.js: line 172, col 75, Missing semicolon.\nroutes/schedules.js: line 175, col 81, Missing semicolon.\nroutes/schedules.js: line 176, col 60, Missing semicolon.\nroutes/schedules.js: line 177, col 99, Missing semicolon.\nroutes/schedules.js: line 178, col 95, Missing semicolon.\nroutes/schedules.js: line 179, col 98, Missing semicolon.\nroutes/schedules.js: line 180, col 39, Missing semicolon.\nroutes/schedules.js: line 187, col 78, Missing semicolon.\nroutes/schedules.js: line 189, col 32, Missing semicolon.\nroutes/schedules.js: line 192, col 31, Missing semicolon.\nroutes/schedules.js: line 210, col 107, Missing semicolon.\nroutes/schedules.js: line 212, col 105, Missing semicolon.\nroutes/schedules.js: line 213, col 57, Missing semicolon.\nroutes/schedules.js: line 214, col 87, Missing semicolon.\nroutes/schedules.js: line 220, col 89, Missing semicolon.\nroutes/schedules.js: line 87, col 13, \'remove_modal_backdrop\' is not defined.\nroutes/schedules.js: line 101, col 25, \'scheduler\' is not defined.\nroutes/schedules.js: line 103, col 48, \'scheduler\' is not defined.\nroutes/schedules.js: line 107, col 35, \'scheduler\' is not defined.\nroutes/schedules.js: line 118, col 21, \'show_notification\' is not defined.\nroutes/schedules.js: line 120, col 21, \'show_notification\' is not defined.\nroutes/schedules.js: line 121, col 21, \'remove_modal_backdrop\' is not defined.\nroutes/schedules.js: line 146, col 21, \'show_notification\' is not defined.\nroutes/schedules.js: line 151, col 21, \'show_notification\' is not defined.\nroutes/schedules.js: line 152, col 21, \'remove_modal_backdrop\' is not defined.\nroutes/schedules.js: line 173, col 30, \'CAP\' is not defined.\nroutes/schedules.js: line 181, col 48, \'scheduler\' is not defined.\nroutes/schedules.js: line 185, col 35, \'scheduler\' is not defined.\nroutes/schedules.js: line 210, col 25, \'show_notification\' is not defined.\nroutes/schedules.js: line 212, col 25, \'show_notification\' is not defined.\nroutes/schedules.js: line 220, col 17, \'show_notification\' is not defined.\nroutes/schedules.js: line 230, col 13, \'remove_modal_backdrop\' is not defined.\nroutes/schedules.js: line 37, col 26, \'model\' is defined but never used.\nroutes/schedules.js: line 37, col 26, Too many errors. (15% scanned).\n\n52 errors'); 
  });

});
define('frontend/tests/test-helper', ['frontend/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('frontend/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('frontend/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:application", "ApplicationAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('frontend/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('frontend/tests/unit/controllers/schedules-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:schedules", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('frontend/tests/unit/controllers/schedules-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/schedules-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/schedules-test.js should pass jshint.'); 
  });

});
define('frontend/tests/unit/models/schedule-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("schedule", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('frontend/tests/unit/models/schedule-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/schedule-test.js should pass jshint', function() { 
    ok(true, 'unit/models/schedule-test.js should pass jshint.'); 
  });

});
define('frontend/tests/unit/routes/schedules-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:schedules", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('frontend/tests/unit/routes/schedules-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/schedules-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/schedules-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('frontend/config/environment', ['ember'], function(Ember) {
  return { 'default': {"modulePrefix":"frontend","environment":"development","baseURL":"/","locationType":"auto","EmberENV":{"FEATURES":{}},"APP":{"name":"frontend","version":"0.0.0."},"contentSecurityPolicyHeader":"Content-Security-Policy-Report-Only","contentSecurityPolicy":{"default-src":"'none'","script-src":"'self' 'unsafe-eval'","font-src":"'self'","connect-src":"'self'","img-src":"'self'","style-src":"'self'","media-src":"'self'"},"exportApplicationGlobal":true}};
});

if (runningTests) {
  require("frontend/tests/test-helper");
} else {
  require("frontend/app")["default"].create({"name":"frontend","version":"0.0.0."});
}

/* jshint ignore:end */
//# sourceMappingURL=frontend.map