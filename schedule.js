const entities = require('./entities');


module.exports = {


    before_tick: function() {

        // Create new entities
        // This allows time for game objects spawned in the last tick to be 
        // created and entities added before the systems run
        entities.process_new_entities();

    },

    after_tick: function() {
        // Remove empty archetypes
        //entities.clean_archetypes();
    },




    // Create a new schedule
    // Takes care of processing changes, just provide the systems to run
    new: function(systems_to_run) {


        return {


            systems: systems_to_run,

            run: function() {
                

                // ===== Run Systems =====
                // Run systems provided
                for (let system of this.systems) {
                    system();
                }


                // ===== Process Changes =====
                // Run commands to be run after the current tick
                entities.process_component_changes();
                // Update entity archetypes
                entities.update_archetypes(); // This is required after component changes
                

            }


        }

    },

};