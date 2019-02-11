// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        btnLogin: {
            // ATTRIBUTES:
            default: null,        // The default value will be used only when the component attaching
                                  // to a node for the first time
            type: cc.Button, // optional, default is typeof default            
        },
        lblPlayer: {            
            default: null,                                  
            type: cc.Label
        },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onGoogleLogin(){
        var that = this;
        if(gapi){
            gapi.auth2.getAuthInstance().signIn().then(
                function(success) {
                    // Login API call is successful	
                    that.getProfile();
                },
                function(error) {
                    // Error occurred
                    // console.log(error) to find the reason
                    console.log(error);
                }
            );
        }
    },

    getProfile(){
        var that = this;
        // API call to get user profile information
        gapi.client.request({ path: 'https://www.googleapis.com/plus/v1/people/me' }).then(
            function(success) {
                // API call is successful

                var user_info = JSON.parse(success.body);
                that.lblPlayer.string = user_info.displayName;
                // user profile information
                console.log(user_info);
            },
            function(error) {
                // Error occurred
                // console.log(error) to find the reason
            }
        );
    },

    onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    },

    onFailure(error) {
        console.log(error);
    },
  
    // onLoad () {},

    start () {
        if(gapi){                    
            var isSigned = gapi.auth2.getAuthInstance().isSignedIn.get();
            if(isSigned){
                this.btnLogin.node.active = false;
                this.getProfile();
            } else{
                this.btnLogin.node.active = true;
            }
        } else{
            this.btnLogin.node.active = true;
            this.btnLogin.interactable = false;
        }
    },

    // update (dt) {},
});
