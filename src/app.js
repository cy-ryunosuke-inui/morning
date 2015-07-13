
// HelloWorldSceneクラス定義的なもの
// HelloWorldSceneはアプリ起動されたらすぐ呼ばれる
var HelloWorldScene = cc.Scene.extend({

    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);

        cc.log("onEnter!!");

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event) {
                cc.log("HelloWorldLayerをtoucheしたよ！");
                var scene = new NextScene();
                //cc.director.runScene(scene);
                var transition = new cc.TransitionFade(0.5, scene);
                cc.director.runScene(transition);
                return true;
            },
        }, layer);
    }

});

var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {

        this._super();

        var mainscene = ccs.load(res.MainScene_json);
        this.addChild(mainscene.node);

        return true;
    }
});

// NextSceneクラス定義
var NextScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        cc.log("画面遷移したよ！NextScene！");

        var nextscene = ccs.load(res.NextScene_json);
        this.addChild(nextscene.node);
        this.nextscene = nextscene;
        nextscene.node.getChildByName("Button_2").addTouchEventListener(this.onClickButton,this);
        nextscene.node.getChildByName("Button_2_0").addTouchEventListener(this.onClickButton,this);
        nextscene.node.getChildByName("Button_2_0_0").addTouchEventListener(this.onClickButton,this);
        nextscene.node.getChildByName("Button_2_0_0_0").addTouchEventListener(this.onClickButton,this);
    },

    onClickButton: function(button,type){

        if(button.name=="Button_2_0_0_0"){
            var scene = new GameScene();
            //cc.director.runScene(scene);
            var transition = new cc.TransitionFade(0.5, scene);
            cc.director.runScene(transition);
            return;
        }

        button.setBright(false);

        if(button.name=="Button_2"){
            this.nextscene.node.getChildByName("Button_2_0").setBright(true);
            this.nextscene.node.getChildByName("Button_2_0_0").setBright(true);
        }else if(button.name=="Button_2_0"){
            this.nextscene.node.getChildByName("Button_2").setBright(true);
            this.nextscene.node.getChildByName("Button_2_0_0").setBright(true);
        }else if(button.name=="Button_2_0_0"){
            this.nextscene.node.getChildByName("Button_2").setBright(true);
            this.nextscene.node.getChildByName("Button_2_0").setBright(true);
        }

    }

});

var GameScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new MainGameLayer();
        this.addChild(layer);
    }
});

