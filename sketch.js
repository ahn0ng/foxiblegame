
ImageList = Class.create();

ImageList.prototype = {
	
	object : null,
	image : null,
	
	size : [ undefined, undefined ],
	
	initialize : function(src, width, height) {
		
		this.size = [ width, height ];
		
		this.object = document.createElement("div");
		this.image = document.createElement("img");
		
		this.object.appendChild(this.image);
		this.image.src = src;
		this.image.border = 0;

		with (this.object.style) {
			width = this.size[0] + "px";
			height = this.size[1] + "px";
			
			overflow = "hidden";
		}
	},
	
	showImage : function(image_num) {
		this.image.style.marginLeft = "-" + (image_num * this.size[0]) + "px";
	}
}

function star(_game) {

	
	var game;
	
	
	var img;
	

	var pos = [ undefined, undefined ];
	

	var timer;
	var timeout;
	

	var index;
	
	this.initialize = function(_game) {
		
		game = _game;
		img = new ImageList("images/star.gif", 22, 17);
		
		img.object.style.position = "absolute";
		game.screen.appendChild(img.object);
		
		img.object.style.top = "-17px";
	};
	
	this.setPosition = function(x, y) {
		
		pos[0] = x;
		img.object.style.left = pos[0] + "px";

		pos[1] = y;
		img.object.style.top = (pos[1] - 17) + "px";
	};
	
	this.ready = function() {
		
		var x = parseInt(Math.random() * (game.size[0] - 22));
		
		img.showImage(0);
		this.setPosition(x, 0);
		
		index = 0;
	};
	
	this.start = function(delay) {
		
		var self = this;
		
		this.ready();
		
		if (timer) window.clearInterval(timer);
		timer = null;
		
		if (timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(function() {

			if (timer) window.clearInterval(timer);
			timer = window.setInterval(self.drop.bind(self), 50);
			
			timeout = null;
			
		}, delay);
	};
	
	this.drop = function() {
		
		if (index < 0) {
			
			if (index > -3) // 바닥에 떨어져도 어느정도까지는 충돌체크
				if (game.playing && game.fox.collision(pos[0] + 22 / 2)) // 충돌했으면
					game.gameOver();
			
			switch (index--) {
			case -1: case -2:
				img.showImage(1);
				break;
				
			case -3: case -4:
				img.showImage(2);
				break;
			
			case -5:
				this.start(Math.random() * 1000);
			}

			return;
		}
		
		var incr = index++;
		if (incr > 20) incr = 20; 
		
		pos[1] += incr;
		
		var screen_height = game.size[1];
		
	
		if (pos[1] >= screen_height) {
			if (game.playing) game.addScore(1);
			pos[1] = screen_height;
			index = -1;
		}
		
		this.setPosition(pos[0], pos[1]);

	
		if (pos[1] >= screen_height - 25 && game.playing) {
			if (game.playing && game.fox.collision(pos[0] + 22 / 2))
				game.gameOver();
		}
	};
	
	this.initialize(_game);
}

function fox(_game) {
	

	var game;
	

	var img;
	

	var posx = undefined;
	
	
	var timer;
	
	
	var slip = 1.0;
	

	var dir;
	

	var action = 0;
	
	
	var speed = 0;
	
	var step = 1.5;
	var max_speed = 30;
	
	this.initialize = function(_game) {
		
		game = _game;
		
		img = new ImageList("images/fox.gif", 30, 30);
		
		img.object.style.position = "absolute";
		img.object.style.top = "-25px";
		
		game.screen.appendChild(img.object);
	};
	
	this.collision = function(star_x) {
		return (Math.abs(star_x - (posx + 18 / 2)) < 17);
	};
	
	this.setLeft = function(x) {
		img.object.style.left = (posx = x) + "px";
	};
	
	this.spawn = function() {

		this.breath();
		if (timer) window.clearInterval(timer);
		timer = window.setInterval(this.breath.bind(this), 75);

		action = 0;
		speed = 0;
		
		img.object.style.top = (game.size[1] - 25) + "px";
		
		img.showImage(4);

		this.setLeft(parseInt((game.size[0] - 18) / 2));
		this.run(null);
	};
	
	this.kill = function() {
		
		if (timer) window.clearInterval(timer);
		timer = null;

		img.showImage(3);
		this.run(null);
	};
	
	this.breath = function() {
		img.showImage(4 + action);
		action = ++action % 2;
	}
	
	this.run = function(_dir) {
		dir = _dir;
		
		if (dir) { 
			
			this.move(); 
			if (timer) window.clearInterval(timer);
			timer = window.setInterval(this.move.bind(this), 50);
			
			
		} else { 
			
			if (game.playing) img.showImage(4);
		
		}
	};
	
	this.move = function() {
		
		if (!dir) { 
			
			var mul = 0.5;
			
			if (Math.abs(speed) > 10) 
				mul = 1.5;
				
			mul *= slip;
			
			if (speed == 0) {

				this.breath();
				if (timer) window.clearInterval(timer);
				timer = window.setInterval(this.breath.bind(this), 75);
				
				return;
			} else if (speed > 0) {
				speed -= step * mul;
				if (speed < 0) speed = 0;
			} else {
				speed += step * mul;
				if (speed > 0) speed = 0;
			}
			
			action = 0;
			
		} else { 
			
			speed += (dir == Event.KEY_LEFT ? -step : step);
			img.showImage((dir == Event.KEY_LEFT ? 0 : 6) + action);
			
			action = ++action % 3;

		}
		
		
		if (speed < -max_speed) speed = -max_speed;
		else if (speed > max_speed) speed = max_speed;
		
		posx = parseInt(posx) + speed;
		
		if (posx > game.size[0] - 18) { 
			posx = game.size[0] - 18
			speed = 0;
		} else if (posx < 0) { 
			posx = 0;
			speed = 0;
		}
		
		this.setLeft(posx);
	}
	
	this.initialize(_game);
}

starGame = Class.create();

starGame.prototype = {
	

	screen : null,
	

	size : [ undefined, undefined ],
	

	stars : [ ],
	fox : null,
	

	left : false,
	

	right : false,
	

	recent : null,
	

	playing : false,
	

	score : null,
	

	message : null,
	msgtimer : null,
	
	initialize : function(screen, number_of_star, score) {
		this.screen = $(screen);
		this.score = $(score);
		
		Element.makePositioned(this.screen);
		
		with (this.screen.style) {
			overflow = "hidden";
			cursor = "default";;
		}
		
		for (var i = 0; i < number_of_star; i++)
			this.stars.push(new star(this));
		
		this.fox = new fox(this);
		
		Event.observe(this.screen, "keydown", this.onKeyDown.bindAsEventListener(this));
		Event.observe(this.screen, "keyup", this.onKeyUp.bindAsEventListener(this));
		
		this.size = [ this.screen.clientWidth, this.screen.clientHeight ];
		
		this.message = document.createElement("div");
		with (this.message.style) {
			position = "absolute";
			textAlign = "center";

			fontSize = "20px";
			fontFamily = "Tahoma";
		}
		
		this.screen.appendChild(this.message);
		
		this.gameReady();
	},
	
	addScore : function(value) {
		if (this.score) this.score.value = parseInt(this.score.value) + value;
	},
	
	showMessage : function(msg, autohide, func) {

		var size;
		
		if (this.msgtimer) window.clearTimeout(this.msgtimer);
		this.msgtimer = null;
		
		this.message.innerHTML = msg;
		size = [ this.message.offsetWidth, this.message.offsetHeight ];
		
		this.message.style.left = (this.size[0] - size[0]) / 2 + "px";
		this.message.style.top = (this.size[1] - size[1]) / 2 + "px";
		this.message.style.visibility = "visible";
		
		if (autohide) {
			this.msgtimer = window.setTimeout(function() {
				
				this.message.style.visibility = "hidden";
				this.msgtimer = null;
				
				if (func) func();
			}.bind(this), autohide);
		}
	},
	
	gameReady : function() {
		
		this.showMessage(
			'<div style="font-size:1.5em;">FOXIBLE</div>' +
			'<div style="font-size:0.5em; padding:20px 0px;">HIT [SPACE] KEY</div>' 
		);
	},
	
	gameStart : function() {

		this.size = [ this.screen.clientWidth, this.screen.clientHeight ];
		
		for (var i = 0; i < this.stars.length; i++)
			this.stars[i].start(Math.random() * 3000);
		
		this.playing = true;
		this.recent = null;
		this.left = false
		this.right = false;
		
		if (this.score) this.score.value = "0";
		
		this.fox.spawn();
		this.showMessage("READY?", 1500);
	},
	
	gameOver : function() {

		this.playing = false;
		this.recent = null;
		
		this.fox.kill();
		this.showMessage("DEAD", 1500, this.gameReady.bind(this));
	},
	
	onKeyDown : function(e) {
		
		if (e.keyCode == 32 && !this.playing) {
			this.gameStart();
			return;
		}
		
		if (!this.playing) return;
		if (e.keyCode != Event.KEY_LEFT && e.keyCode != Event.KEY_RIGHT) return;

		this.recent = e.keyCode;
		
		switch (e.keyCode) {
		case Event.KEY_LEFT:
			this.left = true;
			break;
			
		case Event.KEY_RIGHT:
			this.right = true;
			break;
		}
		
		this.fox.run(this.recent);
		
		Event.stop(e);
	},
	
	onKeyUp : function(e) {
		
		if (!this.playing) return;
		if (e.keyCode != Event.KEY_LEFT && e.keyCode != Event.KEY_RIGHT) return;
		
		switch (e.keyCode) {
		case Event.KEY_LEFT:
			this.left = false;
			break;
			
		case Event.KEY_RIGHT:
			this.right = false;
			break;
		}
		
		this.recent = null;
		
		if (this.left) this.recent = Event.KEY_LEFT;
		else if (this.right) this.recent = Event.KEY_RIGHT;
		
		this.fox.run(this.recent);
	}
};
