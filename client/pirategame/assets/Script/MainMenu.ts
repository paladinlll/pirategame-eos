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
declare var gapi: any;

import LobbyPanel from './Popups/LobbyPanel/LobbyPanel';
import LoginPanel from './Popups/LoginPanel/LoginPanel';

@ccclass
export default class MainMenu extends cc.Component {
    @property
    loginPanel: LoginPanel = null;

    @property
    lobbyPanel: LobbyPanel = null;

    //@property(cc.Label)
    //lblPlayer: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:
    spawPrefab(name:string, bActive:boolean, layer: number){
        var that = this;
        return new Promise(function(resolve, reject) {
            cc.loader.loadRes(name, cc.Prefab, (err, prefab) => {
                if (err) {                    
                    return reject(err);
                }
                var obj = cc.instantiate(prefab);
                that.node.addChild(obj, layer);  
                obj.active = bActive;
                resolve(obj);
            });
        });
    }
    onLoad (){        
        
        
    }

    start () {    
        var that = this;
        var p = [];
        p.push(this.spawPrefab('Prefab/LoginPanel', true, 0));
        p.push(this.spawPrefab('Prefab/LobbyPanel', false, 1));
        
        Promise.all(p).then(values => {               
            that.loginPanel = values[0].getComponent(LoginPanel);
            that.lobbyPanel = values[1].getComponent(LobbyPanel);            

            that.loginPanel.node.on('authorized', (user_info: any) => {
                console.log('authorized');
                that.loginPanel.node.active = false;
                that.lobbyPanel.show();
            });
            that.loginPanel.show();
        }, reason => {
            console.log(reason)
        });        
    }

    // update (dt) {}
}
