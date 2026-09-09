// "use client";

// import { useEffect, useRef } from "react";

// import * as THREE from "three";


// export default function MoltenMetal() {

//     const canvasRef = useRef<HTMLCanvasElement | null>(null);


//     useEffect(() => {

//         const canvas = canvasRef.current;

//         if (!canvas) return;


//         const renderer = new THREE.WebGLRenderer({
//             canvas,
//             alpha:true,
//             antialias:true,
//             powerPreference:"high-performance",
//         });


//         renderer.setPixelRatio(
//             Math.min(window.devicePixelRatio,2)
//         );


//         const scene = new THREE.Scene();


//         const camera = new THREE.OrthographicCamera(
//             -1,
//             1,
//             1,
//             -1,
//             0,
//             1
//         );



//         const geometry =
//         new THREE.PlaneGeometry(
//             2,
//             2
//         );



//         const uniforms = {


//             uTime:{
//                 value:0,
//             },


//             uResolution:{
//                 value:new THREE.Vector2(
//                     window.innerWidth,
//                     window.innerHeight
//                 ),
//             },


//             uColor1:{
//                 value:new THREE.Color(
//                     "#7455d8"
//                 ),
//             },


//             uColor2:{
//                 value:new THREE.Color(
//                     "#ede8ff"
//                 ),
//             },


//             uGlow:{
//                 value:1.2,
//             },


//         };



//         const material =
//         new THREE.ShaderMaterial({

//             transparent:true,


//             uniforms,


//             vertexShader:`

//                 varying vec2 vUv;

//                 void main(){

//                     vUv=uv;

//                     gl_Position=
//                     projectionMatrix *
//                     modelViewMatrix *
//                     vec4(position,1.0);

//                 }

//             `,


//             fragmentShader:`

//                 uniform float uTime;

//                 uniform vec2 uResolution;

//                 uniform vec3 uColor1;

//                 uniform vec3 uColor2;

//                 uniform float uGlow;


//                 varying vec2 vUv;



//                 float hash(vec2 p){

//                     return fract(
//                         sin(
//                             dot(
//                                 p,
//                                 vec2(
//                                     127.1,
//                                     311.7
//                                 )
//                             )
//                         )*43758.5453123
//                     );

//                 }



//                 float noise(vec2 p){

//                     vec2 i=floor(p);

//                     vec2 f=fract(p);


//                     float a=hash(i);

//                     float b=hash(i+vec2(1.0,0.0));

//                     float c=hash(i+vec2(0.0,1.0));

//                     float d=hash(i+vec2(1.0,1.0));


//                     vec2 u=
//                     f*f*(3.0-2.0*f);


//                     return mix(
//                         a,
//                         b,
//                         u.x
//                     )
//                     +
//                     (
//                         c-a
//                     )
//                     *
//                     u.y
//                     *
//                     (1.0-u.x)
//                     +
//                     (
//                         d-b
//                     )
//                     *
//                     u.x
//                     *
//                     u.y;

//                 }




//                 float fbm(vec2 p){

//                     float value=0.0;

//                     float amp=.5;


//                     for(int i=0;i<5;i++){

//                         value+=
//                         noise(p)*amp;


//                         p*=2.0;

//                         amp*=0.5;

//                     }


//                     return value;

//                 }





//                 void main(){


//                     vec2 uv=
//                     vUv;


//                     float aspect=
//                     uResolution.x/
//                     uResolution.y;


//                     uv.x*=aspect;



//                     float t=
//                     uTime*0.08;



//                     vec2 flow=
//                     uv*1.8;


//                     flow.x+=sin(t)*0.4;

//                     flow.y+=cos(t*1.3)*0.3;



//                     float liquid=
//                     fbm(flow+t);



//                     float waves=
//                     sin(
//                         liquid*8.0
//                         +
//                         t*4.0
//                     );



//                     float caustic=
//                     smoothstep(
//                         0.25,
//                         0.8,
//                         waves
//                     );



//                     vec3 color=
//                     mix(
//                         uColor2,
//                         uColor1,
//                         liquid
//                     );



//                     color+=
//                     vec3(
//                         caustic*0.25
//                     )
//                     *
//                     uGlow;



//                     float fade=

//                     smoothstep(
//                         0.0,
//                         0.75,
//                         vUv.y
//                     );


//                     float alpha=

//                     mix(
//                         0.85,
//                         0.2,
//                         fade
//                     );



//                     gl_FragColor=

//                     vec4(
//                         color,
//                         alpha
//                     );

//                 }

//             `

//         });





//         const mesh =
//         new THREE.Mesh(
//             geometry,
//             material
//         );


//         scene.add(mesh);




//         const resize=()=>{


//             renderer.setSize(
//                 window.innerWidth,
//                 window.innerHeight
//             );


//             uniforms.uResolution.value.set(
//                 window.innerWidth,
//                 window.innerHeight
//             );


//         };



//         resize();


//         window.addEventListener(
//             "resize",
//             resize
//         );



//         let frame:number;



//         const animate=()=>{


//             uniforms.uTime.value=
//             performance.now()/1000;



//             renderer.render(
//                 scene,
//                 camera
//             );


//             frame=
//             requestAnimationFrame(
//                 animate
//             );


//         };



//         animate();




//         return()=>{


//             cancelAnimationFrame(
//                 frame
//             );


//             window.removeEventListener(
//                 "resize",
//                 resize
//             );


//             geometry.dispose();

