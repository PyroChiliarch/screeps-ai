module.exports = {






    queued_newEntities: [],
    queued_adds: [],
    queued_removes: [],

    run_changes: function() {

        console.log("Commiting Changes to entities");

        console.log("Queued new entities: " + this.queued_newEntities.length);
        console.log("Queued entities " + JSON.stringify(this.queued_newEntities));
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

        console.log(JSON.stringify(this.queued_newEntities));
    },

    


    new: function(id) {

        // Create a base entity with no components
        console.log("New entity: " + id);
        let entity = { id: id, dirty: true };
        module.exports.queued_newEntities.push(entity);
        return entity;

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
    home_colony: {
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