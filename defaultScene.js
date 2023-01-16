// import * as THREE from 'three';

// import Stats from 'three/addons/libs/stats.module.js';

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
// import { DragControls } from 'three/addons/controls/DragControls.js';

const btn_upload = document.querySelector('#input_model');
const container = document.querySelector('#scene-container');
const btn_addcircle = document.querySelector('#btn_add');
const btn_save = document.querySelector('#btn_save');


let scene, renderer, camera, count=0, orbitcontrol, scan_model, raycaster, circles=[], blue_material = [], red_material = [], flag = [], index = [];
let pointer = new THREE.Vector2();


scene = new THREE.Scene();
scene.background = new THREE.Color('white');

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( 1.5, 1.5, 1.5 );
camera.lookAt( scene.position );
camera.updateMatrix();
const light = new THREE.SpotLight('white', 3)

light.position.set(20, 30, 20);
scene.add(light)

console.log(light)
renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

//orbitcontrol = new THREE.OrbitControls(camera, renderer.domElement);
console.log(orbitcontrol)

const fbxLoader = new THREE.FBXLoader();
console.log(fbxLoader);



function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {
    camera.updateMatrixWorld();
    renderer.render( scene, camera );
}

            
function upload_model(){
    let model_file = btn_upload.files[0];
    console.log(model_file)
    if (!model_file){
        console.log("No model currently selected for upload")

    } else {
        //scene.remove(character_inputed)
        const model_url = window.URL.createObjectURL(model_file);
        console.log(model_url)
        fbxLoader.load(
            model_url,
            (model) => {
                var max = 0;
                model.traverse(
                    (child) => {
                        if ((child).isMesh) {
                            var point_count = child.geometry.attributes.position.count*3;
                        
                            for(let i=0; i<point_count; i++){
                                if(max<child.geometry.attributes.position.array[i]){
                                    max = child.geometry.attributes.position.array[i];
                                }
                            }
                        }
                    }
                )
                model.scale.set(1/max, 1/max, 1/max);
                model.position.set(0,-0.5,0);
                scan_model = model;
                for (let i = 1; i < count+1; i++)
		{
		    if(scene.childre[i]) scene.remove(scene.children[i]);
		}
		count = 0;
                scene.add(model);
                console.log(scene);
            },
        );
    }
}

function MouseDown(e){
    raycaster = new THREE.Raycaster();
    pointer.x =(e.clientX/window.innerWidth)*2-1;
    pointer.y =(e.clientY/window.innerHeight)*-2+1;
    raycaster.setFromCamera(pointer,camera);
    let selected_circle = raycaster.intersectObjects(circles)[0];
    if(selected_circle){
        const id = 0;
        for (let i = 0; i < count; i++){
	    if( index[i] == selected_circle.object.uuid) id = i;
	}
        console.log(selected_circle);
        if(flag[id]){
            selected_circle.object.material = red_material[id];   
        } else
        selected_circle.object.material = blue_material[id];

        flag[id] = !flag[id];
            
    }
}

function AddCircle(){
    count++;

    const url = `./imgs/text${count}.png`;
    const url2 = `./imgs/red${count}.png`;
    const image = new Image();
    const image2 = new Image();

    image.crossOrigin = "anoymous";
    image.src = url; 
    image2.crossOrigin = "anoymous";
    image2.src = url2;
    
    let map1 = new THREE.Texture();
    let map2 = new THREE.Texture();
    map1.source.data = image;
    map1.needsUpdate = true;
    map2.source.data = image2;
    map2.needsUpdate = true;
//    let map1 = new THREE.TextureLoader().load(url);
    // let map2 = new THREE.TextureLoader().load(`./imgs/red${count}.png`);
    let material1 = new THREE.SpriteMaterial({ map: map1 });
    let material2 = new THREE.SpriteMaterial({ map: map2 });
    blue_material.push(material1);
    red_material.push(material2);


     //let map1 = new THREE.TextureLoader().load(`./imgs/text${count}.png`);
     //let map2 = new THREE.TextureLoader().load(`./imgs/red${count}.png`);

    flag.push(true);
    let circle = new THREE.Sprite(material1);
    
    circle.position.set(count*0.1,0,0.8);
    circle.scale.set(0.1,0.1,0.1)

    circles.push(circle);
    index.push(circle.object.uuid);
    const dControl = new THREE.DragControls(circles ,camera, renderer.domElement);
    console.log(dControl)
    //dControl.activate();

    scene.add( circle );
}

function ModelSave(){
    return scene;
    //---------can use useState(Default scene)-----//
}


btn_upload.addEventListener('change', () => {upload_model()});
btn_addcircle.addEventListener('click', () => {AddCircle()});
btn_save.addEventListener('click', () => {ModelSave()});

document.addEventListener('mousedown',(e)=>{MouseDown(e)});


animate();
