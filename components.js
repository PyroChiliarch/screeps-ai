module.exports = {
    
    // Creep entity
    // Creepin along
    creep: {
        add: function(entity, creep_name) {

            // Capture entity in closure
            add_component_change(function() {
                if (entity.components.creep) return;
                entity.components.creep = { name: creep_name };
                entity.dirty = true;
            });

        },
        remove: function(entity) {

            // Capture entity in closure
            add_component_change(function() {
                if (!entity.components.creep) return;
                delete entity.components.creep;
                entity.dirty = true;
            });

        }
    },


    // Home Colony where this enitity belongs
    home_colony: {
        add: function(entity, room_name) {

            // Capture entity in closure
            add_component_change(function() {
                if (entity.components.home_room) return;
                entity.components.home_room = room_name;
                entity.dirty = true;
            });

        },
        remove: function(entity) {

            // Capture entity in closure
            add_component_change(function() {
                if (!entity.components.home_room) return;
                delete entity.components.home_room;
                entity.dirty = true;
            });

        }
    }

    
}