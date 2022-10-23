class SpaceshipController { //controls spaceship 
    constructor() {
      this._Init();
    }
  
    _Init() {
      //this._decceleration = new THREE.Vector3(-0.001, -1.0, -0.001);
	  this._decceleration = new THREE.Vector3(-5, -1.5, -5);
      this._acceleration = new THREE.Vector3(0.5, 50.0, 40.0);
      this._velocity = new THREE.Vector3(0, 0, 0);
	  this._position = new THREE.Vector3();	
      this._input = new keyboardListener();
  
      this._LoadModels();
    }
  
    _LoadModels() { //load spaceship gltf
      const loader = new THREE.GLTFLoader();
      loader.load('./gltf/spaceship/scene.gltf', (gltf) => {
        gltf = gltf.scene.children[0];
        gltf.scale.set(0.5,0.5,0.5);
		gltf.position.set(0, 0, -100);
		gltf.rotation.z = 1;
		this.spaceship=gltf;
		scene.add(gltf);
      }, undefined, function (error) {
        //console.error(error);      
      });
    }
    get Position() { 
	  return this._position;
	}
	
	get Rotation() { 
		if (!this.spaceship) {
			return new THREE.Quaternion();
		}
	  	return this.spaceship.quaternion;
	}

    Update(timeInSeconds) { // Update spaceship position
      if (!this.spaceship) {
        return;
      }
  
      var velocity = this._velocity;
      var frameDecceleration = new THREE.Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(timeInSeconds);
	  frameDecceleration.y = Math.sign(frameDecceleration.y) * Math.min(
		  Math.abs(frameDecceleration.y), Math.abs(velocity.y));
	  
	  frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
	  	  Math.abs(frameDecceleration.z), Math.abs(velocity.z));

	
  
      velocity.add(frameDecceleration);
  
      var controlObject = this.spaceship;
      var _Q = new THREE.Quaternion(); 		//Quarternion(angle,vertex)
      var _A = new THREE.Vector3();		//axis
      var _R = controlObject.quaternion.clone(); //result
  
      var acc = this._acceleration.clone();
      if (this._input._keys.shift) {
        acc.multiplyScalar(2.0);
      }
	  
      if (this._input._keys.forward) {
        velocity.y -= acc.y * timeInSeconds;
      }
      if (this._input._keys.backward) {
        velocity.y += acc.y * timeInSeconds;
      }
	  if (this._input._keys.up) {
		velocity.z +=acc.z * timeInSeconds;
	  }
	  if (this._input._keys.down) {
		velocity.z -=acc.z * timeInSeconds;
	  }
      if (this._input._keys.left) {
        _A.set(0, 0, 1);
        _Q.setFromAxisAngle(_A, 0.9 * Math.PI * timeInSeconds * this._acceleration.x);
        _R.multiply(_Q);
      }
      if (this._input._keys.right) {
        _A.set(0, 0, 1);
        _Q.setFromAxisAngle(_A, 0.9 * -Math.PI * timeInSeconds * this._acceleration.x);
        _R.multiply(_Q);
      }
  
      controlObject.quaternion.copy(_R);
  
      var oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      var forward = new THREE.Vector3(0, 1, 0);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      var sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();

	  var updown = new THREE.Vector3(0, 0, 1);
      updown.applyQuaternion(controlObject.quaternion);
	  
      updown.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.y * timeInSeconds);
	  updown.multiplyScalar(velocity.z * timeInSeconds);

	  controlObject.position.add(forward);
      controlObject.position.add(sideways);
      controlObject.position.add(updown);

	  
  
      oldPosition.copy(controlObject.position);
	  this._position.copy(controlObject.position);
  
	  //console.log(this.Position)
    }
};

class keyboardListener { // keyboard event listener
	constructor() {
		this._Init();    
	}

	_Init() {
		this._keys = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		space: false,
		shift: false,
		up: false,
		down: false
		};
		document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
		document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
	}

	_onKeyDown(event) {
		switch (event.keyCode) {
		case 87: // w
			this._keys.forward = true;
			break;
		case 65: // a
			this._keys.left = true;
			break;
		case 83: // s
			this._keys.backward = true;
			break;
		case 68: // d
			this._keys.right = true;
			break;
		case 32: // SPACE
			this._keys.space = true;
			break;
		case 16: // SHIFT
			this._keys.shift = true;
			break;
		case 81: // q
			this._keys.up = true;
			break;
		case 69: // e
			this._keys.down = true;
			break;
		}
	}

	_onKeyUp(event) {
		switch(event.keyCode) {
		case 87: // w
			this._keys.forward = false;
			break;
		case 65: // a
			this._keys.left = false;
			break;
		case 83: // s
			this._keys.backward = false;
			break;
		case 68: // d
			this._keys.right = false;
			break;
		case 32: // SPACE
			this._keys.space = false;
			break;
		case 16: // SHIFT
			this._keys.shift = false;
			break;
		case 81: // q
			this._keys.up = false;
			break;
		case 69: // e
			this._keys.down = false;
			break;
		}
	}
};