//             material.dispose();

//             renderer.dispose();


//         };


//     },[]);




//     return (

//         <canvas

//             ref={canvasRef}

//             className="MoltenMetalCanvas"

//             aria-hidden="true"

//         />

//     );

// }


"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MoltenMetal() {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);


    useEffect(() => {

        const canvas = canvasRef.current;

        if (!canvas) return;


        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha:true,
            antialias:true,
            powerPreference:"high-performance",
        });


        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio,2)
        );


        const scene = new THREE.Scene();


        const camera = new THREE.OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0,
            1
        );



        const geometry = new THREE.PlaneGeometry(
            2,
            2
        );



        const mouse = new THREE.Vector2(
            0.5,
            0.5
        );


        const targetMouse = new THREE.Vector2(
            0.5,
            0.5
        );



        const uniforms = {


            uTime:{
                value:0,
            },


            uResolution:{
                value:new THREE.Vector2(
                    window.innerWidth,
                    window.innerHeight
                ),
            },


            uMouse:{
                value:mouse,
            },


            uColorDark:{
                value:new THREE.Color(
                    "#6d55c7"
                ),
            },


            uColorLight:{
                value:new THREE.Color(
                    "#f4f1ff"
                ),
            },


            uOpacity:{
                value:0.72,
            },

        };




        const material = new THREE.ShaderMaterial({

            transparent:true,

            uniforms,


            vertexShader:`

            varying vec2 vUv;

            void main(){

                vUv=uv;

                gl_Position=
                projectionMatrix*
                modelViewMatrix*
                vec4(position,1.0);

            }

            `,



            fragmentShader:`

            uniform float uTime;

            uniform vec2 uResolution;

            uniform vec2 uMouse;

            uniform vec3 uColorDark;

            uniform vec3 uColorLight;

            uniform float uOpacity;


            varying vec2 vUv;




            float hash(vec2 p){

                return fract(
                    sin(
                        dot(
                            p,
                            vec2(
                                127.1,
                                311.7
                            )
                        )
                    )*43758.5453123
                );

            }




            float noise(vec2 p){

                vec2 i=floor(p);

                vec2 f=fract(p);


                float a=hash(i);

                float b=hash(i+vec2(1.0,0.0));

                float c=hash(i+vec2(0.0,1.0));

                float d=hash(i+vec2(1.0,1.0));


                vec2 u=
                f*f*(3.0-2.0*f);



                return mix(
                    a,
                    b,
                    u.x
                )
                +
                (
                    c-a
                )
                *
                u.y
                *
                (1.0-u.x)
                +
                (
                    d-b
                )
                *
                u.x
                *
                u.y;

            }




            float fbm(vec2 p){

                float value=0.0;

                float amplitude=0.5;



                for(int i=0;i<6;i++){

                    value+=
                    noise(p)
                    *
                    amplitude;


                    p*=2.0;

                    amplitude*=0.5;

                }


                return value;

            }





            void main(){


                vec2 uv=vUv;



                float aspect=
                uResolution.x/
                uResolution.y;



                uv.x*=aspect;



                vec2 cursor =
                (uMouse-0.5)
                *
                0.35;




                float time=
                uTime*0.07;



                vec2 flow=uv*1.7;



                flow.x+=cursor.x;

                flow.y+=cursor.y;



                flow.x+=sin(time)*0.45;

                flow.y+=cos(time*1.2)*0.35;



                float liquid=
                fbm(flow);



                float waves=
                sin(
                    liquid*10.0
                    +
                    time*5.0
                );



                float shine=
                smoothstep(
                    0.25,
                    0.75,
                    waves
                );



                vec3 color=
                mix(
                    uColorLight,
                    uColorDark,
                    liquid
                );



                color+=
                shine*
                vec3(
                    0.20,
                    0.18,
                    0.35
                );



                float bottomFade=
                smoothstep(
                    0.0,
                    0.85,
                    uv.y
                );



                float alpha=
                mix(
                    0.72,
                    0.18,
                    bottomFade
                );



                gl_FragColor=
                vec4(
                    color,
                    alpha*uOpacity
                );

            }

            `,

        });




        const mesh =
        new THREE.Mesh(
            geometry,
            material
        );


        scene.add(mesh);




        const resize=()=>{

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );


            uniforms.uResolution.value.set(
                window.innerWidth,
                window.innerHeight
            );

        };




        const handleMouse=(event:MouseEvent)=>{


            targetMouse.x=
            event.clientX/
            window.innerWidth;


            targetMouse.y=
            1-
            (
                event.clientY/
                window.innerHeight
            );


        };




        window.addEventListener(
            "resize",
            resize
        );


        window.addEventListener(
            "mousemove",
            handleMouse
        );



        resize();



        let frame:number;



        const animate=()=>{


            uniforms.uTime.value=
            performance.now()/1000;



            mouse.lerp(
                targetMouse,
                0.04
            );


            renderer.render(
                scene,
                camera
            );



            frame=
            requestAnimationFrame(
                animate
            );


        };



        animate();




        return()=>{


            cancelAnimationFrame(
                frame
            );


            window.removeEventListener(
                "resize",
                resize
            );


            window.removeEventListener(
                "mousemove",
                handleMouse
            );



            geometry.dispose();

            material.dispose();

            renderer.dispose();


        };


    },[]);




    return(

        <canvas
            ref={canvasRef}
            className="MoltenMetalCanvas"
            aria-hidden="true"
        />

    );

}