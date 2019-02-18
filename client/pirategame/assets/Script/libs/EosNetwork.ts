// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
declare var EosApi: any;
import {} from './eos.cocos'

declare type callback = (error: any, data: any) => any;
export default class EosNetwork{
    private static instance: EosNetwork = null;
    
    private constructor() {    
    }

    public static getInstance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new EosNetwork();            
        }
        return this.instance;
    } 

    public eosClient: any = null;

    connect(URL:string, cb: callback){
        console.log('EosNetwork connect to', URL);
        if(EosApi == null){            
            cb('EosApi is undefined!', null);		
        } else{
            //greet();            
            this.eosClient = EosApi({
                httpEndpoint: URL, //'https://eos.greymass.com:443',
                verbose: false, // API logging
                // logger: { // Default logging functions
                //   log: null,
                //   error: null
                // },
                fetchConfiguration: {}
              })
            var that = this;
            this.eosClient.getInfo((err, res) => {                
                if (err) {                         
                    that.eosClient = null;
                }
                cb(err, res);
            });   
        }  
    }
}
