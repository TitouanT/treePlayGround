let tree, bg, tab;
function setup () {
	let i;
	let canvas = createCanvas (1000, 600);
	canvas.parent('p5sketch');
	bg = color('#7e8f7c');
	background(bg);

	// tab = [62, 77, 19, 84, 25, 86, 98, 52, 93, 12];
	newRandomTab();
	// noLoop();
}

function draw () {
	background(bg);
	tree.update();
	tree.show();
}

function newRandomTab () {
	tree = new Tree ();

	if (floor(random(100)) < 75) tree.random();
	else tree.perfect(6);

	tab = tree.toTab();
	tree.calcPos();
}




let i = 0;
function mousePressed () {
	// let node = tree.search(tab[i]);
	// i++;
	// if (node === null) {
	// 	newRandomTab();
	// 	i = 0;
	// 	redraw();
	// 	return;
	// }
	// node.showed = true;
	// node.bg = 0;
	// redraw ();
	// node.bg = bg;
	newRandomTab();
}

let Tree = function () {
	this.root = null;

	this.update  = function () {
		if (this.root !== null) this.root.update();
	}

	this.random = function (n) {
		let i;
		for (i = 0; i < 20; i++) this.addValue (floor(random(100)));
	}

	this.fromTab = function (tab) {
		let i;
		for (i = 0; i < tab.length; i++) this.addValue (tab[i]);
	}

	this.toTab = function () {
		let tab = [];
		if (this.root != null) this.root.toTab(tab);
		return tab;
	}

	this.perfect = function (n) {

		let tab = [], p = 2**(n-1);
		tab[0] = p;
		tab[2**n - 2] = 0;
		for (let i = 0; tab[i] != 1; i++) {
			if (tab[i] == p) p /= 2;
			tab[2 * i + 1] = tab[i] - p;
			tab[2 * i + 2] = tab[i] + p;
		}
		this.fromTab (tab);
	}

	this.show = function () {
		if (this.root === null) return;
		this.root.show();
	}

	this.calcPos = function () {
		if (this.root === null) return;
		let dy = height / this.root.readHeight();
		let dx = -width / 2;
		let xf = width;
		let yf = -dy/2
		this.root.calcPos(xf, yf, dx, dy);
	}

	this.addValue = function (value) {
		let node = new Node (value);
		if (this.root === null) this.root = node;
		else this.root.addNode (node);
	}

	this.height = function () {
		if (this.root === null) return 0;
		else return this.root.readHeight();
	}

	this.infixe = function () {
		if (this.root !== null) this.root.infixe();
	}

	this.search = function (value) {
		if (this.root === null) return null;
		else return this.root.search(value);
	}

	this.contain = function (value) {
		return this.search(value) !== null;
	}
}

let Queue = function () {
	this.q = [];
	this.isEmpty = function () {
		return this.q.length >= 0;
	}

	this.pop = function () {
		let val = this.q.shift()
		if (val === undefined) return null;
		return val;
	}

	this.push = function (n) {
		return this.q.push(n);
	}
}

let Node = function (value) {
	let height = 1;
	let step = 2;
	let current = 0;
	let notMoving = false;
	let default_bg = color('#3b3738');
	let moving_bg = color('#c63d0f');

	this.left = null;
	this.right = null;
	this.value = value;

	this.x = -1;
	this.y = -1;
	this.target_x = -1;
	this.target_y = -1;
	this.from_x = -1;
	this.from_y = -1;
	this.final_x = -1;
	this.final_y = -1;

	this.radius = 25;
	this.bg = default_bg;
	this.showed = true;
	this.queue = new Queue();

	this.toTab = function (tab) {
		tab.push(this.value);
		if (this.left != null) this.left.toTab(tab);
		if (this.right != null) this.right.toTab(tab);
	}

	this.rot_left = function () {
		return;
	}

	this.update = function () {
		if (!this.showed) return;

		if (!notMoving) {

			if (this.x === -1) {// if the node have never been displayed yet
				let node = this.queue.pop();
				if (node === null) {
					this.x = this.final_x;
					this.y = this.final_y;
					notMoving = true;
				}
				else {
					this.x = node.x;
					this.y = node.y;
					this.from_x = node.x;
					this.from_y = node.y;
					current = 100;
				}
				if (this.left !== null) this.left.update();
				if (this.right !== null) this.right.update();
				return;
			}

			if (current === 100) { // if the node reached the target
				let node = this.queue.pop();
				if (node === null) {
					this.x = this.final_x;
					this.y = this.final_y;
					notMoving = true;
					if (this.left !== null) this.left.update();
					if (this.right !== null) this.right.update();
					return;
				}
				this.from_x = this.x;
				this.from_y = this.y;
				if (this.queue.isEmpty()) {
					this.target_x = node.final_x;
					this.target_y = node.final_y;
				}
				else {
					this.target_x = node.x;
					this.target_y = node.y;
				}
				current = 0;
			}

			current += step;
			this.x = this.from_x + ((this.target_x - this.from_x) * current) / 100;
			this.y = this.from_y + ((this.target_y - this.from_y) * current) / 100;
		}

		if (this.left !== null) this.left.update();
		if (this.right !== null) this.right.update();

	}

	this.show = function () {
		if (!this.showed) return;
		if (this.left !== null && this.left.showed) {
			stroke (default_bg);
			line (this.x, this.y, this.left.x, this.left.y);
			this.left.show();
		}
		if (this.right !== null && this.right.showed) {
			stroke (default_bg);
			line (this.x, this.y, this.right.x, this.right.y);
			this.right.show();
		}
		fill(notMoving ? default_bg : moving_bg);
		noStroke();
		ellipse (this.x, this.y, this.radius, this.radius);
		fill(255);
		textAlign(CENTER);
		text(this.value, this.x, this.y);
	}

	this.calcPos = function (xf, yf, dx, dy) {
		let x = xf + dx, y = yf + dy;
		dx = abs(dx);
		this.final_x = x;
		this.final_y = y;
		if (this.left !== null) this.left.calcPos (x, y, -dx/2, dy);
		if (this.right !== null) this.right.calcPos (x, y, dx/2, dy);
	}

	this.readHeight = function () {
		return height;
	}
	this.updateHeight = function () {
		let hLeft, hRight;
		if (this.left === null) hLeft = 0;
		else hLeft = this.left.readHeight();

		if (this.right === null) hRight = 0;
		else hRight = this.right.readHeight();

		height =  1 + max (hLeft, hRight);
	}

	this.search = function (value) {
		if (value == this.value) return this;
		else if (value < this.value) {
			if (this.left !== null) return this.left.search (value);
		}
		else {
			if (this.right !== null) return this.right.search (value);
		}
		return null;
	}

	this.infixe = function () {
		if (this.left !== null) this.left.infixe();
		console.log(this.value);
		if (this.right !== null) this.right.infixe();
	}

	this.addNode = function (node) {

		if (node.value === this.value) return false;
		else {
			node.queue.push(this);
			if (node.value < this.value) {
				if (this.left === null) {
					this.left = node;
					node.queue.push(node);
				}
				else if (!this.left.addNode (node)) return false;
			}
			else {
				if (this.right === null) {
					this.right = node;
					node.queue.push(node);
				}
				else if (!this.right.addNode (node)) return false;
			}
		}
		this.updateHeight();
		return true;
	}
}