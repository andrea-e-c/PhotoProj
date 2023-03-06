import React, {useState, useRef, useEffect} from 'react';
import {RNCamera} from 'react-native-camera';
import * as RNFS from 'react-native-fs';
import makeDate from '../utils/makeDate';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {getCurrentFolder, getFolderLength} from '../utils/getCurrentFolder';
import {useSelector, useDispatch} from 'react-redux';
import {addPaymentStatus} from '../redux/action';
import {Link} from '@react-navigation/native';

const flashModeOrder: {[key: string]: any} = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder: {[key: string]: any} = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

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

export default function Cam({
  navigation,
}: {
  navigation: any;
}): React.ReactElement {
  const [flash, setFlash] = useState<'auto' | 'off' | 'on' | 'torch'>('off');
  const [zoom, setZoom] = useState(0);
  const [autoFocus, setAutoFocus] = useState<'off' | 'on'>('on');
  const [autoFocusPoint, setAutoFocusPoint] = useState({
    normalized: {x: 0.5, y: 0.5},
    drawRectPosition: {
      x: Dimensions.get('window').width * 0.5 - 32,
      y: Dimensions.get('window').height * 0.5 - 32,
    },
  });
  const [depth, setDepth] = useState(0);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [wb, setWB] = useState<
    'auto' | 'sunny' | 'cloudy' | 'shadow' | 'fluorescent' | 'incandescent'
  >('auto');
  const [images, setImages] = useState(0);
  const [folderName, setFolderName] = useState('');

  const camRef = useRef(null);
  const isPaid = useSelector((state: any) => state.paid);
  const dispatch = useDispatch();

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
  }, []);

  useEffect(() => {
    if (images >= 27) {
      Alert.alert('time to check out!');
      navigation.navigate('Print');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const toggleFacing = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(flashModeOrder[flash]);
  };

  const toggleWB = () => {
    setWB(wbOrder[wb]);
  };

  const toggleFocus = () => {
    setAutoFocus(autoFocus === 'on' ? 'off' : 'on');
  };

  const touchToFocus = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const isPortrait = screenHeight > screenWidth;

    let x = pageX / screenWidth;
    let y = pageY / screenHeight;
    // Coordinate transform for portrait. See autoFocusPointOfInterest in docs for more info
    if (isPortrait) {
      x = pageY / screenHeight;
      y = -(pageX / screenWidth) + 1;
    }

    setAutoFocusPoint({
      normalized: {x: x, y: y},
      drawRectPosition: {x: pageX, y: pageY},
    });
  };

  //   const zoomOut = () => {
  //     setZoom(zoom - 0.1 < 0 ? 0 : zoom - 0.1);
  //   };

  //   const zoomIn = () => {
  //     setZoom(zoom + 0.1 > 1 ? 1 : zoom + 0.1);
  //   };

  //   const setFocusDepth = (d: number) => {
  //     setDepth(d);
  //   };

  const saveImage = async (filePath: string) => {
    try {
      // set new image name and filepath
      //new Date.valueOf
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

  const takePicture = async () => {
    if (camRef) {
      // take picture with options
      const options = {quality: 0.5, base64: true};
      const data = await camRef?.current?.takePictureAsync(options);
      // save to external source
      const extImg = storage().ref(
        `users/${user?.uid}/images/${folderName}/image-` + String(images),
      );
      await extImg.putFile(data.uri);
      // save picture to folder
      const saved = await saveImage(data.uri);
      setImages(images + 1);
      if (isPaid) {
        dispatch(addPaymentStatus(false));
      }
      return saved;
    } else {
      console.warn('app cannot find the camera');
    }
  };

  const checkFolder = () => {
    RNFS.readDir(dirPath).then(result => {
      console.log('GOT RESULT', result);
    });
  };

  async function clearFolder() {
    try {
      await RNFS.unlink(dirPath);
      console.log('FOLDER DELETED');
    } catch (err: any) {
      console.log(err.message);
    }
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={camRef}
        style={{flex: 1, justifyContent: 'space-between'}}
        type={type}
        flashMode={flash}
        autoFocus={autoFocus}
        autoFocusPointOfInterest={autoFocusPoint.normalized}
        zoom={zoom}
        whiteBalance={wb}
        focusDepth={depth}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      />
      <View>
        <View style={styles.camButton}>
          <View style={styles.countdown}>
            <Text style={styles.imgCountdown}>{27 - images}</Text>
          </View>
          <TouchableOpacity style={styles.capture} onPress={takePicture}>
            <Text>SNAP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.capture}>
            <Link to={{screen: 'Home'}}>
              <Text>Home</Text>
            </Link>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.capture} onPress={checkFolder}>
            <Text>FOLDER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.capture} onPress={clearFolder}>
            <Text>DELETE</Text>
          </TouchableOpacity> */}
        </View>
        <View style={styles.buttonView}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
              <Text style={styles.flipText}> FLIP </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={toggleFlash}>
              <Text style={styles.flipText}> FLASH: {flash} </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={toggleWB}>
              <Text style={styles.flipText}> WB: {wb} </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  camButton: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  buttonView: {
    flex: 0,
    height: 72,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  flipButton: {
    flex: 0,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'red',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  countdown: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  imgCountdown: {
    color: 'white',
    fontSize: 36,
  },
});
