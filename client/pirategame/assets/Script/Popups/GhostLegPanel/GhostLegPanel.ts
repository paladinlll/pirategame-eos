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
import Utils from '../../Utils'
import GhostLegEntry from './GhostLegEntry'
import BallWidget from './BallWidget'

@ccclass
export default class GhostLegPanel extends cc.Component {

    @property(cc.Node)
    bodyNode: cc.Node = null;

    @property(GhostLegEntry)
    lineNodes: GhostLegEntry[] = [];

    @property(cc.Node)
    slashNodes: cc.Node[] = [];

    @property(BallWidget)
    ballWidget: BallWidget = null;

    @property
    isMoving: boolean = false;

    @property
    movePath: cc.Vec2[] = [];

    @property
    dirs: number[] = [];

    @property
    moveStep: number = 0;

    @property
    swaps: number[] = [];

    @property
    distances: number[] = [];

    @property
    maxDist: number = 0;

    // LIFE-CYCLE CALLBACKS:
    onSelectLeg(idx: number){
        if(this.isMoving) return;

        var p = idx;
        var l = [];
        var d = [];
        
        l.push(this.getDist(this.distances[0], idx));
        d.push(0);
        for(let i=0;i<this.swaps.length;i++){            
            if(this.swaps[i] == p){
                l.push(this.getDist(this.distances[i], p));
                d.push(0);
                p+=1;                
                l.push(this.getDist(this.distances[i], p));
                d.push(1);
            } else if(p > 0 && this.swaps[i] == p - 1){
                l.push(this.getDist(this.distances[i], p));
                d.push(0);
                p-=1;                
                l.push(this.getDist(this.distances[i], p));
                d.push(-1);
            }  
        }
        this.isMoving = true;
        this.movePath = l;
        this.dirs = d;
        this.moveStep = 0;
        this.ballWidget.node.setPosition(new cc.Vec2(-280, l[0].y));        
    }
    // onLoad () {}

    start () {
        var that = this;
        var numLine = 11;
        for(let i=this.lineNodes.length;i<numLine;i++){
            let obj = cc.instantiate(this.lineNodes[0].node);
            this.bodyNode.addChild(obj); 
            this.lineNodes.push(obj.getComponent(GhostLegEntry));
        }

        this.slashNodes[0].active = false;
        for(let i=this.slashNodes.length;i<240;i++){
            let obj = cc.instantiate(this.slashNodes[0]);
            this.bodyNode.addChild(obj); 
            this.slashNodes.push(obj);
        }

        
        
        for(let i=0;i<numLine;i++){
            this.lineNodes[i].node.setPosition(0, (i - (-0.5 + numLine / 2)) * 40);
            this.lineNodes[i].label.string = (i + 1).toString();
            let idx = i;
            this.lineNodes[i].button.node.on(cc.Node.EventType.TOUCH_END, function (evt) {				
				that.onSelectLeg(idx);
            });
        }

        
        var l = [];
        var h = [];
        var cur_h = 0;
        var d = 10;
        var r = [];
        while(r.length > 0 || d > 0){
            if(r.length == 0){
                for(let i=0;i<numLine-1;i++){
                    r.push(i);
                }
                d-=1;
            }
            let c = Utils.GetRandom32(r.length);

            var bHit = false;
            for(let j=0;j<l.length;j++){
                if(h[j] == cur_h && Math.abs(r[c] - l[j]) <= 1){
                    bHit = true;
                    break;
                }
            }
            if(bHit){
                cur_h += 1;
            }

            l.push(r[c]);
            h.push(cur_h);

            
            r.splice(c, 1);
            
        }
        
        this.maxDist = cur_h;

        for(let i=0;i<l.length;i++){
            let c = l[i];
            this.slashNodes[i].setPosition(this.getDist(h[i], c));
            this.slashNodes[i].active = true;
        }

        this.swaps = l;
        this.distances = h;
        
    }

    // getDist(mx:number, my:number){
    //     return (10 * (idx * 1.0 / this.maxDist) - 7 + 2) * 40;
    // }
    getDist(mx:number, my:number) : cc.Vec2{
        return new cc.Vec2 ((10 * (mx * 1.0 / this.maxDist) - 7 + 2) * 40, (my - (-0.5 + 11 / 2)) * 40)
    }

    update (dt) {
        if(this.isMoving && this.moveStep < this.movePath.length){            
            var dist = dt * 200;
            var next = this.moveStep + 1;
            
            var curPos = this.ballWidget.node.getPosition();
            var nextPos = curPos.clone();
            if(next < this.movePath.length){
                nextPos = this.movePath[next];
            } else{
                nextPos.x = 280;                
            }
            var vec = nextPos.sub(curPos);
            var d = vec.mag();
            if(d <= dist){
                this.moveStep++; 
                if(this.moveStep >= this.movePath.length){
                    this.isMoving = false;
                }
                if(this.moveStep + 1 >= this.movePath.length){                    
                    this.ballWidget.setSpeed(0);
                }else{
                    this.ballWidget.setSpeed(this.dirs[this.moveStep + 1]);
                }
            } else{
                nextPos = curPos.add(vec.mul(dist / d));
            }
            
            this.ballWidget.node.setPosition(nextPos);
        }
    }
}
