import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type MeshStats = {
  anchorCount: number;
  vertexCount: number;
  faceCount: number;
};

type ARKitMeshScannerRef = {
  startScanning: () => void;
  stopScanning: () => void;
  exportMesh: (filename: string) => Promise<{ path: string }>;
};

const scannerPackage =
  Platform.OS === 'ios' ? require('react-native-arkit-mesh-scanner') : null;

const ARKitMeshScanner = scannerPackage?.ARKitMeshScanner as
  | React.ComponentType<any>
  | undefined;

const isLiDARSupported = scannerPackage?.isLiDARSupported as
  | (() => Promise<boolean>)
  | undefined;

export default function App() {
  const scannerRef = useRef<ARKitMeshScannerRef>(null);
  const [isCheckingSupport, setIsCheckingSupport] = useState(Platform.OS === 'ios');
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState<MeshStats | null>(null);
  const [exportPath, setExportPath] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkSupport = async () => {
      if (!isLiDARSupported) {
        if (mounted) {
          setIsCheckingSupport(false);
          setIsSupported(false);
        }
        return;
      }

      try {
        const supported = await isLiDARSupported();
        if (mounted) {
          setIsSupported(supported);
        }
      } catch {
        if (mounted) {
          setIsSupported(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingSupport(false);
        }
      }
    };

    checkSupport();

    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleScan = () => {
    if (isScanning) {
      scannerRef.current?.stopScanning();
      setIsScanning(false);
      return;
    }

    scannerRef.current?.startScanning();
    setIsScanning(true);
  };

  const handleExport = async () => {
    try {
      const suffix = Math.random().toString(36).slice(2, 8);
      const result = await scannerRef.current?.exportMesh(`scan-${Date.now()}-${suffix}`);
      if (result?.path) {
        setExportPath(result.path);
        Alert.alert('Malla exportada', result.path);
      }
    } catch {
      Alert.alert('Error', 'No se pudo exportar la malla.');
    }
  };

  if (Platform.OS !== 'ios') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>LiDAR Mesh Scanner</Text>
        <Text style={styles.message}>Este ejemplo requiere iOS con sensor LiDAR.</Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (isCheckingSupport) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Comprobando soporte LiDAR...</Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (!isSupported || !ARKitMeshScanner) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>LiDAR no soportado</Text>
        <Text style={styles.message}>
          Usa un iPhone/iPad Pro compatible con LiDAR para escanear mallas.
        </Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ARKitMeshScanner
        ref={scannerRef}
        style={styles.scanner}
        showMesh
        meshColor="#00FFFF"
        onMeshUpdate={setStats}
      />
      <View style={styles.controls}>
        <Text style={styles.title}>Escáner LiDAR</Text>
        <Text style={styles.message}>
          {`Anchors: ${stats?.anchorCount ?? 0} | Vértices: ${stats?.vertexCount ?? 0} | Caras: ${
            stats?.faceCount ?? 0
          }`}
        </Text>
        {exportPath ? <Text style={styles.path}>Último OBJ: {exportPath}</Text> : null}
        <Pressable style={styles.button} onPress={handleToggleScan}>
          <Text style={styles.buttonText}>{isScanning ? 'Detener escaneo' : 'Iniciar escaneo'}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={handleExport}>
          <Text style={styles.buttonText}>Exportar OBJ</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  scanner: {
    flex: 1,
  },
  controls: {
    padding: 16,
    backgroundColor: '#1b2030',
    gap: 10,
  },
  centered: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: '#0f1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: '#d6dae6',
    textAlign: 'center',
  },
  path: {
    color: '#8dd7ff',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#2f86ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: '#4b5471',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
