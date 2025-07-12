var Entities = require('./entities');


module.exports = {
    
    
    // Creep entity
    // Creepin along
    creep: {

        id: "creep",


        add: function(entity, creep_name) {

            // Capture entity in closure
            Entities.add_component(entity, "creep", { name: creep_name });

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, "creep");

        }
    },


    // Home Colony where this enitity belongs
    home_colony: {

        id: "home_colony",

        add: function(entity, room_name) {

            // Capture entity in closure
            Entities.add_component(entity, "home_room", room_name);

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, "home_room");

        }
    },

    // Gameobject entity
    // Wait for a gameobject to be created
    pending_gameobject_creep: {

        id: "pending_gameobject_creep",

        add: function(entity, max_wait_time) {

            if (max_wait_time == undefined) {
                max_wait_time = 152; // Max wait time for a creep spawn is 150 ticks
            }

            // Capture entity in closure
            Entities.add_component(entity, "pending_gameobject_creep", { created: Game.time, max_wait_time: max_wait_time});

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, "pending_gameobject_creep");

        }
    },

    gameobject: {

        id: "gameobject",

        add: function(entity, gameobject_id) {
            Entities.add_component(entity, "gameobject", gameobject_id);
        },
        remove: function(entity) {
            Entities.remove_component(entity, "gameobject");
        }
    }


}