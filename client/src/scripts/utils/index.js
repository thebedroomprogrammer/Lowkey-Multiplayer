export let socketEP = (socketData) =>{
    let parsedData = JSON.parse(socketData.data);
    let event = parsedData[0];
    let data = parsedData[1];
    
    return {
        event,
        data
    }
}