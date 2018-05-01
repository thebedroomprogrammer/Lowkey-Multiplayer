export default (function(){
    let gameState = {};

    let updateGameState = (action) => {
        switch(action.type){
            case "LOG":
            console.log(action.payload);
        }
    }

    return {
        updateGameState,
        gameState
    }
})();