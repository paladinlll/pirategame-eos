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

@ccclass
export default class BallWidget extends cc.Component {

    @property(cc.Animation)
    pigAnimation: cc.Animation = null;

    // @property
    // dirAnim: string = 'pig_right';

    // @property
    // speed: cc.Vec2 = new cc.Vec2();

    // LIFE-CYCLE CALLBACKS:
    setSpeed (dir) {
		var dirAnim = 'pig_right';
	    if(dir == -1)
			dirAnim = 'pig_down';
		else if(dir == 1)
			dirAnim = 'pig_up';		
		this.pigAnimation.play(dirAnim);
    }
    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
