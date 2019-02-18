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

@ccclass
export default class LobbyPanel extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:
    show(){
        this.node.active = true;
                
        var that = this;        
        let URL = 'https://eos.greymass.com:443';
        
        EosNetwork.getInstance().connect(URL, function(err, data) {
            if (err) {                         
                console.log('error', JSON.stringify(err));
            } else {
                console.log('res', JSON.stringify(data));
            }            
        });
    }

    hide(){
        this.node.active = false;
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
