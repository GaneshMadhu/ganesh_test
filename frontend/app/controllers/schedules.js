import Ember from 'ember';

export default Ember.Controller.extend({
paginatedContent: (function() {
        return this.get('arrangedContent');
    }).property('arrangedContent.[]'),
});
