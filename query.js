var Components = require('./entities');






module.exports = {



    // Query to get all entities that match the required components
    run: function (required, without) {

        // Default to empty arrays if not provided
        if (!required) {
            required = [];
        }
        if (!without) {
            without = [];
        }

        // Get all archetypes that match the required components
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


        return {
            archetypes: archetypes, // list of archetypes
            entities: archetypes.map((archetype) => { // list of entities
                return archetype.entities;
            }).flat(),
        }



    },
    



}