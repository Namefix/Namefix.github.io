const canvas = document.querySelector("canvas");
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreHUD = document.querySelector("#scoreHUD");
const startGameUI = document.querySelector("#startGameUI");
const menuPopup = document.querySelector("#menuPopup");
const bigScore = document.querySelector("#bigScore");

class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}
	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
	update() {
		this.draw();
		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
	update() {
		this.draw();
		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}
}

const friction = 0.99;
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}
	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}
	update() {
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		this.alpha -= 0.01;
	}
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'rgba(255,255,255,1)');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
	player = new Player(x, y, 10, 'rgba(255,255,255,1)');
	projectiles = [];
	enemies = [];
	particles = [];
	score = 0;
	scoreHUD.innerHTML = 0;
	bigScore.innerHTML = 0;
}

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 6) + 6;

		let x;
		let y;

		if(Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() * 0.5 ? 0 - radius : canvas.height + radius;
		}
		const color = "hsl("+Math.random()*360+",50%,50%)";
		const angle = Math.atan2(player.y - y,player.x - x);
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}

		enemies.push(new Enemy(x,y,radius,color,velocity));
	}, 1000);
}

let animationId;
let score = 0;
function animate() {
	animationId = requestAnimationFrame(animate);
	c.fillStyle = 'rgba(0,0,0,0.1)';
	c.fillRect(0,0,canvas.width,canvas.height);
	player.draw();
	particles.forEach((particle, index) => {
		if(particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
	});
	projectiles.forEach((projectile, index) => {
		projectile.update();

		if(projectile.x + projectile.radius < 0 || 
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height 
			) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			}, 0);
		}
	});

	enemies.forEach((enemy, index) => {
		enemy.update();

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		if(dist - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
			menuPopup.style.display = "flex";
			bigScore.innerHTML = score;
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);


			if(dist - enemy.radius - projectile.radius < 1) {
				for (let i = 0; i < enemy.radius*2; i++) {
					particles.push(new Particle(enemy.x, enemy.y, Math.random()*2, enemy.color, {x: (Math.random()-0.5) * (Math.random()*4), y: (Math.random()-0.5) * (Math.random()*4)}))
				}
				if(enemy.radius - 10 > 10) {
					score += 100;
					scoreHUD.innerHTML = score;
					gsap.to(enemy, {
						radius: enemy.radius - 10
					});
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1);
					}, 0);
				} else {
					score += 250;
					scoreHUD.innerHTML = score;
					setTimeout(() => {
						enemies.splice(index, 1);
						projectiles.splice(projectileIndex, 1);
					}, 0);
				}	
			}
		});
	})
}

addEventListener("click", (event) => {
	const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
	const velocity = {
		x: Math.cos(angle) *5,
		y: Math.sin(angle) *5
	}

	projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'rgba(255,255,255,1)', velocity));
});

startGameUI.addEventListener("click", () => {
	init();
	animate();
	spawnEnemies();

	menuPopup.style.display = "none";
});

