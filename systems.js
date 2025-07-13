var Entities = require('./entities');
var Components = require('./components');

module.exports = {


    spawnSystem: function() {
        

        

        let colonies = [
            {
                id: "W8N3",
                is_colony: true,
            }
        ]

        for (let colony of colonies) {

            // Get home room
            let homeRoom = Game.rooms[colony.id];
            
            // Get spawn
            let spawn = homeRoom.find(FIND_MY_SPAWNS)[0];

            // Get Creep count
            let creepCount = homeRoom.find(FIND_MY_CREEPS).length;


            
            if (creepCount < 0) {

                // Spawn Creep
                let creep_name = colony.id + '_' + Math.random().toString(36).substring(2, 15);
                let result = spawn.spawnCreep([WORK, CARRY, MOVE], creep_name);

                // Skip entity creation if spawn fails
                if (result !== OK) {
                    continue;
                }
                console.log("Spawned creep: " + creep_name);


                // Create entity
                let entity = Entities.new();

                // Add components
                Components.creep.add(entity, creep_name); // This is a creep
                Components.home_colony.add(entity, colony.id); // Creep has a home room
                Components.pending_gameobject_creep.add(entity); // Creep is waiting for a gameobject

            }
            

            





        }
    },


    creepCountSystem: function() {

        let result = Entities.query(['creep'], []);

        console.log("Creep count: " + result.entities.length);

    },
    


    assignGameobjectSystem: function() {


        let result = Entities.query([
            Components.pending_gameobject_creep.id, 
            Components.creep.id], 
            []);

        
        for (let entity of result.entities) {

            let c_wait_for_gameobject_creep = entity.components.pending_gameobject_creep;
            let c_creep = entity.components.creep;

            

            // Try getting gameobject of creep
            let object = Game.getObjectById(Game.creeps[c_creep.name].id);
            

            // If gameobject is found, add gameobject component
            if (object) {
                console.log("Gameobject found for creep: " + c_creep.name);
                Components.gameobject.add(entity, object.id);
                Components.pending_gameobject_creep.remove(entity);
                continue;
            }


            // If gameobject is not found, check if max wait time has been reached
            // If so, remove the entity
            if (Game.time - c_wait_for_gameobject_creep.created > c_wait_for_gameobject_creep.max_wait_time) {
                Components.pending_gameobject_creep.remove(entity);
                console.log("Max wait time reached for creep: " + c_creep.name);
                // TODO: Delete entity
                continue;
            }
        }

    },

    

    






};