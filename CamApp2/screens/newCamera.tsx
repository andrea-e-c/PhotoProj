import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react';
import {
  Camera,
  CameraDeviceFormat,
  CameraRuntimeError,
  sortFormats,
  useCameraDevices,
  frameRateIncluded,
  PhotoFile,
  VideoFile,
  TakePhotoOptions,
  TakeSnapshotOptions,
} from 'react-native-vision-camera';
import {View, StyleSheet, Alert, TouchableOpacity, Text} from 'react-native';
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  interpolate,
  useAnimatedGestureHandler,
  Extrapolate,
} from 'react-native-reanimated';
import {useIsFocused} from '@react-navigation/native';
import {
  PinchGestureHandlerGestureEvent,
  PinchGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import {useIsForeground} from '../utils/useIsForeground';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {PressableOpacity} from 'react-native-pressable-opacity';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import * as RNFS from 'react-native-fs';
import makeDate from '../utils/makeDate';
import {getCurrentFolder, getFolderLength} from '../utils/getCurrentFolder';
import {useSelector, useDispatch} from 'react-redux';
import {addPaymentStatus} from '../redux/action';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const user = auth().currentUser;
const imgFolderRef = storage().ref(`users/${user?.uid}/images/`);
const dirPath = `${RNFS.DocumentDirectoryPath}/images`;
async function moveImg(filePath: string, newPath: string) {
  return new Promise((resolve, reject) => {
    RNFS.mkdir(dirPath).then(() => {
      RNFS.moveFile(filePath, newPath)
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          console.log('move file error', error);
          reject(error);
        });
    });
  });
}

// type Props = NativeStackScreenProps<Routes, 'CameraPage'>;

export default function Camera2({
  navigation,
}: {
  navigation: any;
}): React.ReactElement {
  const camera = useRef<Camera>(null);
  console.log('camera', camera);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);

  // Keeps track of how many images are left and where to store them
  const [images, setImages] = useState(0);
  const [folderName, setFolderName] = useState('');

  // State management
  const isPaid = useSelector((state: any) => state.paid);
  const dispatch = useDispatch();

  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  // is camera page active
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocused && isForeground;

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  // const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo<CameraDeviceFormat[]>(() => {
    if (device?.formats == null) {
      return [];
    }
    return device.formats.sort(sortFormats);
  }, [device?.formats]);

  const fps = 30;

  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front],
  );
  const supportsFlash = device?.hasFlash ?? false;

  const format = useMemo(() => {
    let result = formats;
    // find the first format that includes the given FPS
    return result.find(f =>
      f.frameRateRanges.some(r => frameRateIncluded(r, fps)),
    );
  }, [formats, fps]);

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, 20);

  const cameraAnimatedProps = useAnimatedProps(() => {
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
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsInitialized(true);
  }, []);
  const onMediaCaptured = useCallback((media: PhotoFile | VideoFile) => {
    console.log(`Media captured! ${JSON.stringify(media)}`);
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

  useEffect(() => {
    Camera.getMicrophonePermissionStatus().then(status =>
      setHasMicrophonePermission(status === 'authorized'),
    );
  }, []);

  useEffect(() => {
    const getStuff = async () => {
      const folders = await getCurrentFolder(imgFolderRef);
      if (folders.length === 0) {
        setFolderName(makeDate());
        setImages(0);
      } else {
        const folder = folders.pop();
        const name = folder.split('/');
        const tempName = name.pop();
        const imgList = await getFolderLength(storage().ref(folder));

        if (imgList.length === 27) {
          if (isPaid) {
            // Create a new folder
            setFolderName(makeDate());
            setImages(0);
          } else {
            // refer to the old folder
            setFolderName(tempName);
            setImages(imgList.length);
          }
        } else {
          // go back to where you left off;
          setFolderName(tempName);
          setImages(imgList.length);
        }
      }
    };
    getStuff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (images >= 27) {
      Alert.alert('time to check out!');
      navigation.navigate('Print');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const onPinchGesture = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    {startZoom?: number}
  >({
    onStart: (_, context: any) => {
      context.startZoom = zoom.value;
    },
    onActive: (event: any, context: any) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / 3, 1, 3],
        [-1, 0, 1],
        Extrapolate.CLAMP,
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP,
      );
    },
  });

  const saveImage = async (filePath: string) => {
    try {
      // set new image name and filepath
      const date = makeDate();
      const newImageName = `${date}.jpg`;
      const newFilepath = `${dirPath}/${newImageName}`;
      // move and save image to new filepath
      const imageMoved = await moveImg(filePath, newFilepath);
      return imageMoved;
    } catch (error) {
      console.log('error moving image', error);
    }
  };

  const takePhotoOptions = useMemo<TakePhotoOptions & TakeSnapshotOptions>(
    () => ({
      photoCodec: 'jpeg',
      qualityPrioritization: 'speed',
      flash: flash,
      quality: 90,
      skipMetadata: true,
    }),
    [flash],
  );

  const takePicture = async () => {
    console.log('snapped');
    if (camera) {
      // take picture with options
      const data = await camera?.current?.takePhoto(takePhotoOptions);
      // save to external source
      if (data) {
        const extImg = storage().ref(
          `users/${user?.uid}/images/${folderName}/image-` + String(images),
        );
        await extImg.putFile(data?.path);
        // save picture to folder
        const saved = await saveImage(data?.path);
        setImages(images + 1);
        if (isPaid) {
          dispatch(addPaymentStatus(false));
        }
        return saved;
      } else {
        Alert.alert('no data');
      }
    } else {
      console.warn('app cannot find the camera');
    }
  };

  return (
    <View style={styles.container}>
      {device != null && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
              {/* <ColorMatrix
                matrix={concatColorMatrices(
                  saturate(-0.9),
                  contrast(5.2),
                  invert(),
                )}> */}
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                fps={fps}
                hdr={false}
                lowLightBoost={false}
                isActive={isActive}
                onInitialized={onInitialized}
                onError={onError}
                enableZoomGesture={false}
                animatedProps={cameraAnimatedProps}
                photo={true}
                video={true}
                audio={hasMicrophonePermission}
                frameProcessor={undefined}
                orientation="portrait"
                frameProcessorFps={1}
              />
              {/* </ColorMatrix> */}
            </TapGestureHandler>
          </Reanimated.View>
        </PinchGestureHandler>
      )}
      <Text style={styles.imgCountdown}>{27 - images}</Text>
      <View style={styles.captureButtonPortrait}>
        <TouchableOpacity onPress={takePicture} style={styles.button}>
          <Text>SNAP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightButtonRow}>
        {supportsCameraFlipping && (
          <PressableOpacity
            style={styles.button}
            onPress={onFlipCameraPressed}
            disabledOpacity={0.4}>
            <IonIcon name="camera-reverse" color="white" size={24} />
          </PressableOpacity>
        )}
        {supportsFlash && (
          <PressableOpacity
            style={styles.button}
            onPress={onFlashPressed}
            disabledOpacity={0.4}>
            <IonIcon
              name={flash === 'on' ? 'flash' : 'flash-off'}
              color="white"
              size={24}
            />
          </PressableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
  captureButtonPortrait: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
  },
  captureButtonHorizontal: {
    position: 'absolute',
    justifySelf: 'center',
    right: 20,
  },
  button: {
    marginBottom: 15,
    marginTop: 25,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdown: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  imgCountdown: {
    color: 'white',
    fontSize: 36,
    position: 'absolute',
    left: 40,
    bottom: 40,
  },
});
