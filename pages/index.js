import React from 'react';
import Webcam from 'react-webcam';

import WindowResponsive from '../components/WindowResponsive';
import WebcamCaptureButton from '../components/WebcamCaptureButton';

function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

class WebcamCapture extends React.Component {
  constructor() {
    super();

    this.state = {
      captureTimer: -1,
      captureBlob: null
    };

    this.setRef = this.setRef.bind(this);
    this.capture = this.capture.bind(this);
  }

  setRef(webcam) {
    this.webcam = webcam;
  }

  async capture() {
    for(let timer = 3; timer >= 0; timer--) {
      console.log(timer);
      this.setState({
        captureTimer: timer
      });

      await delay(1000);
    }

    this.setState({
      captureTimer: -1
    });

    const imageSrc = this.webcam.getScreenshot();

    this.setState({
      captureBlob: imageSrc
    });

    const form = new FormData();
    form.append('image', imageSrc, `image-${new Date()}`);

    // const headers = {
    //   'Accept': 'application/json, */*',
    //   'Content-Type': 'multipart/form-data'
    // };

    const options = {
      // headers,
      method: 'POST',
      body: form
    };

    const uploadtStatus = fetch('/upload', options);

    await delay(2000);
    this.setState({
      captureBlob: null
    });
  }

  render() {
    return (
      <div>
        <style jsx>
          {`
            .captured-image {
              position: absolute;
              top: 0px;
              left: 0px;
              width: 100%;
              height: 100%;
            }

            .capture-timer {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);

              font-size: 150px;
              font-weight: bold;
              color: rgba(255, 255, 255, 1);
              text-shadow: 0px 10px 20px rgba(0,0,0,0.5);
            }
          `}
        </style>

        <WindowResponsive>
          {(width, height) =>
            <Webcam
              ref={this.setRef}
              audio={false}
              height={height}
              width={width}
              screenshotFormat="image/png"
            />
          }
        </WindowResponsive>

        { this.state.captureTimer >= 0 &&
          <div className='capture-timer'>

            { this.state.captureTimer === 0 ?
              'SMILE' : this.state.captureTimer
            }
          </div>
        }
        { this.state.captureBlob &&
          <img className='captured-image' src={this.state.captureBlob} />
        }
        <WebcamCaptureButton
          onClick={this.capture}
        >
          Capture Photo
        </WebcamCaptureButton>
      </div>
    );
  }
}

export default WebcamCapture;
