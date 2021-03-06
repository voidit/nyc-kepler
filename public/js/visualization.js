
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	var mouseX = 0, mouseY = 0;

	var renderer = new THREE.WebGLRenderer();
	
	// set the scene size
	var WIDTH = windowHalfX*2,
	    HEIGHT = windowHalfY*2;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;

	var $container = $('.container');

	var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
	                                ASPECT,
	                                NEAR,
	                                FAR  );
	var scene = new THREE.Scene();

	// the camera starts at 0,0,0 so pull it back
	camera.position.z = 300;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);
	
	// Sun
	var sphere;

	// Hold all objects for intersection testing
	var controller = new THREE.Object3D();
		controller.scene = scene;
		controller.objects = [];

	controller.setCurrent = function(current) {
		if (this.current)
		  this.current.material.ambient.setHex(0x000000);

		this.current = current;
		
		if (this.current) {
		  this.current.material.ambient.setHex(0x888888);
		}
		
	    //Show which planet it is
	    $('#info').html(current.name);
		
	};
	
	init();
	
	setInterval( loop, 1000 / 60 );
	
	function init() {

		// attach the render-supplied DOM element
		$container.append(renderer.domElement);
		
		// create the sphere's material
		var sphereMaterial = new THREE.MeshLambertMaterial({ 
			color: 0xFFFF00
		});

		// set up the sphere vars
		var radius = 5, segments = 10, rings = 10;

		sphere = new THREE.Mesh(
		   new THREE.SphereGeometry(radius, segments, rings),
		   sphereMaterial);
		sphere.name = 'Sun';

		controller.objects.push(sphere);
		scene.add(sphere);

		// Setup all of the exoplanets
		for(var i = 0; i < exo_array.length; i++) {

			// planet
			var p = exo_array[i];

			//temperature - colour mapping
			var col;
			if (p.temp > 6150)
				col = '0x19bce5'
			else if (p.temp > 10000)
				col = '0x01f9f9'
			else if (p.temp > 5900)
				col = '0x00fb44'
			else if (p.temp > 5700)
				col = '0x97fc02'
			else if (p.temp > 5485)
				col = '0xfc9701'
			else if (p.temp > 4900)
				col = '0xfb5c01'
			else
				col = '0xcf4626'

			sphereMaterial = new THREE.MeshLambertMaterial({
				color: col
			});

			//x y z coordinate based on RA and Declination
			x = (p.dist * Math.cos(p.dec)) * Math.cos(p.ra)
			y = (p.dist * Math.cos(p.dec)) * Math.sin(p.ra)
			z = p.dist * Math.sin(p.dec)
			
			//Radius and mass mapping
			radius = Math.max(p.mass / 5, .5)
			
			var sph = new THREE.Mesh(
				new THREE.SphereGeometry(radius, segments, rings),
					sphereMaterial);
					
			sph.position.set(x, y, z);
			sph.name = p.name;
			
			controller.objects.push(sph);
			scene.add(sph);
			
			controller.setCurrent(sphere);
		}
		
	
		// and the camera
		scene.add(camera);

		var ambient = new THREE.AmbientLight(0x202020);
        scene.add(ambient);

		// create a point light
		var pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 10;
		pointLight.position.y = 50;
		pointLight.position.z = 130;
		
		var pointLight2 = new THREE.PointLight( 0xFFFFFF );
		pointLight2.position.x = -10;
		pointLight2.position.y = -50;
		pointLight2.position.z = -130;

		// add to the scene
		scene.add(pointLight);
		scene.add(pointLight2);
		
		//Setup projection
		var projector = new THREE.Projector();
		window.addEventListener('mousemove', function (ev){
		  if (ev.target == renderer.domElement) {
			var x = ev.clientX;
			var y = ev.clientY;
			var v = new THREE.Vector3((x/WIDTH)*2-1, -(y/HEIGHT)*2+1, 0.5);
			projector.unprojectVector(v, camera);
			var ray = new THREE.Ray(camera.position, 
									v.subSelf(camera.position).normalize());
			var intersects = ray.intersectObjects(controller.objects);
			if (intersects.length > 0) {
			   controller.setCurrent(intersects[0].object);
			}
		  }
		}, false);		
		
	}
	
	
	var theta = 0;

	function loop() {
		var time = new Date().getTime() * 0.00005;

		var phi = Math.min( 180, Math.max( 0, phi ) );

		radius = 300;
		
		theta += .5;

		camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
		camera.position.y = radius * Math.sin( theta * Math.PI / 360 );
		camera.position.z = radius * Math.cos( theta * Math.PI / 360 );
		
		if(controller.current)
			camera.lookAt( controller.current.position );
		else
			camera.lookAt( sphere.position );

		renderer.render( scene, camera );
	}
	