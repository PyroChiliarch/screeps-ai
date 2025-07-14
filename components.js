var Entities = require('./entities');


module.exports = {
    
    
    // ////////////////////////////////////////////////////
    // Colony components
    // ////////////////////////////////////////////////////
    

    // Colony entity
    colony: {

        id: "colony",

        add: function(entity, colony_name, room_name, source_id_array) {

            // Capture entity in closure
            Entities.add_component(entity, this.id, { name: colony_name, room: room_name });

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, this.id);

        }
    },


    // Home Colony where this enitity belongs
    home_colony: {

        id: "home_colony",

        add: function(entity, room_name) {

            // Capture entity in closure
            Entities.add_component(entity, this.id, { room: room_name });

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, this.id);

        }
    },

    // ////////////////////////////////////////////////////
    // Creep type components
    // ////////////////////////////////////////////////////

    creep_type_basic: {

        id: "creep_type_basic",

        add: function(entity) {
            Entities.add_component(entity, this.id, true);
        },
        remove: function(entity) {
            Entities.remove_component(entity, this.id);
        }
    },

    // ////////////////////////////////////////////////////
    // Creep components
    // ////////////////////////////////////////////////////

    // Creep entity
    // Creepin along
    creep: {

        id: "creep",


        add: function(entity, creep_name) {

            // Capture entity in closure
            Entities.add_component(entity, this.id, { name: creep_name });

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, this.id);

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
            Entities.add_component(entity, this.id, { created: Game.time, max_wait_time: max_wait_time});

        },
        remove: function(entity) {

            // Capture entity in closure
            Entities.remove_component(entity, this.id);
            console.log("Removing pending gameobject creep");

        }
    },

    gameobject: {

        id: "gameobject",

        add: function(entity, gameobject_id) {
            Entities.add_component(entity, this.id, { id: gameobject_id });
        },
        remove: function(entity) {
            Entities.remove_component(entity, this.id);
        }
    },

    source: {

        id: "source",

        add: function(entity, source_id) {
            Entities.add_component(entity, this.id, { id: source_id });
        },
        remove: function(entity) {
            Entities.remove_component(entity, this.id);
        }
    },

    move_to: {
        id: "move_to",
        add: function(entity, pos, exact) {
            // If exact is false, then will stop moving if creep is within 1 tile of the target
            // If exact is true, then will stop moving if creep is at the target position

            // Default exact to False
            if (exact == undefined) {
                exact = false;
            }

            Entities.add_component(entity, this.id, { pos: pos, exact: exact });
        },
        remove: function(entity) {
            Entities.remove_component(entity, this.id);
        }
    }

    


}