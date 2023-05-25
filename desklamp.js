// CSI 4130 Assignment 1
// Aaron Ng
// March 7, 2022
// Code based on solar_solution.js

// initialization of Three.js
function init() {

    const ARM_RADIUS = 2;
    const ARM_LENGTH = 20
    const LAMPSHADE_TOP_HEIGHT = 12;
    const LAMPSHADE_TOP_RADIUS = 4;
    const LAMPSHADE_BOT_HEIGHT = 8;

    // add our rendering surface and initialize the renderer
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    renderer = new THREE.WebGLRenderer();
    // set some state - here just clear color
    renderer.setClearColor(new THREE.Color(0x333333));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


    // All drawing will be organized in a scene graph
    var scene = new THREE.Scene();

    // show axes at the origin
    var axes = new THREE.AxesHelper(10);
    scene.add(axes);


    // @@@@@@@@@@@@@@@@ Begin shape creation @@@@@@@@@@@@@@@@


    // Lamp Base
    var group_lamp_base = new THREE.Group();
    scene.add(lamp_base);
    var faceMaterial_base = new THREE.MeshBasicMaterial({color: 'tan'});
    var geometryCylinder_base = new THREE.CylinderGeometry(20, 20, 4, 32);
    var lamp_base = new THREE.Mesh(geometryCylinder_base, faceMaterial_base);
    group_lamp_base.position.set(0, -20, 0); // Start coords
    group_lamp_base.add(lamp_base);
    scene.add(group_lamp_base);

    // Lower Arm
    var group_lower_arm = new THREE.Group();
    group_lamp_base.add(group_lower_arm);

    var faceMaterial_arm = new THREE.MeshBasicMaterial({color: 0xcca45a});
    var faceMaterial_joint = new THREE.MeshBasicMaterial({color: 0xc78363});
    var geometryCylinder_arm = new THREE.CylinderGeometry(ARM_RADIUS, ARM_RADIUS, ARM_LENGTH, 12);
    var geometrySphere_joint = new THREE.SphereGeometry(ARM_RADIUS, 32, 16);

    var lower_arm = new THREE.Mesh(geometryCylinder_arm, faceMaterial_arm);
    var lower_arm_joint = new THREE.Mesh(geometrySphere_joint, faceMaterial_joint);

    lower_arm.position.set(0, 10, 0);
    lower_arm_joint.position.set(0, 0, 0);
    group_lower_arm.position.set(0, 2, 0);
    group_lower_arm.rotation.z = -Math.PI/6

    group_lower_arm.add(lower_arm);
    group_lower_arm.add(lower_arm_joint);
    group_lamp_base.add(group_lower_arm);

    // Upper Arm
    var group_upper_arm = new THREE.Group();
    group_lower_arm.add(group_upper_arm);

    var upper_arm = new THREE.Mesh(geometryCylinder_arm, faceMaterial_arm);
    var upper_arm_joint = new THREE.Mesh(geometrySphere_joint, faceMaterial_joint);

    upper_arm.position.set(0, 10, 0);
    upper_arm_joint.position.set(0, 0, 0);
    group_upper_arm.position.set(0, ARM_LENGTH, 0);
    group_upper_arm.rotation.z = Math.PI/3

    group_upper_arm.add(upper_arm);
    group_upper_arm.add(upper_arm_joint);
    group_lower_arm.add(group_upper_arm);

    // Lampshade
    var group_lampshade = new THREE.Group();
    group_upper_arm.add(group_lampshade)

    var geometryCylinder_lampshade_top = new THREE.CylinderGeometry(LAMPSHADE_TOP_RADIUS, LAMPSHADE_TOP_RADIUS, LAMPSHADE_TOP_HEIGHT, 12);
    var geometryCylinder_lampshade_bot = new THREE.CylinderGeometry(LAMPSHADE_TOP_RADIUS, LAMPSHADE_TOP_RADIUS + 3, LAMPSHADE_BOT_HEIGHT, 12);

    var lampshade_joint = new THREE.Mesh(geometrySphere_joint, faceMaterial_joint);
    var lampshade_top = new THREE.Mesh(geometryCylinder_lampshade_top, faceMaterial_base);
    var lampshade_bot = new THREE.Mesh(geometryCylinder_lampshade_bot, faceMaterial_arm);

    group_lampshade.position.set(0, ARM_LENGTH, 0);
    group_lampshade.rotation.z = -Math.PI/2;
    lampshade_top.position.set(-LAMPSHADE_TOP_RADIUS, 0, 0);
    lampshade_bot.position.set(-LAMPSHADE_TOP_RADIUS, -LAMPSHADE_TOP_HEIGHT/2, 0);

    group_lampshade.add(lampshade_joint);
    group_lampshade.add(lampshade_top);
    group_lampshade.add(lampshade_bot);
    group_upper_arm.add(group_lampshade);

    // Lightbulb
    var geometrySphere_bulb = new THREE.SphereGeometry(LAMPSHADE_TOP_RADIUS, 32, 16);
    var faceMaterial_bulb = new THREE.MeshBasicMaterial({color: 'yellow'});
    var bulb = new THREE.Mesh(geometrySphere_bulb, faceMaterial_bulb);

    bulb.position.set(-LAMPSHADE_TOP_RADIUS, -(LAMPSHADE_TOP_RADIUS/2+LAMPSHADE_BOT_HEIGHT), 0);
    group_lampshade.add(bulb);

    // Sphere indicating Camera view position (the 'at' position)
    var group_camera = new THREE.Group();
    var geometrySphere_view = new THREE.SphereGeometry(1, 32, 16);
    var lookingAt = new THREE.Mesh(geometrySphere_view, new THREE.MeshBasicMaterial({color: 'red'}));
    group_camera.add(lookingAt);
    scene.add(group_camera);


    // @@@@@@@@@@@@@@@@ End of shape creation @@@@@@@@@@@@@@@@


    // need a camera to look at things
    // calcaulate aspectRatio
    var aspectRatio = window.innerWidth / window.innerHeight;
    var width = 20;
    // Camera needs to be global
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 1000);
    // position the camera back and point to the center of the scene
    camera.position.z = 100;
    camera.lookAt(scene.position);
    group_camera.add(camera);

    // render the scene
    renderer.render(scene, camera);

    //declared once at the top of your code
    var camera_axis = new THREE.Vector3(-30,30,30).normalize(); // viewing axis
    


    // setup the control gui
    var controls = new function () {
	this.lamp_rotate = 0;
    this.lower_arm_rotate = group_lower_arm.rotation.z / Math.PI;
    this.upper_arm_rotate = group_upper_arm.rotation.z / Math.PI;
    this.lampshade_rotate_y = group_lampshade.rotation.y / Math.PI;
    this.lampshade_rotate_z = group_lampshade.rotation.z / Math.PI;

    this.camera_rotate_x = camera.position.x;
    this.camera_rotate_y = camera.position.y;
    this.lookingAt_x = group_camera.position.x;
    this.lookingAt_y = group_camera.position.y;
    this.lookingAt_z = group_camera.position.z;
        this.redraw = function () {
            group_lamp_base.rotation.y = controls.lamp_rotate * Math.PI;
            group_lower_arm.rotation.z = controls.lower_arm_rotate * Math.PI;
            group_upper_arm.rotation.z = controls.upper_arm_rotate * Math.PI;
            group_lampshade.rotation.y = controls.lampshade_rotate_y * Math.PI;
            group_lampshade.rotation.z = controls.lampshade_rotate_z * Math.PI;

            group_camera.position.x = controls.lookingAt_x;
            group_camera.position.y = controls.lookingAt_y;
            group_camera.position.z = controls.lookingAt_z;
            

            if (camera.position.y == controls.camera_rotate_y){
                camera.position.x = controls.camera_rotate_x;
                camera.position.z = Math.sqrt(100**2-(controls.camera_rotate_x)**2);
            } else {
                camera.position.y = controls.camera_rotate_y;
                camera.position.z = Math.sqrt(100**2-(controls.camera_rotate_y)**2);
            }
            
            camera.lookAt(group_camera.position);

        };
    };


    var gui = new dat.GUI();
    gui.add(controls, 'lamp_rotate', -1, 1).onChange(controls.redraw);
    gui.add(controls, 'lower_arm_rotate', -0.4, 0.2).onChange(controls.redraw);
    gui.add(controls, 'upper_arm_rotate', 0, 0.4).onChange(controls.redraw);
    gui.add(controls, 'lampshade_rotate_y', -0.5, 0.5).onChange(controls.redraw);
    gui.add(controls, 'lampshade_rotate_z', -0.8, -0.2).onChange(controls.redraw);

    gui.add(controls, 'camera_rotate_x', -100, 100).onChange(controls.redraw);
    gui.add(controls, 'camera_rotate_y', -100, 100).onChange(controls.redraw);
    gui.add(controls, 'lookingAt_x', -50, 50).onChange(controls.redraw);
    gui.add(controls, 'lookingAt_y', -50, 50).onChange(controls.redraw);
    gui.add(controls, 'lookingAt_z', -50, 50).onChange(controls.redraw);
    render();

    
    function render() {
        // render using requestAnimationFrame - register function
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // If we use a canvas then we also have to worry of resizing it
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = init;

// register our resize event function
window.addEventListener('resize', onResize, true);







