// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import EosNetwork from '../../libs/EosNetwork'
import GameDefines from '../../GameDefines'
import LobbyEntry from './LobbyEntry'

@ccclass
export default class LobbyPanel extends cc.Component {

    @property(LobbyEntry)
    lobbyEntries: LobbyEntry[] = [];

    // LIFE-CYCLE CALLBACKS:
    show(){
        this.node.active = true;
                
        var that = this;        

        this.fillGames([]);
        let URL = GameDefines.DEFAULT_EOS_ENDPOINT;        
        EosNetwork.getInstance().connect(URL, function(err, data) {
            if (err) {                         
                console.log('error', JSON.stringify(err));
            } else {
                console.log('res', JSON.stringify(data));
                that.fetchGames();
            }            
        });
    }

    fetchGames(){
        var that = this;
        EosNetwork.getInstance().getTableRows(
            GameDefines.CONTRACT_CREATOR,
            GameDefines.CONTRACT_NAME,
            'game',
            'key',  
            function(err, data) {
            if (err) {                         
                console.log('error', JSON.stringify(err));
                that.fillGames([]);
            } else {
                that.fillGames(data);
            }            
        });
    }
    fillGames(games: []){
        var totalGame = games.length;
        for(let i=this.lobbyEntries.length;i<totalGame;i++){
            let obj = cc.instantiate(this.lobbyEntries[0].node);
            this.node.addChild(obj); 
            this.lobbyEntries.push(obj.getComponent(LobbyEntry));
        }
        for(let i=0;i<this.lobbyEntries.length;i++){
            this.lobbyEntries[i].node.active = (i < totalGame);
        }
    }

    hide(){
        this.node.active = false;
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
