var Entities = require('./entities');
let Query = require('./query');
let Util = require('./util');

module.exports = {


    spawnSystem: function() {
        

        

        let colonies = Query.colonyQuery().result;

        for (let colony of colonies) {

            // Get home room
            let homeRoom = Game.rooms[colony.id];

            
            // Get spawn
            let spawn = homeRoom.find(FIND_MY_SPAWNS)[0];

            // Get Creep count
            let creepCount = homeRoom.find(FIND_MY_CREEPS).length;


            
            if (creepCount < 0) {

                // Spawn Creep
                let creep_name = colony.id + '_' + Util.gen_id();
                let result = spawn.spawnCreep([WORK, CARRY, MOVE], creep_name);

                // Skip entity creation if spawn fails
                if (result !== OK) {
                    console.log("Failed to spawn creep: " + creep_name + " " + result.toString());
                    continue;
                }
                console.log("Spawned creep: " + creep_name);


                // Create entity
                let entity = Entities.new();
                Entities.creep.add(entity, creep_name);

                // Add components
                Entities.creep.add(entity, creep_name); // This is a creep
                Entities.home_colony.add(entity, colony.id); // Creep has a home room

            }
            

            





        }
    },


    creepCountSystem: function() {


        // Get all archetypes with the creep component
        let creep_count = Object.values(Memory.archetypes).reduce((total, archetype) => {
            if (archetype.components.includes('creep')) {
                total += archetype.entities.length;
            }
            return total;
        }, 0);

        console.log("Creep count: " + JSON.stringify(creep_count));
        
    }



};