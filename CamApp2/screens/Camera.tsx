import React from 'react';
import {RNCamera} from 'react-native-camera';
import * as RNFS from 'react-native-fs';
import makeDate from '../utils/makeDate';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
// import {useIsFocused} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

type CameraParamList = {
  state: {
    flash: string;
    zoom: number;
    autoFocus: string;
    autoFocusPoint: {
      normalized: {
        x: number;
        y: number;
      };
      drawRectPosition: {
        x: number;
        y: number;
      };
    };
    depth: number;
    type: any;
    whiteBalance: string;
  };
  type: any;
};

const flashModeOrder: {[key: string]: string} = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder: {[key: string]: string} = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const dirPath = `${RNFS.DocumentDirectoryPath}/images`;
const user = auth().currentUser;

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

export default class Camera extends React.Component<CameraParamList> {
  state: {[key: string]: any} = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    autoFocusPoint: {
      normalized: {x: 0.5, y: 0.5},
      drawRectPosition: {
        x: Dimensions.get('window').width * 0.5 - 32,
        y: Dimensions.get('window').height * 0.5 - 32,
      },
    },
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    images: 0,
  };
  componentDidMount() {
    return new Promise((resolve, reject) => {
      RNFS.readDir(dirPath)
        .then(result => {
          this.setState({
            images: result.length,
          });
          console.log('state', this.state.images);
          resolve(true);
        })
        .catch(error => {
          console.log('mount error', error);
          reject(error);
        });
    });
  }

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }
  touchToFocus(event: any) {
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

    this.setState({
      autoFocusPoint: {
        normalized: {x, y},
        drawRectPosition: {x: pageX, y: pageY},
      },
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
    });
  }

  setFocusDepth(depth: any) {
    this.setState({
      depth,
    });
  }

  // sendToFirebase = async (uri: string, u: any) => {
  //   const blob = await new Promise((resolve, reject) => {
  //     const xhr = new XMLHttpRequest();
  //     xhr.onload = function () {
  //       resolve(xhr.response);
  //     };
  //     xhr.onerror = function () {
  //       reject(new TypeError('Network request failed'));
  //     };
  //     xhr.responseType = 'blob';
  //     xhr.open('GET', uri, true);
  //     xhr.send(null);
  //   });

  //   const storageRef = storage().ref(
  //     `users/${u.uid}/image-` + String(this.state.images),
  //   );
  // const uploadTask = uploadBytesResumable(storageRef, blob);
  // const uploadTask = await storageRef.putFile(blob);

  // uploadTask.on('state_changed', taskSnapshot => {
  //   console.log(
  //     `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
  //   );
  // });

  // uploadTask.on(
  //   'state_changed',
  //   snapshot => {
  //     const progress =
  //       (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //     console.log('Upload is ' + progress + '% done');
  //     switch (snapshot.state) {
  //       case 'paused':
  //         console.log('Upload paused');
  //         break;
  //       case 'running':
  //         console.log('Upload is running');
  //         break;
  //     }
  //   },
  //   (error: any) => {
  //     console.error(error);
  //   },
  //   () => {
  //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
  //       console.log('File available at ', downloadURL);
  //     });
  //   },
  // );
  // };

  saveImage = async (filePath: string) => {
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

  takePicture = async () => {
    if (this.camera) {
      // take picture with options
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      // save to external source
      const extImg = storage().ref(
        `users/${user?.uid}/image-` + String(this.state.images),
      );
      await extImg.putFile(data.uri);
      // save picture to folder
      const saved = await this.saveImage(data.uri);
      this.setState({
        images: this.state.images + 1,
      });
      return saved;
    } else {
      console.warn('app cannot find the camera');
    }
  };

  checkFolder() {
    RNFS.readDir(dirPath).then(result => {
      console.log('GOT RESULT', result);
    });
  }

  async clearFolder() {
    try {
      await RNFS.unlink(dirPath);
      console.log('FOLDER DELETED');
    } catch (err: any) {
      console.log(err.message);
    }
  }

  renderCamera() {
    return (
      <>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={{flex: 1, justifyContent: 'space-between'}}
          type={this.state.type}
          flashMode={this.state.flash}
          autoFocus={this.state.autoFocus}
          autoFocusPointOfInterest={this.state.autoFocusPoint.normalized}
          zoom={this.state.zoom}
          whiteBalance={this.state.whiteBalance}
          focusDepth={this.state.depth}
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
            <TouchableOpacity
              style={styles.capture}
              onPress={this.takePicture.bind(this)}>
              <Text>SNAP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.capture}
              onPress={this.checkFolder.bind(this)}>
              <Text>FOLDER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.capture}
              onPress={this.clearFolder.bind(this)}>
              <Text>DELETE</Text>
            </TouchableOpacity>
            <Text style={{color: 'white'}}>{this.state.images}</Text>
          </View>
          <View style={styles.buttonView}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={this.toggleFacing.bind(this)}>
                <Text style={styles.flipText}> FLIP </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={this.toggleFlash.bind(this)}>
                <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={this.toggleWB.bind(this)}>
                <Text style={styles.flipText}>
                  {' '}
                  WB: {this.state.whiteBalance}{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
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
});
