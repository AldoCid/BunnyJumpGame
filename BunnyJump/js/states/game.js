function Game(){
	this.cursors = game.input.keyboard.createCursorKeys();
	this.spaceBarKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.playerManager = new PlayerManager(game);
	this.gameUtility = new Utility(game);

}
	Game.prototype = {
	create:function(){

		this.initConfig();

		this.gameUtility.createBackGround();
	
		this.createGroups();

		this.playerManager.createPlayer();

		this.gameUtility.createVisualControls();
		this.gameUtility.visualControlsFunctions(this.playerManager);

		this.initPlatform();


		game.delayGeradorPlataforma = 1800;

		this.gameUtility.showScore();
		this.gameUtility.pauseButton();
		this.showSpeed();

		this.soundsConfig();

		
	},
	update : function(){
		this.platformGenerator();
		//Colisão de player com plataformas
		game.physics.arcade.collide(this.playerManager.player,game.normalTileGroup);
		game.physics.arcade.collide(this.playerManager.player,game.brokenTileGroup,this.collisionCallBack);

		if(this.playerManager.player.body.position.y >= game.world.height + this.playerManager.player.body.height + 5){
			this.gameOver();
		}

		if((this.spaceBarKey.isDown || this.game.jumpButton.isDown) && this.playerManager.player.body.wasTouching.down){
			this.playerManager.jump();
		}
		if(this.cursors.left.isDown || this.game.leftButton.isDown){
			this.playerManager.goLeft();
		}else if(this.cursors.right.isDown || this.game.rightButton.isDown){
			this.playerManager.goRight();
		}else{
			this.playerManager.stop();
		}
		
		game.itemsSpeed += 0.05;
		game.labelVelocidade.text = game.itemsSpeed;
		game.physics.arcade.overlap(this.playerManager.player,game.carrots,this.collectCarrot,null,this);
		
	},

	initConfig:function(){

		
		//Tamanho dos tiles
		game.tileWidth = game.cache.getImage('normalTile').width;
		game.tileHeight = game.cache.getImage('normalTile').height;

		//Física
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.tempoInicio = game.time.now;


	
		game.spacing = 3.8*game.tileHeight;


		game.itemsSpeed = 150.0;
		game.score = 0;

	},

    createGroups:function(){

	 	game.normalTileGroup = game.add.group();
		game.normalTileGroup.enableBody = true;

		game.brokenTileGroup = game.add.group();
		game.brokenTileGroup.enableBody = true;



		game.carrots = game.add.group();
		game.carrots.enableBody = true;

 	},


 	soundsConfig:function() {
 		game.hitCoinSound = game.add.audio('hitCoin');
 	},


	addTile:function(x,y,immovable){
		var tile;
		if(immovable){
		 tile = game.normalTileGroup.create(x,y,'normalTile');
		}else{
		 tile = game.brokenTileGroup.create(x,y,'brokenTile');	
		}
		tile.body.velocity.y = game.itemsSpeed;
		tile.body.immovable = true;
		tile.body.allowGravity = true;

		tile.checkWorldBounds = true;
		tile.outOfBoundsKill = true;

	},




	addCarrot:function(x,y){
		var moeda = game.carrots.create(x,y,'carrot');
		moeda.scale.setTo(0.6);
		moeda.body.velocity.y = game.itemsSpeed;
		moeda.outOfBoundsKill = true;
	},

	addPlataform:function(y){
		if(typeof(y) == "undefined"){
			y = -game.tileHeight;
		}
		var tileNecessarios = Math.ceil(game.world.width / game.tileWidth);

		var passagem =  Math.floor(Math.random() * (tileNecessarios - 3)) + 1;

		for (var i = 0; i < tileNecessarios; i++) {
		 	if(i != passagem  && i%2 == 0 ){
		 		this.addTile(i * game.tileWidth,y,true);
		 	}else if(i != passagem ) {
		 		this.addTile(i * game.tileWidth,y,false);
		 	}else{
		 		this.addCarrot(i*game.tileWidth+(game.tileWidth/4),y);

		 	}
		 } 
	},

	initPlatform:function(){
		var base = game.world.height - game.tileHeight;
		var topo = game.tileHeight;

		var y = topo;
		while( y < base - game.tileHeight){
			this.addPlataform(y);
			y = y + game.spacing;
		}
	},

 	platformGenerator:function(){
		var tempoDecorrido = game.time.elapsedSince(game.tempoInicio);
		if(tempoDecorrido >= game.delayGeradorPlataforma ){
			var y = undefined;
			this.addPlataform(y);
			game.tempoInicio = game.time.now;
		}
	},
	

 	showSpeed:function(){
	//MÉTODO DE DEBUG
		var fonte = "25px Arial"
		game.labelVelocidade = game.add.text(5,5,"",{font:fonte,fill:"#0000"});

	},

	collectCarrot:function(player,carrot){
		carrot.kill();
		this.scorePt();
		this.updateDifficulty();
		game.hitCoinSound.play();
	},

	scorePt:function(){
		game.score += 1;
		game.scoreLabel.text = game.score;
	},

	updateDifficulty:function(){
		if(game.score % 3 == 0 && game.score <20 ){
			game.delayGeradorPlataforma -= 170;
			game.scoreAntigo = game.score;
		}
			this.updatePlayerSpeed();
	},

	 collisionCallBack:function(playerSprite,tileGroup){
		if(tileGroup.body.touching.up){
			tileGroup.body.immovable = false;
			tileGroup.body.allowGravity = true;
		}

	},
	updatePlayerSpeed:function(){
		game.velocidadePlayer += 15;
	},

	gameOver:function(){
		this.playerManager.player.kill();
		game.state.start("Game");
	}
}
