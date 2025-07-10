var Components = require('./entities');

module.exports = {


    // Query to get all colonies
    colonyQuery: function() {

        // Returns an array of enities with their components
        return {
            result: [
                {
                    id: "W8N3",
                    is_colony: true,
                }
            ]
        }
    },


    // Query to get all creeps
    creepQuery: function() {

        // Returns an array of enities with their components

        // This is what it should look like
        /*return {
            result: [
                {
                    id: "entity_id",
                    is_creep: true,
                    homeRoom: {
                        room: "W8N3",
                    },
                    harvest: {
                        target_source: "source_id",
                        target_room: "W8N3",
                    }
                }
            ]
        }*/

        let creep_entities = [];

        for (let creepName in Game.creeps) {
            let creep = Game.creeps[creepName];

            creep_entities.push({
                id: creep.id,
                is_creep: true,
                home_room: {
                    room: creep.room.name,
                },
                harvester: {
                    target_source: creep.memory.source,
                    target_room: creep.room.name,
                }
                
            });
        }

        // This is what it should look like
        return {
            result: creep_entities,
        }





    },


    





}