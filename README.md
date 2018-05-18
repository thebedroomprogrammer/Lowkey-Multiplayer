# Lowkey-Multiplayer
### A simple browser based real-time multiplayer game. ([Playable Demo](https://lowkeymultiplayer.herokuapp.com))

![Alt text](game.gif?raw=true "Lowkey Multiplayer")

## About the project
This project is the simplest implementation of a Realtime Multiplayer Game that relies on websocket for communication and a Node js backend. No framework has been used in order to keep it as simple as possible. I have used webpack for bundling the files.

The project aims to get a basic understanding of how Realtime Multiplayer Games work online. Code you find here might not be that of a great quality but coding this game from scratch has given me a good understanding of how a game framework works behind the scenes in order to run a game.

As I learn more and more about coding games on web, the code quality would be improved and new features would be added to the game.

## Game Mechanics
You click on the start game button and you enter a game area with 100% life. Controls to move are W,A,S,D and space_bar to fire bullets. You can fire 5 bullets at once and it takes 1 second to reload. Each bullet hit takes 20% of your life. As soon as you are dead, the game ends and you are back at the first screen.
  
## How to run the game locally?
There are two folders Server and Client. 
use ```npm install``` in both the folders to install the dependencies.

Go to Server folder and use ```npm run start``` to start the server listening at PORT 3000.
Go to Client folder and use ```npm run serve``` to start the server listening at PORT 8090.
The socket.js file inside Client will make a websocket connection to the node server using websocket.

Visit localhost:8090 to see the game up and running.

## How to deploy?
Go to Client folder and use ```npm run build``` to build a js and and html file in the dist folder.
Copy the contents of dist folder and paste it inside the Public folder of Server folder.
Make sure before building the project change the link of the websocket in Socket.js file where you are going to connect to the server.
Now all you need to do is just host your Server folder as it contains all the necessary files inside the Public folder.
Deploy and visit the Index Page of your deployment side to see the game up and running.

## To Do's
- [ ] Player stats
- [ ] In game chat
- [x] Pan camera
- [x] Username addition
- [ ] Improve performance
- [ ] Game Rooms

