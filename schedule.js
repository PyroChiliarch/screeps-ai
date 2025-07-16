const entities = require('./entities');


module.exports = {


    before_tick: function() {

        

    },

    after_tick: function() {

        // Remove empty archetypes
        entities.clean_archetypes();

    },




    // Create a new schedule
    // Takes care of processing changes, just provide the systems to run
    new: function(systems_to_run) {


        return {


            systems: systems_to_run,

            run: function() {

                

                // Process deleted entities
                entities.process_deleted_entities();

                
                

                // ===== Run Systems =====
                // Run systems provided
                for (let system of this.systems) {
                    system();
                }



                


                // ===== Process Changes =====
                // Create new entities
                entities.process_new_entities();
                // Run commands to be run after the current tick
                entities.process_component_changes();
                // Update entity archetypes
                entities.update_archetypes(); // This is required after component changes
                

            }


        }

    },

};