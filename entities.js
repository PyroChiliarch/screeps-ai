// ////////////////////////////////////////
// Archetype Structure:
// {
//   "components": ["creep", "home_room"],           // Array of component names (sorted, unique, lowercase)
//   "id": "creep,home_room",                        // String identifier for the archetype
//   "entities": [                                   // Array of entity objects that match this archetype
//     { ... },
//     { ... },
//     { ... },
//   ]
// }
//
// Entity Structure:
//  {
//      "id": "iv3plbw0pzd"                        // Unique entity identifier
//      "components": {                             // Entity's actual component data
//          "creep": {"name": "W8N3_uzcg4idah8"},
//          "home_room": "W8N3"
//      },
//      "dirty": true                                // Flag to indicate if the entity has been modified
//      }
//
//
//
//
//
//
//
//
















let Util = require('./util');

// Internal variables
queued_component_changes = [];


// Setup new entity storage
if (!Memory.new_entities) {
    Memory.new_entities = [];
}


// Setup entity storage
if (!Memory.archetypes) {
    Memory.archetypes = {};
}




function add_component_change(command) {

    // Add the command to the queue
    queued_component_changes.push(command);

}




function get_archtype_id (components) {

    if (!components) {
        return "empty";
    }



    return Object.keys(components).map(component => component.toLowerCase())
        .filter((component, index, array) => array.indexOf(component) === index)
        .sort().join(',');

}


class Archetype {
    constructor(archetype_components) {


        if (!archetype_components) {
            archetype_components = ['empty'];
        }



        return {

            
            
            // Component signature (sorted, unique, lowercase)
            components: Object.keys(archetype_components)
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






module.exports = {






    // ////////////////////////////////////
    // Archetypes
    // ////////////////////////////////////

 

    get_archetype: function(components) {


        let id = get_archtype_id(components);

        if (!Memory.archetypes[id]) {
            Memory.archetypes[id] = new Archetype(components);
            console.log("Created new archetype: " + id);
        }

        // Repair the structure of the archetype
        if (!Memory.archetypes[id].entities) {
            Memory.archetypes[id].entities = [];
        }

        return Memory.archetypes[id];

    },



    // Reorganises entities into correct archetypes
    update_archetypes: function() {

        console.log("Updating archetypes");



        // Filter out all dirty entities
        let dirty_entities = [];
        for (let archetype of Object.values(Memory.archetypes)) {

            // Get all dirty entities in this archetype and add them to the dirty entities list
            dirty_entities.concat(archetype.entities.filter(entity => entity.dirty));

            // Remove dirty entities from the archetype
            archetype.entities = archetype.entities.filter(entity => !entity.dirty);

        }



        // Reorganise dirty entities into correct archetypes
        for (let entity of dirty_entities) {

            // Get the archetype of the entity
            let archetype = this.get_archetype(entity.components);

            // Add the entity to the archetype
            archetype.entities.push(entity);

            // Remove dirty flag
            delete entity.dirty;

        }



    },


    // Remove all archetypes with no entities
    clean_archetypes: function() {
        for (let archetype of Object.values(Memory.archetypes)) {
            if (archetype.entities.length === 0) {
                delete Memory.archetypes[archetype.id];
                console.log("Removed empty archetype: " + archetype.id);
            }
        }
    },







    
    // ////////////////////////////////////
    // Life Cycle
    // ////////////////////////////////////

    
    process_new_entities: function() {

        for (let entity of Memory.new_entities) {

            // Add the entity to the correct archetype
            let archetype = this.get_archetype(entity.components);
            archetype.entities.push(entity);

            // Remove dirty flag
            delete entity.dirty;

        }

        // Empty temp memory
        Memory.new_entities = [];

    },
    


    // runs delayed commands at end of the tick
    process_component_changes: function() {

        console.log("Running commands");


        console.log("Queued changes: " + queued_component_changes.length);

        // Run all component changes
        for (let change of queued_component_changes) {
            change();
        }

        // Empty quened changes
        queued_component_changes = [];
        
    },


    

    


    new: function() {

        // Create a base entity with no components
        let entity = { dirty: true, components: {} };
        Memory.new_entities.push(entity);
        entity.id = Util.gen_id();
        return entity;

    },








    // ////////////////////////////////////
    // Components
    // ////////////////////////////////////



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



};