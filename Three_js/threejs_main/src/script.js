import * as THREE from 'three'
import './style.css'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const scene = new THREE.Scene();

// Отображение осей координат
// AxesHelper() принимает в себя длину осей
// const axesHelper = new THREE.AxesHelper(3) 
// scene.add(axesHelper)

// const colors = [0xb7e8d8, 0xe86344, 0xe8ab9c]

const geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4); //Куб
// const geometry = new THREE.CircleGeometry(1, 20, 0, Math.PI) //Диск
// const geometry = new THREE.PlaneGeometry(1, 1, 10, 10) //Плоскость
// const geometry = new THREE.ConeGeometry(1, 2, 32, 1, false, 0, Math.PI) //Конус
// const geometry = new THREE.CylinderGeometry(0.5, 1, 2, 32, 4, false, 0, Math.PI) //Цилиндр
// const geometry = new THREE.RingGeometry(0.5, 1, 32, 10, 0, Math.PI) //Кольцо
// const geometry = new THREE.TorusGeometry(1, 0.5, 32, 48, Math.PI) //Пончик
// const geometry = new THREE.TorusKnotGeometry(1, 0.25, 64, 16, 1, 5) //ХЗ че это
// const geometry = new THREE.DodecahedronGeometry(1, 0) //Додекаэдр
// const geometry = new THREE.OctahedronGeometry(1, 0) //Октаэдр
// const geometry = new THREE.TetrahedronGeometry(1, 0) //Тетраэдр
// const geometry = new THREE.IcosahedronGeometry(1, 5) //Сфера из треугольников
// const geometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI, 0, Math.PI / 2) //Классическая сфера
// const geometry = new THREE.SphereGeometry(1, 32, 32)

const material = new THREE.MeshNormalMaterial();

// const material = new THREE.MeshBasicMaterial({ 
//     color: 'purple',
//     wireframe: true,
// });

// const group = new THREE.Group();
// group.scale.y = 1.4
// group.rotation.x = Math.PI * 0.25

// const cube1 = new THREE.Mesh(geometry, material);
// cube1.position.x = -1.2

// const cube2 = new THREE.Mesh(geometry, material);
// cube2.position.x = 0

// const cube3 = new THREE.Mesh(geometry, material);
// cube3.position.x = 1.2

// group.add(cube1)
// group.add(cube2)
// group.add(cube3)

const mesh = new THREE.Mesh(geometry, material);

// const group = new THREE.Group()
// const meshes = []

// // const colors = [0xb7e8d8, 0xe86344, 0xe8ab9c]

// for (let x = -1.2; x <= 1.2; x += 1.2){
//     for (let y = -1.2; y <= 1.2; y += 1.2){

//         const material = new THREE.MeshBasicMaterial({ 
//             color: colors[((Math.random() * 3) | 0) + 1],
//             wireframe: true,
//         });

//         const mesh = new THREE.Mesh(geometry, material);
//         mesh.scale.set(0.5, 0.5, 0.5)
//         mesh.position.set(x, y, 0)
//         meshes.push(mesh)
//     }
// }

// group.add(...meshes)

// mesh.position.x = -1
// mesh.position.y = -1

// Длина вектора
// mesh.position.length()

// Растояние до другого вектора
// mesh.position.distanceTo(camera.position)

// Нормализованное значение
// mesh.position.normalize()

// Быстрое изменение координат x, y, z
// mesh.position.set(-1, -0.8, 0.5)

// Изменение размеров обьекта
// mesh.scale.x = 0.5

// Вращение обьекта
// mesh.rotation.x = Math.PI * 0.25
// mesh.rotation.y = Math.PI * 0.25

// Изменение очереди вращений
// mesh.rotation.reorder('YXZ') 

scene.add(mesh);
//scene.add(group)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const cursor = {
    x: 0,
    y: 0,
};


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
// camera.position.y = 1

scene.add(camera)

// Направление камеры на определнный обьект, вектор и тд.
// camera.lookAt(mesh.position)

const canvas = document.querySelector('canvas');

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(0x000000, 0)
renderer.render(scene, camera)

window.addEventListener('mousemove', (event) => {
    cursor.x = -(event.clientX / sizes.width - 0.5);
    cursor.y = event.clientY / sizes.height - 0.5;
})

// let time = Date.now()

 const clock = new THREE.Clock();

 const tick = () => {
    const elepsedTime = clock.getElapsedTime()

     mesh.rotation.y = elepsedTime*0.25
     mesh.rotation.x = elepsedTime*0.25
    // mesh.rotation.z = elepsedTime*0.25
    // mesh.position.x = Math.cos(elepsedTime)
    // mesh.position.y = Math.sin(elepsedTime)

    // camera.position.x = Math.cos(elepsedTime)
    // camera.position.y = Math.sin(elepsedTime)
    // camera.lookAt(mesh.position)

    // camera.position.x = cursor.x * 2
    // camera.position.y = cursor.y * 2

    //camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2
    //camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2
    //camera.position.y = cursor.y * 2

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
 }

tick()

// const MAX_SCALE = 1
// const MIN_SCALE = 0.5
// let grow = false

// const animate = () => {
//     const delta = clock.getDelta();
//     meshes.forEach((item, index) => {
//         const mult = index % 2 === 0 ? 1 : -1
//         item.rotation.x += mult * delta
//         item.rotation.y += mult * delta * 0.4
//     })

    // const elapsed = clock.getElapsedTime()
    // camera.position.x = Math.sin(elapsed)
    // camera.position.y = Math.cos(elapsed)
    // camera.lookAt(new THREE.Vector3(0, 0, 0))

    // const mult2 = grow ? 1 : -1
    // group.scale.x += mult2 * delta * 0.2
    // group.scale.y += mult2 * delta * 0.2
    // group.scale.z += mult2 * delta * 0.2

    // if (grow && group.scale.x >= MAX_SCALE) {
    //     grow = false
    // }
    // else if (group.scale.x <= MIN_SCALE) {
    //     grow = true
    // }

//     renderer.render(scene, camera)
//     window.requestAnimationFrame(animate)
// }

// animate()

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.render(scene, camera)
})

window.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        canvas.requestFullscreen()
    }
})