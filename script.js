let canvas, ctx, w, h, moon, stars = [], meteors = [];
let fireworks = [],
		particles = [],
		circles = [];
let fireworksMax = 50;
let fireworksChance = 0.2;
let hue = 0;

function init() {
	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext("2d");
	resizeReset();
	moon = new Moon();
	for (let a = 0; a < w * h * 0.0001; a++) {
		stars.push(new Star());
	}
	for (let b = 0; b < 2; b++) {
		meteors.push(new Meteor());
	}
	animationLoop();
}

function resizeReset() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
	ctx.fillStyle = "linear-gradient(0deg, rgba(13, 35, 93, 1) 0%, rgba(9, 5, 8, 1) 70%)";
	ctx.fillRect(0, 0, w, h);
}

function animationLoop() {
	ctx.clearRect(0, 0, w, h);
	drawScene();
	requestAnimationFrame(animationLoop);
}

function drawScene() {
	moon.draw();
	stars.map((star) => {
		star.update();
		star.draw();
	});
	meteors.map((meteor) => {
		meteor.update();
		meteor.draw();
	});
	fireworks.map((firework) => {
		firework.update();
		firework.draw();
	});
	particles.map((particle) => {
		particle.update();
		particle.draw();
	});
	circles.map((circle) => {
		circle.update();
		circle.draw();
	});
}


class Moon {
	constructor() {
		this.x = 150;
		this.y = 150;
		this.size = 100;
	}
	draw() {
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.shadowColor = "rgba(254, 247, 144, .7)";
		ctx.shadowBlur = 70;
		ctx.fillStyle = "rgba(254, 247, 144, 1)";
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
}

class Star {
	constructor() {
		this.x = Math.random() * w;
		this.y = Math.random() * h - 225;
		this.size = Math.random() + 0.5;
		this.blinkChance = 0.0055;
		this.alpha = 1;
		this.alphaChange = 0;
	}
	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
		ctx.fill();
		ctx.closePath();
	}
	update() {
		if (this.alphaChange === 0 && Math.random() < this.blinkChance) {
			this.alphaChange = -1;
		} else if (this.alphaChange !== 0) {
			this.alpha += this.alphaChange * 0.05;
			if (this.alpha <= 0) {
				this.alphaChange = 1;
			} else if (this.alpha >= 1) {
				this.alphaChange = 0;
			}
		}
	}
}

class Meteor {
	constructor() {
		this.reset();
	}
	reset() {
		this.x = Math.random() * w + 300; 
		this.y = -100;
		this.size = Math.random() * 2 + 0.5;
		this.speed = (Math.random() + 0.5) * 15;
	}
	draw() {
		ctx.save();
		ctx.strokeStyle = "rgba(255, 255, 255, .1)";
		ctx.lineCap = "round";
		ctx.shadowColor = "rgba(255, 255, 255, 1)";
		ctx.shadowBlur = 10;
		for (let i = 0; i < 10; i++) {
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineWidth = this.size;
			ctx.lineTo(this.x + 10 * (i + 1), this.y - 10 * (i + 1));
			ctx.stroke();
			ctx.closePath();
		}
		ctx.restore();
	}
	update() {
		this.x -= this.speed;
		this.y += this.speed;
		if (this.y >= h + 100) {
			this.reset();
		}
	}
}



function animationLoop() {
	if (fireworks.length < fireworksMax && Math.random() < fireworksChance) {
		fireworks.push(new Firework());
		hue += 10;
	}
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(0, 0, 0, .1)";
	ctx.fillRect(0, 0, w, h);
	ctx.globalCompositeOperation = "lighter";

	drawScene();
	arrayCleanup();
	requestAnimationFrame(animationLoop);
}


function arrayCleanup() {
	let dump1 = [], dump2 = [], dump3 = [];

	fireworks.map((firework) => {
		if (firework.alpha > 0) {
			dump1.push(firework);
		} else {
			createFireworks(firework.x, firework.y, firework.hue);
		}
	});
	fireworks = dump1;

	particles.map((particle) => {
		if (particle.size > 0) dump2.push(particle);
	});
	particles = dump2;

	circles.map((circle) => {
		if (circle.size < circle.endSize) dump3.push(circle);
	});
	circles = dump3;
}

function createFireworks(x, y, hue) {
	for (let i = 0; i < 10; i++) {
		particles.push(new Particle(x, y, hue, i));
	}
	circles.push(new Circle(x, y, hue));
}

function getRandomInt(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

function easeOutQuart(x) {
	return 1 - Math.pow(1 - x, 4);
}

class Firework {
	constructor() {
		this.x = getRandomInt(w * 0.3, w * 0.7);
		this.y = h;
		this.targetY = getRandomInt(h * 0.2, h * 0.4);
		this.hue = hue;
		this.alpha = 1;
		this.tick = 0;
		this.ttl = getRandomInt(120, 180);
	}
	draw() {
		if (this.tick <= this.ttl) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
			ctx.fill();
			ctx.closePath();
		}
	}
	update() {
		let progress = 1 - (this.ttl - this.tick) / this.ttl;

		this.y = h - (h - this.targetY) * easeOutQuart(progress);
		this.alpha = 1 - easeOutQuart(progress);

		this.tick++;
	}
}

class Particle {
	constructor(x, y, hue, i) {
		this.x = x;
		this.y = y;
		this.hue = hue;
		this.size = getRandomInt(2, 3);
		this.speed = getRandomInt(30, 40) / 10;
		this.angle = getRandomInt(0, 36) + 36 * i;
	}
	draw() {
		if (this.size > 0) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, 1)`;
			ctx.fill();
			ctx.closePath();
		}
	}
	update() {
		this.radian = (Math.PI / 180) * this.angle;
		this.x += this.speed * Math.sin(this.radian);
		this.y += this.speed * Math.cos(this.radian);
		this.size -= 0.05;
	}
}

class Circle {
	constructor(x, y, hue) {
		this.x = x;
		this.y = y;
		this.hue = hue;
		this.size = 0;
		this.endSize = getRandomInt(100, 130);
	}
	draw() {
		if (this.size < this.endSize) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, .2)`;
			ctx.fill();
			ctx.closePath();
		}
	}
	update() {
		this.size += 15;
	}
}




window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", resizeReset);


