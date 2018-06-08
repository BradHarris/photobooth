import React from 'react';
import Webcam from 'react-webcam';

import WindowResponsive from '../components/WindowResponsive';
import Button from '../components/Button';

function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

class WebcamCapture extends React.Component {
  constructor() {
    super();

    this.state = {
      captureTimer: -1,
      captureBlob: null,
      resetTimer: 0
    };

    this.setRef = this.setRef.bind(this);
    this.capture = this.capture.bind(this);
    this.reset = this.reset.bind(this);
  }

  setRef(webcam) {
    this.webcam = webcam;
  }

  async capture() {
    for(let timer = 3; timer >= 0; timer--) {
      this.setState({ captureTimer: timer });

      await delay(850);
    }

    const imageSrc = this.webcam.getScreenshot();
    imageSrc.replace(/^data:image\/\w+;base64,/, '');

    const blob = new Blob([imageSrc], {type: 'image/base64'});

    this.setState({ captureBlob: imageSrc });

    const form = new FormData();
    form.append('image', blob, 'image.png');

    const options = {
      method: 'POST',
      body: form
    };

    const uploadStatus = await fetch('/upload', options);

    for(let timer = 10; timer >= 0; timer--) {
      if (this.state.captureTimer !== 0) {
        return;
      }

      this.setState({ resetTimer: timer });

      await delay(850);
    }

    if (this.state.captureTimer !== -1) {
      this.reset();
    }
  }

  reset() {
    this.setState({
      captureTimer: -1,
      captureBlob: null,
      resetTimer: 0
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

              background-repeat: no-repeat;
              background-color: white;
              background-position: center;
              background-size: contain;

              display: flex;
              flex-flow: row nowrap;
              align-items: flex-end;
              justify-content: center;

              font-size: 75px;
              font-weight: bold;
              color: rgba(255, 255, 255, 0.5);
              text-shadow: 0px 10px 20px rgba(0,0,0,0.5);
            }

            .capture-timer {
              position: absolute;
              bottom: 0px;
              left: 50%;
              transform: translate(-50%, 0px);

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
              screenshotFormat='image/png'
            />
          }
        </WindowResponsive>

        { this.state.captureTimer === -1 &&
          <Button
            onClick={this.capture}
          >
            Capture Photo
          </Button>
        }

        { this.state.captureTimer >= 0 &&
          <div className='capture-timer'>
            { this.state.captureTimer }
          </div>
        }

        { this.state.captureTimer === 0 &&
          <div
            className='captured-image'
            style={{
              backgroundImage: `url(${this.state.captureBlob})`
            }}
          >
            { this.state.resetTimer > 0 &&
              <Button
                onClick={this.reset}
              >
                Reset ({this.state.resetTimer})
              </Button>
            }
          </div>
        }
      </div>
    );
  }
}

export default WebcamCapture;