class CameraController { //controls camera
	constructor(object) {
	  this._object = object;
	  this._currentPosition = new THREE.Vector3();
	  this._currentLookat = new THREE.Vector3();
	}
  
	_CalculateIdealOffset() { // calculate camera position
	  var idealOffset; 

	  if (firstPerspective==true){ //first perspective
		idealOffset=new THREE.Vector3(0, -2, 3);//(left/right,forward/backward,up/down)
	  }
	  else {//third perspective
		idealOffset=new THREE.Vector3(0, 18, 15);
	  }
	  idealOffset.applyQuaternion(this._object.Rotation);
	  idealOffset.add(this._object.Position);
	  return idealOffset;
	}
  
	_CalculateIdealLookat() { // calculate camera lookat
	  var idealLookat; 

	  if (firstPerspective == true){ //first perspective
		idealLookat = new THREE.Vector3(0, -10, 2); //(0,0,0) heads to object direction
	  }
	  else { //third perspective
		idealLookat = new THREE.Vector3(0, -5, 5);
	  }
	 
	  idealLookat.applyQuaternion(this._object.Rotation);
	  idealLookat.add(this._object.Position);
	  return idealLookat;
	}
  
	Update(timeElapsed) {
	  const idealOffset = this._CalculateIdealOffset();
	  const idealLookat = this._CalculateIdealLookat();
  
	  // const t = 0.05;
	  // const t = 4.0 * timeElapsed;
	  const t = 1.0 - Math.pow(0.001, timeElapsed);
  
	  this._currentPosition.copy(idealOffset);
	  this._currentLookat.copy(idealLookat);
	  camera.position.copy(this._currentPosition);
	  camera.lookAt(this._currentLookat);
	}
};
  


var sceneID = null;
var camera;
var scene;
var firstPerspective=true;
var thirdPerspective=false;
var trackballControl=false;

