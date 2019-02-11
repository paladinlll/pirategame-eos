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
    @property(LoginPanel)
    loginPanel: LoginPanel = null;

    @property(LobbyPanel)
    lobbyPanel: LobbyPanel = null;

    //@property(cc.Label)
    //lblPlayer: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:
    
    // onLoad () {}

    start () {
        this.lobbyPanel.node.active = false;
        this.loginPanel.show();
        
        var that = this;
        this.loginPanel.node.on('authorized', (user_info:any) => {
            that.loginPanel.node.active = false;
            that.lobbyPanel.node.active = true;
            console.log(user_info);
        });
    }

    // update (dt) {}
}
