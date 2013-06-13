// Find Person definition in 01_static_crud.js
var Group = DS.Firebase.Model.extend({
  name: DS.attr('string'),
  persons: DS.hasMany('Person')
});

Group.toString = function() {
  return "App.Group";
};

module('Relational associations', {
  setup: function() {
    stop();

    fb.remove(function() {
      var Adapter = DS.Firebase.Adapter;

      this.adapter = Adapter.create({
        dbName: window.DB_NAME
      });

      this.store = DS.Store.create({
        adapter: this.adapter,
        revision: 12
      });

      start();
    }.bind(this));
  },

  populate: function() {
    this.emberGroup = fb.child("groups").push({
      name: "Ember Enthusiasts"
    }).name();
    this.firebaseGroup = fb.child("groups").push({
      name: "Firebase Aficionados"
    }).name();
    this.thomas = fb.child("persons").push({
      firstName: "Thomas",
      lastName: "Boyt"
    }).name();
    this.yehuda = fb.child("persons").push({
      firstName: "Yehuda",
      lastName: "Katz",
    }).name();

  },

  teardown: function() {
    stop();

    this.adapter.fb.child("persons").off();
    this.adapter.fb.child("groups").off();

    Ember.run.sync();
    Ember.run(function() {
      this.adapter.destroy();
      this.store.destroy();
      start();
    }.bind(this));
  }
});

asyncTest("Adding a record to a relational (non-embedded) hasMany", function() {
  expect(2);

  this.populate();

  var person = Person.find(this.thomas);
  var group  = Group.find(this.emberGroup);
  person.one("didLoad", function() {

    group.one("didLoad", function() {
      person.get("groups").pushObject(group);
      person.get('transaction').commit();

      fb.child("persons").child(person.get('id')).once("value", function(snap) {
        equal(snap.child("groups").numChildren(), 1);
        equal(snap.child("groups").child(group.get('id')).val(), true);
      }.bind(this));
      //TODO: Verify the other end of the relationship, too
      // (that the person has been added to the group under groups)

      start();
    }.bind(this));

  }.bind(this));


});
