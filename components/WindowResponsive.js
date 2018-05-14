import React from 'react';

class WindowResponsive extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      height: 0,
      width: 0
    }

    this.onWindowResize = this.onWindowResize.bind(this);
  }

  componentDidMount() {
    this.onWindowResize();

    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
      this.setState({
          height: window.innerHeight,
          width: window.innerWidth
      });
  }

  setRef(webcam) {
    this.webcam = webcam;
  }

  capture() {
    const imageSrc = this.webcam.getScreenshot();
    console.log(imageSrc);
  }

  render() {
    const {
      height,
      width
    } = this.state;

    return this.props.children(width, height);
  }
}

export default WindowResponsive;
