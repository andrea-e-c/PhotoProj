import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react';
import {
  Camera,
  CameraDeviceFormat,
  CameraRuntimeError,
  sortFormats,
  useCameraDevices,
} from 'react-native-vision-camera';
import {View, Text} from 'react-native/types';
import {useAnimatedProps, useSharedValue} from 'react-native-reanimated';
import {useIsFocused} from '@react-navigation/native';

export default function Camera2(): React.ReactElement {
  const camera = useRef<Camera>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  const isFocused = useIsFocused();

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [enableNightMode, setEnableNightMode] = useState(false);

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo<CameraDeviceFormat[]>(() => {
    if (device?.formats == null) return [];
    return device.formats.sort(sortFormats);
  }, [device?.formats]);

  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front],
  );
  const supportsFlash = device?.hasFlash ?? false;

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 20);

  const cameraAnimatedPros = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);

  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );

  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
  }, []);
  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);
  const onFlashPressed = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);

  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);

  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);

  return (
    <View>
      <Text>Placeholder</Text>
    </View>
  );
}
