import DS from 'ember-data';

export default DS.Model.extend({
    schedule_type: DS.attr('string'),
    name: DS.attr('string'),
    group_id: DS.attr('string'),
    user_id: DS.attr('string'),
    user_name: DS.attr('string'),
    schedule_level: DS.attr('string'),
    location: DS.attr('string'),
    schedule_kind: DS.attr('string'),
    enterprise_id: DS.attr('string'),
    events: DS.attr()
});
