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
@ccclass
export default class LoginPanel extends cc.Component {

    @property(cc.Button)
    btnDelegateCall: cc.Button = null;

    // LIFE-CYCLE CALLBACKS:
    show(){
        this.node.active = true;  
        if( typeof gapi != "undefined" ){
            this.btnDelegateCall.interactable = true;
        } else{            
            this.btnDelegateCall.interactable = false;
        }      
    }

    hide(){
        this.node.active = false;
    }
    onGoogleLogin(){
        var that = this;
        if( typeof gapi != "undefined" ){
            var isSigned = gapi.auth2.getAuthInstance().isSignedIn.get();
            if(isSigned){                
                this.getGoogleProfile();
            } else{
                gapi.auth2.getAuthInstance().signIn().then(
                    function(success) {
                        // Login API call is successful	
                        console.log(success);
                        that.getGoogleProfile();
                    },
                    function(error) {
                        // Error occurred                        
                        console.log(error);
                    }
                );
            }            
        }
    }

    getGoogleProfile(){        
        var that = this;
        // API call to get user profile information
        gapi.client.request({ path: 'https://www.googleapis.com/plus/v1/people/me' }).then(
            function(success) {
                // API call is successful

                var user_info = JSON.parse(success.body);
                //that.lblPlayer.string = user_info.displayName;
                // user profile information
                
                that.node.emit('authorized', user_info);
            },
            function(error) {
                // Error occurred
                // console.log(error) to find the reason
            }
        );
    }

    onGuest(){
        this.node.emit('authorized', null);
    }
    // onLoad () {}

    start () {            
    }

    // update (dt) {}
}
