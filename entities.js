
function get_archtype_id (components) {

    return components.map(component => component.toLowerCase())
    .filter((component, index, array) => array.indexOf(component) === index)
    .sort().join(',');

}


class Archetype {
    constructor(archetype_components) {
        

        return {
            
            // Component signature (sorted, unique, lowercase)
            components: archetype_components
                .map(component => component.toLowerCase())
                .filter((component, index, array) => array.indexOf(component) === index)
                .sort(),

            // Can be used to identify the archetype as keys in objects
            id: get_archtype_id(archetype_components),
            
            // Entity IDs (not the actual entities)
            entities: []
        }
    }
}


// Setup entity storage

if (!Memory.entities) {
    Memory.entities = {};
}





module.exports = {






    // ////////////////////////////////////
    // Archetypes
    // ////////////////////////////////////

 

    get_archetype: function(components) {


        let id = get_archtype_id(components);

        if (!Memory.entities[id]) {
            Memory.entities[id] = new Archetype(components);
        }

        return Memory.entities[id];

    },





    // TODO Have function to create archetype
    // Need to add code where the entities are added
    // Need to add code that removes old archetypes





    
    // ////////////////////////////////////
    // Life Cycle
    // ////////////////////////////////////


    queued_adds: [],
    queued_removes: [],


    // Should run at end of the tick
    run_changes: function() {

        console.log("Commiting Changes to entities");

        //console.log("Queued new entities: " + this.queued_newEntities.length);
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

        let dirty_entities = [];
        



        // Add new entities to the correct archetype
        

        // Empty quened changes
        this.queued_adds = [];
        this.queued_removes = [];

        
    },

    


    new: function() {

        // Create a base entity with no components
        let entity = { dirty: true };
        module.exports.queued_newEntities.push(entity);
        return entity;

    },








    // ////////////////////////////////////
    // Components
    // ////////////////////////////////////


    // ID of the entity
    // Needs this before it can be added to an archetype
    id: {
        add: function(entity) {

            if (entity.id) return;
            entity.id = Util.gen_id();
            entity.dirty = true;

        },

        remove: function(entity) {
            delete entity.id;
            entity.dirty = true;
        }

    },



    // Creep entity
    // Creepin along
    creep: {
        add: function(entity, creep_name) {

            // Return if already has is_creep component
            if (entity.is_creep) return;

            // Capture entity in closure
            module.exports.queued_adds.push(function() {
                entity.creep = { name: creep_name };
                entity.dirty = true;
            });

        },
        remove: function(entity) {

            // Capture entity in closure
            module.exports.queued_removes.push(function() {
                delete entity.creep;
                entity.dirty = true;
            });

        }
    },


    // Home Colony where this enitity belongs
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