        /* eslint-disable */
        let socketInstance = null;
        if( 'function' === typeof importScripts) {
          const io=importScripts('https://cdn.socket.io/4.5.0/socket.io.min.js');  
        }
        
        self.onmessage= function handleMessageFromMain(e){
        console.log('***** worker running *****');
        const { data } = e;
        const storeId = data[0];
        const consumerId = data[1];
        const ruleSyncTimestamp =data[2];
        const SOCKET_SERVER_URL = data[3];
        const token = data[4];
        const config={
          storeId:0,
          consumerId:0,
          machine_id:0
        }
        config['storeId']=storeId ;
        config['consumerId']=consumerId ;
        config['machine_id']=storeId+"-"+consumerId;

        console.log("Calling to server " + SOCKET_SERVER_URL +"\n");
        console.log("Store Config in worker" + JSON.stringify(config));
        if (socketInstance === null) {
          socketInstance = io(SOCKET_SERVER_URL,{
                transports: ["websocket"],
                pingInterval: 1000 * 20,
                pingTimeout: 1000 * 60,
                path:'/websocket',
                query:{
                  token:token
                }
              });
        }

        if(socketInstance){

        socketInstance.on('connect', () => {
          console.log('store connected with server');
        });
        
        //Ask for data so call specific event to do some task from service
        //register consumer to store event
        socketInstance.emit('connect-store', config);
        
        //On reconnect fire again the register consumer to store event
        socketInstance.io.on('reconnect', () => {
          socketInstance.emit('connect-store', config);
        });

        socketInstance.on('store-connected-fecth-data', (id) => {
          socketInstance.emit('fetch-store-settings', id);
          socketInstance.emit('fetch-rules', ruleSyncTimestamp);
        });

        socketInstance.on('update-store-settings', (incomingMmessage) => {
          self.postMessage(JSON.stringify(incomingMmessage)); 
        });

        socketInstance.on('update-rule', (incomingMmessage) => {
         self.postMessage(JSON.stringify(incomingMmessage)); 
       });

       socketInstance.on("connect_error", () => {
        // revert to classic upgrade
        console.log("*** Web socket connection failed from server ****");
        socketInstance.io.opts.transports = ["polling", "websocket"];
        socketInstance.io.opts.path='/websocket';
        });
  
    }
  
};