window.onload = function init() 
{
	var rotSpeed = 1;
	var revSpeed = 1;
	var theta  = 0;
	const canvas = document.getElementById( "gl-canvas" );
	const renderer = new THREE.WebGLRenderer({canvas});

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 2000);
	camera.position.set(0, 15, -150);

	// add lightsources
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));

	var sunLight = new THREE.PointLight(0xf4e99b, 0.8);
	sunLight.position.set(0, 0, 0);
	scene.add(sunLight);


	// add sun/planets
	var sun = createSun(40, 32);
	scene.add(sun);

	var sunAtmosphere = createSunAtmos(41, 64);
	sunAtmosphere.material.emissive.setHex(0xFF0000);
	scene.add(sunAtmosphere);

	var outerSunAtmosphere = createSunAtmos(43, 64);
	outerSunAtmosphere.material.color.setHex(0xFFFF00);
	outerSunAtmosphere.material.emissive.setHex(0xFFFF00);
	outerSunAtmosphere.material.opacity = 0.2;
	scene.add(outerSunAtmosphere);
	
	var mercury = createMercury(1, 32);
	mercury.position.set(50, 0, 0);
	scene.add(mercury);

	var venus = createVenus(2.5, 32);
	venus.position.set(67.4, 0, 0);
	scene.add(venus);

    var earth = createEarth(2.6, 32);
	earth.position.set(81, 0, 0);
	scene.add(earth);

    var cloud_earth = createCloud_earth(2.61, 32);
	cloud_earth.position.set(81, 0, 0);
	scene.add(cloud_earth);

	var moon = createMoon(0.4, 32);
	const moonContainer = new THREE.Object3D;			// set moon container as sun's child element: orbit around sun
	moonContainer.add(moon);
	earth.add(moon);									// set moon as earth's child element: orbit around earth
	sun.add(moonContainer);

	var mars = createMars(1.9, 32);
	mars.position.set(108, 0, 0);
	scene.add(mars);

	var jupiter = createJupiter(10, 32);
	jupiter.position.set(140, 0, 0);
	scene.add(jupiter);

	var saturn = createSaturn(9, 32);
	saturn.position.set(200, 0, 0);
	scene.add(saturn);

	var saturnRingGeo = new THREE.RingGeometry(11, 15, 64);
	var saturnRingMat = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('images/8k_saturn_ring.png'), side: THREE.DoubleSide});
	var saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
	var pos = saturnRingGeo.attributes.position;
	var v3 = new THREE.Vector3();
	for(var i = 0; i < pos.count; i++){
		v3.fromBufferAttribute(pos, i);
		saturnRingGeo.attributes.uv.setXY(i, v3.length() < 12 ? 0 : 1, 1);
	}
	saturnRing.rotation.x = 20;
	saturnRing.position.set(200, 0, 0);
	scene.add(saturnRing);

	var uranus = createUranus(7, 32);
	uranus.position.set(260, 0, 0);
	scene.add(uranus);

	var neptune = createNeptune(7, 32);
	neptune.position.set(320, 0, 0);
	scene.add(neptune);

	// add canvas background
	var stars = createStars(1000, 64);
	scene.add(stars);


	/* create black hole */
	// change : create to 4 ways
	const loader = new THREE.GLTFLoader();
	
	loader.load('./images/blackhole/scene.gltf', function(gltf){
		blackhole = gltf.scene.children[0];
		blackhole.scale.set(10, 10, 10);
		
		blackhole.position.set(400, 0, 0);		
		scene.add(gltf.scene);
		animate(blackhole);
		  
		}, undefined, function (error) {
			console.error(error);
		});

	
	// for rotating black hole 
	function animate(time) {

		time *= 0.001;  // convert time to seconds

      	const speed = 1 * .3;
      	const rot = time * speed;
      	blackhole.rotation.x = rot;
		// spaceship의 위치에 따라 blackhole 방향 설정
		if (spaceship.Position.x < 100) {
			if (spaceship.Position.y < 100) {
				blackhole.position.set(-200, -200, 0);
			}
			else blackhole.position.set(-200, 200, 0);
		}
		else {
			if (spaceship.Position.y < 100) {
				blackhole.position.set(200, -200, 0);
			}
			else blackhole.position.set(200, 200, 0);
		}
		
	   renderer.render(scene,camera);
	   requestAnimationFrame(animate);
	}


	var spaceship = new SpaceshipController();
	var previousTime = null;


	var cameraControl = new CameraController(spaceship);

	var controls = new THREE.TrackballControls(camera, renderer.domElement);

	render();


	// render canvas
	function render(time) {

		document.getElementById("rotSpeed").oninput = function(event){
			rotSpeed = parseFloat(event.target.value);
		};

		document.getElementById("revSpeed").oninput = function(event){
			theta = 0;
			revSpeed = parseFloat(event.target.value);

			//console.log(theta + " " + revSpeed);
		};

		document.getElementById("firstPerspective").onclick = function(){
			firstPerspective=true;
			thirdPerspective=false;
			trackballControl=false;
		};
		document.getElementById("thirdPerspective").onclick = function(){
			thirdPerspective=true;
			firstPerspective=false;
			trackballControl=false;
		};
		document.getElementById("trackballControl").onclick = function(){
			trackballControl=true;
			firstPerspective=false;
			thirdPerspective=false;
		};

		if (previousTime === null) {
			previousTime = time;
		}

		//spaceship update
		var timeElapsed = time - previousTime;
		timeElapsed *= 0.001; //second
		spaceship.Update(timeElapsed) 

		//camera update
		if(firstPerspective==true || thirdPerspective==true){
			cameraControl.Update(timeElapsed);
		}
		else{
			controls.update();
		}
		previousTime = time;

		//console.log('ship',spaceship.Position);
		//console.log('camera',camera.position)



		// rotate sun/plantes
		// sun			1109	->	0.9, for visual effects
		// mercury    	1.6		->	1.6
		// venus    	1		->	1
		// earth    	258		->	2.5
		// mars    		134		->	2
		// jupiter    	7000	->	7
		// saturn      	5438	->	5
		// uranus   	1438	->	4
		// neptune   	1488	->	4
		sun.rotation.y += 0.0005 * 0.9 * rotSpeed;
		mercury.rotation.y -= 0.0005 * rotSpeed * 1.6;
		venus.rotation.y -= 0.0005 * rotSpeed;
		earth.rotation.y += 0.0005 * rotSpeed * 2.5;
		cloud_earth.rotation.y += 0.0005 * rotSpeed * 2.5;
		moon.rotation.y += 0.0005 * rotSpeed * 1.1;
		mars.rotation.y += 0.0005 * rotSpeed * 2;
		jupiter.rotation.y += 0.0005 * rotSpeed * 7;
		saturn.rotation.y += 0.0005 * rotSpeed * 5;
		saturnRing.rotation.z += 0.0005 * rotSpeed * 5;
		uranus.rotation.y += 0.0005 * rotSpeed * 4;
		neptune.rotation.y += 0.0005 * rotSpeed * 4;

		// revolve planets
		// mercury    	8.6
		// venus    	6.4
		// earth    	5.4
		// mars    		4.4
		// jupiter    	2.4
		// saturn      	1.7
		// uranus   	1.3
		// neptune   	1
		theta += 0.0001;
		mercury.position.z = 50 * Math.sin(theta * 8.6 * revSpeed);
    	mercury.position.x = 50 * Math.cos(theta * 8.6 * revSpeed);
		venus.position.z = 67.4 * Math.sin(theta * 6.4 * revSpeed);
    	venus.position.x = 67.4 * Math.cos(theta * 6.4 * revSpeed);
		earth.position.z = 81 * Math.sin(theta * 5.4 * revSpeed);
    	earth.position.x = 81 * Math.cos(theta * 5.4 * revSpeed);
		moon.position.z = 4 * Math.sin(theta * 200 * revSpeed);
    	moon.position.x = 4 * Math.cos(theta * 200 * revSpeed);
		moonContainer.position.z = 85 * Math.sin(theta * 2 * revSpeed);
    	moonContainer.position.x = 85 * Math.cos(theta * 2 * revSpeed);
		cloud_earth.position.z = 81 * Math.sin(theta * 5.4 * revSpeed);
    	cloud_earth.position.x = 81 * Math.cos(theta * 5.4 * revSpeed);
		mars.position.z = 108 * Math.sin(theta * 4.4 * revSpeed);
    	mars.position.x = 108 * Math.cos(theta * 4.4 * revSpeed);
		jupiter.position.z = 140 * Math.sin(theta * 2.4 * revSpeed);
    	jupiter.position.x = 140 * Math.cos(theta * 2.4 * revSpeed);
		saturn.position.z = 200 * Math.sin(theta * 1.7 * revSpeed);
    	saturn.position.x = 200 * Math.cos(theta * 1.7 * revSpeed);
		saturnRing.position.z = 200 * Math.sin(theta * 1.7 * revSpeed);
    	saturnRing.position.x = 200 * Math.cos(theta * 1.7 * revSpeed);
		uranus.position.z = 260 * Math.sin(theta * 1.3 * revSpeed);
    	uranus.position.x = 260 * Math.cos(theta * 1.3 * revSpeed);
		neptune.position.z = 320 * Math.sin(theta * 1 * revSpeed);
    	neptune.position.x = 320 * Math.cos(theta * 1 * revSpeed);



		//console.log(sun.rotation.y);
		sceneID = requestAnimationFrame(render);
		renderer.render(scene, camera);
	}





	// functions for rendering sun and planets
	function createSun(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/8k_sun.jpg'),
				emissive:	0xFF0000
			})
		);
	}

	function createSunAtmos(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),			
			new THREE.MeshPhongMaterial({
				color: 0xFF0000,
				opacity: 0.3,
				transparent: true
			})
		);	
	}

	function createMercury(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/8k_mercury.jpg'),
				bumpMap:	THREE.ImageUtils.loadTexture('images/mercurybump.jpg'),
				bumpScale:	0.005
			})
		);
	}

	function createVenus(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/8k_venus.jpg'),
				bumpMap:	THREE.ImageUtils.loadTexture('images/venusbump.png'),
				bumpScale:	0.005
			})
		);
	}

	function createEarth(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale:   0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')								
			})
		);
	}

	function createCloud_earth(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),			
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);		
	}

	function createMoon(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/8k_moon.jpg')						
			})
		);
	}

	function createMars(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/8k_mars.jpg'),
				bumpMap:	THREE.ImageUtils.loadTexture('images/marsbump2.png'),
				bumpScale:	0.005
			})
		);
	}

	function createJupiter(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/8k_jupiter.jpg')
			})
		);
	}

	function createSaturn(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/8k_saturn.jpg')
			})
		);
	}

	function createUranus(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/2k_uranus.jpg')
			})
		);
	}

	function createNeptune(radius, segments){
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:		THREE.ImageUtils.loadTexture('images/2k_neptune.jpg')
			})
		);
	}

	// create canvas background
	function createStars(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments), 
			new THREE.MeshBasicMaterial({
				map:  THREE.ImageUtils.loadTexture('images/8k_stars_milky_way.jpg'), 
				side: THREE.BackSide
			})
		);
	}
}


