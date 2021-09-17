precision mediump float;
uniform vec3 uColor;
//uniform sampler2D uTexture;

//varying vec2 vUv;
//varying float vRandom;
//varying float vElevation;

void main()
{
   // vec4 textureColor = texture2D(uTexture, vUv);
    //vec4 textureColor = texture2D(uColor, vUv);
    //textureColor.rgb *= vElevation * 2.0 + 0.8;

    gl_FragColor = vec4(uColor, 1.0);

}