const entities = require('./entities');
var Systems = require('./systems');

module.exports = {
    run: function() {

        
        console.log("Starting default schedule");




        // ===== Process =====
        // Get new entities from temp memory and add them to the correct archetype
        // run systems
        // process component changes
        // Update archtypes, (move entities between archetypes)
        // clean up empty archetypes









        // Create new entities
        entities.process_new_entities();





        // Run systems
        Systems.spawnSystem();
        Systems.creepCountSystem();




        // Run commands to be run after the current tick
        entities.process_component_changes();

        // Update entity archetypes
        entities.update_archetypes(); // This is required after component changes

        // Remove empty archetypes
        entities.clean_archetypes();



        console.log("Archetypes: " + Object.keys(Memory.archetypes).length);
        console.log("New Entities: " + Memory.new_entities.length);


        
    }
};