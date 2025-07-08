module.exports = {






    queued_adds: [],
    queued_removes: [],

    run_changes: function() {

        // This should be done at the end of the schedule
        // So theres no inconsitencies in the middle of the schedule

        // Remove first
        for (let remove of this.queued_removes) {
            remove();
        }

        // Then add components
        for (let add of this.queued_adds) {
            add();
        }

        // Since entities have been marked as dirty, we know which ones need reorganising
        // TODO: Reorganise entities into correct archetypes
        

        // Empty quened changes
        this.queued_adds = [];
        this.queued_removes = [];
    },

    


    new: function() {

        // Gen new id
        let id = Math.random().toString(36).substring(2, 15);

        // Create a base entity with no components
        return { id: id, dirty: true };

    },











    is_creep: {
        add: function(entity) {

            // Return if already has is_creep component
            if (entity.is_creep) return;

            // Capture entity in closure
            module.exports.queued_adds.push(function() {
                entity.is_creep = true;
                entity.dirty = true;
            });

        },
        remove: function(entity) {

            // Capture entity in closure
            module.exports.queued_removes.push(function() {
                delete entity.is_creep;
                entity.dirty = true;
            });

        }
    },
    home_room: {
        add: function(entity, room_name) {

            // Return if already has home_room component
            if (entity.home_room) return;

            // Capture entity in closure
            module.exports.queued_adds.push(function() {
                entity.home_room = room_name;
                entity.dirty = true;
            });

        },
        remove: function(entity) {

            // Capture entity in closure
            module.exports.queued_removes.push(function() {
                delete entity.home_room;
                entity.dirty = true;
            });

        }
    }



};