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
@ccclass
export default class GhostLegPanel extends cc.Component {

    @property(cc.Node)
    bodyNode: cc.Node;

    @property(GhostLegEntry)
    lineNodes: GhostLegEntry[] = [];

    @property(cc.Node)
    slashNodes: cc.Node[] = [];

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
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
        
        for(let i=0;i<l.length;i++){
            let c = l[i];
            this.slashNodes[i].setPosition((10 * (h[i] * 1.0 / cur_h) - 7 + 2) * 40, (c - (-0.5 + numLine / 2)) * 40);
            this.slashNodes[i].active = true;
        }

    }

    // update (dt) {}
}
