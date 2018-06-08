import React from 'react';

class WebcamCaptureButton extends React.Component {
  constructor() {
    super();

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    return (
      <React.Fragment>
        <style jsx>
          {`
            button {
              position: absolute;
              bottom: 30px;
              left: 50%;
              transform: translate(-50%, 0px);

              background-color: rgba(255, 255, 255, 0.25);
              border-radius: 4px;
              border: none;
              color: rgba(0, 0, 0, 0.5);
              font-size: 32px;
              font-weight: bold;
              outline: none;
              padding: 30px 35px;
              box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.5);
              cursor: pointer;

              transition:
                box-shadow 200ms cubic-bezier(0.68, -0.55, 0.27, 1.55),
                transform 200ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
            }

            button:active {
              box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.5);
              transform: translate(-50%, 10px);
            }
          `}
        </style>

        <button
          className='capture-button'
          onClick={this.onClick}
        >
          {this.props.children}
        </button>
      </React.Fragment>
    );
  }
}

export default WebcamCaptureButton;
