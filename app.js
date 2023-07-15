const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server is running at http://localhost:3002");
    });
  } catch (e) {
    console.log(`db error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//get players list
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_name;`;

  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//get player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//post player or adding player

app.post("/players/", async (request, response) => {
  try {
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
       VALUES (${playerName},${jerseyNumber},${role});`;
    const dbResponse = await db.run(addPlayerQuery);
    const playerId = dbResponse.lastID;
    response.send("Player Added to Team");
  } catch (e) {
    console.log(`error from POST ${e.message}`);
  }
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const updatePlayerQuery = `UPDATE cricket_team SET
        player_name = '${playerName}',
        jersey_number ='${jerseyNumber}',
        role = '${role}'
        WHERE player_id = ${playerId}`;

    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`error from put${e.error}`);
  }
});

//DELETE PLAYER FROM TABLE

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team 
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
