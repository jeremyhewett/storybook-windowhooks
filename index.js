import React from 'react';
import sinon from 'sinon';

class Wrapper extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.element = props.story();
    this.childProps = {
      ref: ref => this.ref = ref,
      key: true
    };
    this.initialize();
  }

  initialize() {
    this.windowProps = {
      update: () => this.forceUpdate(),
      reset: () => {
        this.childProps.key = !this.childProps.key;
        this.initialize();
        this.forceUpdate();
      }
    };
    window[this.element.type.name] = this.windowProps;

    for (let key in this.props.config) {
      this.props.config[key].apply(this, key);
    }
  }

  render() {
    return (<this.element.type {...this.element.props} {...this.childProps}></this.element.type>);
  }
}

export class Input {
  constructor(defaultValue) {
    this.defaultValue = defaultValue;
  }

  apply(wrapper, key) {
    wrapper.childProps[key] = this.defaultValue;
    Object.defineProperty(wrapper.windowProps, key, {
      get: () => wrapper.childProps[key],
      set: (value) => {
        wrapper.childProps[key] = value;
        wrapper.windowProps.update();
      }
    });
  }
}

export class Action {
  constructor() { }

  apply(wrapper, key) {
    wrapper.windowProps[key] = (...args) => wrapper.ref[key](...args);
  }
}

export class Callback {
  constructor() { }

  apply(wrapper, key) {
    wrapper.windowProps[key] = sinon.spy();
    wrapper.childProps[key] = (e) => wrapper.windowProps[key](e);
  }
}

export class Literal {
  constructor(value) {
    this.value = value;
  }

  apply(wrapper, key) {
    wrapper.childProps[key] = this.value;
  }
}

export function windowHandles(config) {
  return (story) => {
    return <Wrapper story={story} config={{...config}} />;
  };
}