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
//  }
//
//







// ////////////////////////////////////
// Memory and Variable Setup
// ////////////////////////////////////


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







// ////////////////////////////////////
// Internal Functions
// ////////////////////////////////////







// Get the id of an archetype based on its components
function get_archtype_id (components) {

    return Object.keys(components).map(component => component.toLowerCase())
        .filter((component, index, array) => array.indexOf(component) === index)
        .sort().join(',');

}

function get_component_names(components) {
    return Object.keys(components)
        .map(component => component.toLowerCase())
        .filter((component, index, array) => array.indexOf(component) === index)
        .sort();
}



function create_archetype(components) {
    
    if (!archetype_components) {
        archetype_components = ['empty'];
    }

    archetype = {
        
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





module.exports = {



    // ////////////////////////////////////
    // Archetype functions
    // ////////////////////////////////////

 

    // Retreive an archetype from memory
    // Transparently creates a new archetype if it doesn't exist
    get_archetype: function(raw_components) {

        // Make sure atleast 1 component is provided
        if (!raw_components) {
            raw_components = { no_components: true };
        }

        // Get the id of the archetype
        let id = get_archtype_id(raw_components);

        // If the archetype doesn't exist, create it
        if (!Memory.archetypes[id]) {

            Memory.archetypes[id] = {
                id: id,
                components: get_component_names(raw_components),
                entities: []
            }

            console.log("Created new archetype: " + id);
            
        }

        // Return reference to the archetype
        return Memory.archetypes[id];

    },



    // Reorganises entities into correct archetypes
    update_archetypes: function() {

        // Filter out all dirty entities
        let dirty_entities = [];
        for (let archetype of Object.values(Memory.archetypes)) {

            // Get all dirty entities in this archetype and add them to the dirty entities list
            dirty_entities = dirty_entities.concat(archetype.entities.filter(entity => entity.dirty));

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


    // Process all entities that are marked for deletion
    process_deleted_entities: function() {

        for (let archetype of Object.values(Memory.archetypes)) {

            for (let i = archetype.entities.length - 1; i >= 0; i--) {

                if (archetype.entities[i].delete) {
                    archetype.entities.splice(i, 1);
                }

            }

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

        // If there are no changes, skip
        if (queued_component_changes.length > 0) {
            console.log("Queued changes: " + queued_component_changes.length);
        }

        // Run all component changes
        for (let change of queued_component_changes) {
            change();
        }

        // Empty quened changes
        queued_component_changes = [];

        
    },



    // ////////////////////////////////////
    // Entities
    // ////////////////////////////////////
    

    


    // Create a new entity at end of the schedule
    // Returns reference to the new entity
    new: function() {

        
        let entity = { dirty: true, components: {} };
        Memory.new_entities.push(entity);
        entity.id = Math.random().toString(36).substring(2, 15);
        return entity;

    },

    // Delete an entity at end of the schedule
    delete: function(entity) {
        
        // Add tag for later deletion
        entity.delete = true;

    },





    // Add a component to an entity at end of the schedule
    add_component: function(entity, component_name, component_data) {

        console.log("Adding component: " + component_name);

        // Add the command to the queue
        queued_component_changes.push(function() {
            entity.components[component_name] = component_data;
            entity.dirty = true;
        });

    },


    // Remove a component from an entity at end of the schedule
    remove_component: function(entity, component_name) {
        
        queued_component_changes.push(function() {
            console.log("Removing component: " + component_name);
            delete entity.components[component_name];
            entity.dirty = true;
        });
        
    },



    // Query to get all entities that match the required components
    query: function (required, without) {

        // Default to empty arrays if not provided
        if (!required) {
            required = [];
        }
        if (!without) {
            without = [];
        }

        let result = {
            archetypes: [],
            entities: []
        }
        


        // Make sure there are archetypes to query
        if (Object.keys(Memory.archetypes).length) {
            



            // Get all archetypes that match the required components
            // Uses a filter over the Memory.archetypes object
            let archetypes = Object.values(Memory.archetypes).filter((archetype) => {

                // If the archetype does not have all of the required components, return false
                for (let component of required) {
                    if (!archetype.components.includes(component)) {
                        return false;
                    }
                }

                // If the archetype has any of the components in the without array, return false
                for (let component of without) {
                    if (archetype.components.includes(component)) {
                        return false;
                    }
                }
                return true;
            });




            // Add the archetypes to the result
            result.archetypes = archetypes;
            // Get all entities from the archetypes
            result.entities = archetypes.map((archetype) => { 
                return archetype.entities;
            }).flat();


        }


        
        // Return the archetypes and entities
        return result;

    },





   



};