var MainGameLayer = cc.Layer.extend({
    sprite:null,
    titleNode:null,
    count:5,
    textField:null,
    currentChatPositionY: 937.79,
    chatYouPositionX: 1.77,
    chatMePositionX: 45.44,
    currentTimeUpCount: 20,
    isEnd: false,
    timeUpBg:null,
    countDownNode:null,
    // コンストラクタ
    ctor:function () {
        this._super();
        var winSize = cc.director.getWinSize();

        // Cocos Studioで作成したレイアウトファイルをロード
        var gamescene = ccs.load(res.GameScene_json);
        this.addChild(gamescene.node);

        // チャット入力用TextField
        this.textField = gamescene.node.getChildByName("TextField_1");

        // チャット送信用ボタンにイベントを入れる
        var sendBtn = gamescene.node.getChildByName("Button_1");
        sendBtn.addTouchEventListener(this.onClickSendButton,this);

        // タイムアップ用の背景を保持しておく
        this.timeUpBg = gamescene.node.getChildByName("timeup_bg_41");

        // お題を表示するSprite
        this.titleNode = ccs.load(res.TitleNode_json);
        this.titleNode.node.x = 160.14;
        this.titleNode.node.y = 360.64;
        this.addChild(this.titleNode.node);
        this.titleNode.node.setOpacity(0);
        var act1 = cc.MoveBy.create(0.5, cc.p(0 , 100));
        var act2 = cc.fadeIn(0.5);
        var spawn = cc.spawn( act1, act2 );
        this.titleNode.node.runAction( cc.EaseOut.create(spawn, 2) );
        // 毎秒実行
        this.schedule(this.titleNodeFunc, 1);

        // タイムアップ用のスケジュール
        this.schedule(this.timeUpStartFunc, 15);

        return true;
    },
    // お題を表示するSprinteのカウントダウンとその後消える奴（毎秒実行）
    titleNodeFunc: function(){
        this.count--;
        //cc.log("func call");
        var text = this.titleNode.node.getChildByName("Text_6");

        if(this.count == 0){
            var act1 = cc.fadeOut(1.0);
            var act2 = cc.MoveBy.create(1.0, cc.p(0 , 100));
            var spawn = cc.spawn( act1, act2 );
            this.titleNode.node.runAction( cc.EaseOut.create(spawn, 2) );
        }
        if(this.count == -1){
            this.removeChild(this.titleNode.node);
            //cc.log("func stop");
            this.unschedule(this.titleNodeFunc);
            // 10秒に一度実行
            this.schedule(this.dummyChatDisp, 10);
            return;
        }

        if(this.count<1){
            text.setString( " Start!" );
        }else{
            text.setString( "    "+this.count+"    " );
        }

    },
    onClickSendButton: function(button,type){
        if (type != 2){
            return true;
        }
        cc.log("onClickSendButton!!");
        this.meChatDisp();

        return true;
    },
    dummyChatDisp: function(){
        //cc.log("dummyChatDisp call");

        if(this.isEnd){ return; }

        if( this.currentChatPositionY < 200 ){
            //this.unschedule(this.dummyChatDisp);
            //return;
        }
        // 相手のチャット表示するSprite
        var chatNode = ccs.load(res.ChatNodeYou_json);
        chatNode.node.x = this.chatYouPositionX;
        chatNode.node.y = this.currentChatPositionY;

        // ランダムでメッセージを表示
        var rand =  parseInt(Math.random()*100) % 5; // 0〜4までの乱数
        var message = "";
        switch(rand){
            case 0:
                message = "こんにちは";
                break;
            case 1:
                message = "どうもどうも";
                break;
            case 2:
                message = "ハローキティです";
                break;
            case 3:
                message = "元気ですか";
                break;
            case 4:
                message = "おやすみなさい";
        }
        var textField = chatNode.node.getChildByName("TextField_1");
        textField.setString( message );
        this.addChild(chatNode.node);

        this.currentChatPositionY -= 150;
    },
    meChatDisp: function(){
        //cc.log("meChatDisp call");

        if(this.isEnd){ return; }

        if( this.currentChatPositionY < 200 ){
            //return;
        }
        if( this.textField.getString().length == 0 ){
            //cc.log( "no input message..." );
            return;
        }
        //cc.log( this.textField.getString() );

        // 自分のチャット表示するSprite
        var chatNode = ccs.load(res.ChatNodeMe_json);
        chatNode.node.x = this.chatMePositionX;
        chatNode.node.y = this.currentChatPositionY;

        // 入力したメッセージをセット
        var textField = chatNode.node.getChildByName("TextField_1");
         textField.setString( this.textField.getString() );
        // クリア
        this.textField.setString("");

        this.addChild(chatNode.node);

        this.currentChatPositionY -= 150;
    },
    timeUpStartFunc: function(){
        this.unschedule(this.timeUpStartFunc);
        // 10秒に一度実行
        this.schedule(this.timeUpCountdownFunc, 1);
    },
    timeUpCountdownFunc: function(){
        this.currentTimeUpCount--;

        if( this.currentTimeUpCount == 5 ){
            // カウントダウンを表示するSprite
            this.countDownNode = ccs.load(res.CountDownNode_json);
            this.countDownNode.node.x = 332.17;
            this.countDownNode.node.y = 480.38;
            this.addChild(this.countDownNode.node, 10);
        }
        if( this.currentTimeUpCount < 5 ){
            var textLabel = this.countDownNode.node.getChildByName("Text_1");
            textLabel.setString( this.currentTimeUpCount );
        }
        this.timeUpBg.setOpacity( this.timeUpBg.getOpacity()+5 );
        if( this.currentTimeUpCount == 0 ){
            this.unschedule(this.timeUpCountdownFunc);
            this.isEnd = true;
            // 獲得ポイント表示
            this.textField.setString("獲得ポイント 1000P");
        }

    },

});


