import {h, Component} from "preact"
import {string, func, oneOfType} from "prop-types"

import omit from "lodash/omit"
import isFunction from "lodash/isFunction"
import waterfall from "p-waterfall"

import Loader from "common/component/Loader/Page"

import connect from "core/model/connect"

class ViewLoader extends Component {
  static propTypes = {
    component: oneOfType([string, func]).isRequired,
    onError: func // FIXME: Make it REQUIRED
  }

  static defaultProps = {
    onError: console.error
  }

  constructor(...args) {
    super(...args)

    this.state = {
      isReady: false,
      component: null
    }
  }

  componentWillMount() {
    const component = this.props.component

    waterfall([
      this.__onComponentLoaded,
      this.__onComponentReceived,
      this.__onComponentReady
    ], import(`module/${component}`)).catch(this.props.onError)
  }

  __onComponentLoaded = module => Promise.resolve(module.default || module)

  __onComponentReceived = component => new Promise((resolve, reject) => {
    if (!isFunction(component.getInitialProps)) {
      return resolve(component)
    }

    const onFulfilled = initials => resolve(connect(initials)(component))

    const ctx = omit(this.props, ["route", "component"])

    Promise.resolve(component.getInitialProps(ctx)).then(onFulfilled, reject)
  })

  __onComponentReady = component => this.setState({component, isReady: true})

  render(props) {
    const {isReady, component} = this.state

    return h(isReady ? component : Loader, props)
  }
}

export default ViewLoader
