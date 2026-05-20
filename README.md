# rn-mesher-test

Ejemplo de app Expo + React Native que integra `react-native-arkit-mesh-scanner` para escaneo LiDAR y generación de mallas OBJ.

## Requisitos

- iOS 14+
- iPhone/iPad Pro con sensor LiDAR
- Dev Client o EAS Build (no funciona en Expo Go)

## Ejecutar

```bash
npm install
npx expo prebuild -p ios
npx expo run:ios
```

## Qué hace la app

- Comprueba si el dispositivo soporta LiDAR.
- Muestra la vista `ARKitMeshScanner`.
- Permite iniciar/detener escaneo.
- Permite exportar la malla en formato OBJ.
