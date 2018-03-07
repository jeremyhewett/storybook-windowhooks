import React from 'react';
import sinon from 'sinon';

class Wrapper extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.story = props.story();

    this.state = {};

    this.handles = {
      reset: () => {
        this.setState({ key: !this.state.key });
        this.initialize();
        this.forceUpdate();
      },
    };

    window[this.story.type.name] = this.handles;
    for (const key of Object.keys(this.props.config)) {
      this.props.config[key].expose(this, key);
    }

  }

  componentDidMount() {
    this.initialize();
  }

  initialize() {
    for (const key of Object.keys(this.props.config)) {
      this.props.config[key].init(this, key);
    }
  }

  isPropUndefinedOrDefault = key =>
    typeof this.story.props[key] === 'undefined' ||
    (this.story.type.defaultProps && this.story.props[key] === this.story.type.defaultProps[key]);

  render() {
    return <this.story.type {...this.story.props} {...this.state} ref={r => this.ref = r}/>;
  }
}

export class Input {
  constructor(initialValue) {
    this.initialValue = initialValue;
  }

  expose(wrapper, key) {
    Object.defineProperty(wrapper.handles, key, {
      get: () => wrapper.state[key],
      set: value => {
        wrapper.setState({ [key]: value });
      },
    });
  }

  init(wrapper, key) {
    wrapper.setState({ [key]: wrapper.isPropUndefinedOrDefault(key) && typeof this.initialValue !== "undefined"
      ? this.initialValue
      : wrapper.story.props[key] });
  }
}

export class Action {
  expose(wrapper, key) {
    wrapper.handles[key] = (...args) => wrapper.ref[key](...args);
  }

  init(wrapper, key) {}
}

export class Callback {
  constructor(fake) {
    this.fake = fake;
  }

  expose(wrapper, key) {
    Object.defineProperty(wrapper.handles, key, {
      get: () => this.spy
    });
  }

  init(wrapper, key) {
    this.spy = sinon.spy(wrapper.story.props[key] || this.fake);
    wrapper.setState({ [key]: (...args) => this.spy(...args) });
  }
}

export function windowHandles(config) {
  return story => <Wrapper story={story} config={{ ...config }} />;
}
